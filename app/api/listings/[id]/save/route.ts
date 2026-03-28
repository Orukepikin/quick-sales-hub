import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

// POST /api/listings/[id]/save — Save listing
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.savedListing.create({
      data: {
        userId: payload.userId,
        listingId: params.id,
      },
    });

    await prisma.listing.update({
      where: { id: params.id },
      data: { saves: { increment: 1 } },
    });

    return NextResponse.json({ message: "Listing saved" });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Already saved" },
        { status: 400 }
      );
    }
    console.error("Save listing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/listings/[id]/save — Unsave listing
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.savedListing.delete({
      where: {
        userId_listingId: {
          userId: payload.userId,
          listingId: params.id,
        },
      },
    });

    await prisma.listing.update({
      where: { id: params.id },
      data: { saves: { decrement: 1 } },
    });

    return NextResponse.json({ message: "Listing unsaved" });
  } catch (error) {
    console.error("Unsave listing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
