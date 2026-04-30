import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword, signToken } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

const allowedRoles = new Set(["BUYER", "SELLER", "DRIVER"]);

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    const accessToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (!accessToken) {
      return NextResponse.json({ error: "Supabase access token required" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const requestedRole = String(body.role || "BUYER").toUpperCase();
    const role = allowedRoles.has(requestedRole) ? requestedRole : "BUYER";

    const { data, error } = await supabaseAdmin.auth.getUser(accessToken);
    if (error || !data.user?.email) {
      return NextResponse.json({ error: "Invalid Google session" }, { status: 401 });
    }

    const googleUser = data.user;
    const email = googleUser.email as string;
    const name =
      googleUser.user_metadata?.full_name ||
      googleUser.user_metadata?.name ||
      email.split("@")[0];
    const avatar = googleUser.user_metadata?.avatar_url || null;

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name,
        avatar,
        role: role as any,
        isVerified: role === "DRIVER" ? false : undefined,
      },
      create: {
        name,
        email,
        avatar,
        role: role as any,
        isVerified: role !== "DRIVER",
        password: await hashPassword(`oauth:${googleUser.id}:${Date.now()}`),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatar: true,
        bio: true,
        location: true,
        isVerified: true,
        isBanned: true,
        rating: true,
        totalRatings: true,
      },
    });

    if (user.isBanned) {
      return NextResponse.json(
        { error: "Your account has been suspended. Contact support." },
        { status: 403 }
      );
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const { isBanned: _, ...safeUser } = user;
    return NextResponse.json({ user: safeUser, token });
  } catch (error) {
    console.error("OAuth login error:", error);
    return NextResponse.json(
      { error: "Google authentication failed" },
      { status: 500 }
    );
  }
}
