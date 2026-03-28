import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { createOrderSchema } from "@/lib/validations";

// GET /api/orders
export async function GET(req: NextRequest) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const where =
      payload.role === "ADMIN"
        ? {}
        : {
            OR: [
              { buyerId: payload.userId },
              { sellerId: payload.userId },
            ],
          };

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        listing: {
          select: { id: true, title: true, images: true, price: true },
        },
        buyer: {
          select: { id: true, name: true, avatar: true },
        },
        seller: {
          select: { id: true, name: true, avatar: true },
        },
        payment: true,
        delivery: true,
      },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/orders
export async function POST(req: NextRequest) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = createOrderSchema.parse(body);

    const listing = await prisma.listing.findUnique({
      where: { id: validated.listingId },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    if (listing.sellerId === payload.userId) {
      return NextResponse.json(
        { error: "Cannot buy your own listing" },
        { status: 400 }
      );
    }

    const order = await prisma.order.create({
      data: {
        listingId: validated.listingId,
        buyerId: payload.userId,
        sellerId: listing.sellerId,
        amount: validated.amount,
        notes: validated.notes,
      },
      include: {
        listing: { select: { title: true } },
        buyer: { select: { name: true } },
      },
    });

    // Notify seller
    await prisma.notification.create({
      data: {
        userId: listing.sellerId,
        title: "New Order!",
        body: `${order.buyer.name} placed an order for ${order.listing.title}`,
        type: "order",
        data: { orderId: order.id },
      },
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error("Create order error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
