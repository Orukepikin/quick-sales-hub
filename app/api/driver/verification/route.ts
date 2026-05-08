import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { driverVerificationSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { isVerified: true, bio: true, role: true },
    });

    return NextResponse.json({
      status: user?.isVerified ? "approved" : user?.bio?.includes('"driverVerification"') ? "pending" : "not_submitted",
      isVerified: Boolean(user?.isVerified),
      details: user?.bio?.includes('"driverVerification"') ? "" : user?.bio || "",
    });
  } catch (error) {
    console.error("Get driver verification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = driverVerificationSchema.parse(body);
    const verificationRecord = {
      driverVerification: {
        status: "pending",
        submittedAt: new Date().toISOString(),
        ...validated,
      },
    };

    await prisma.user.update({
      where: { id: payload.userId },
      data: {
        role: "DRIVER",
        isVerified: false,
        phone: validated.phone,
        bio: JSON.stringify(verificationRecord),
      },
    });

    await prisma.notification.create({
      data: {
        userId: payload.userId,
        title: "Driver verification submitted",
        body: "Your documents are queued for review. You will be notified when approved.",
        type: "driver",
        data: { status: "pending" },
      },
    });

    return NextResponse.json({ status: "pending" }, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error("Submit driver verification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
