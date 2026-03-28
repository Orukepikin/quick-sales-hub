import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { generateTrackingCode } from "@/lib/utils";

// GET /api/logistics — Get deliveries (filtered by role)
export async function GET(req: NextRequest) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let where: any = {};

    if (payload.role === "DRIVER") {
      where = {
        OR: [
          { driverId: payload.userId },
          { status: "PENDING", driverId: null }, // Available jobs
        ],
      };
    } else if (payload.role !== "ADMIN") {
      where = {
        order: {
          OR: [
            { buyerId: payload.userId },
            { sellerId: payload.userId },
          ],
        },
      };
    }

    const deliveries = await prisma.delivery.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        order: {
          include: {
            listing: { select: { title: true } },
            buyer: { select: { name: true, location: true } },
            seller: { select: { name: true, location: true } },
          },
        },
        driver: {
          select: { id: true, name: true, phone: true, rating: true },
        },
      },
    });

    return NextResponse.json({ deliveries });
  } catch (error) {
    console.error("Get deliveries error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/logistics — Request a delivery
export async function POST(req: NextRequest) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId, pickupAddress, dropoffAddress, price } = await req.json();

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    const delivery = await prisma.delivery.create({
      data: {
        orderId,
        pickupAddress,
        dropoffAddress,
        price: price || 0,
        trackingCode: generateTrackingCode(),
      },
    });

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "CONFIRMED" },
    });

    return NextResponse.json({ delivery }, { status: 201 });
  } catch (error) {
    console.error("Create delivery error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/logistics — Update delivery status (driver accepts, picks up, delivers)
export async function PATCH(req: NextRequest) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { deliveryId, status, price } = await req.json();

    const updateData: any = { status };

    if (status === "ACCEPTED") {
      updateData.driverId = payload.userId;
      if (price) updateData.price = price;
    }
    if (status === "PICKED_UP") updateData.pickedUpAt = new Date();
    if (status === "DELIVERED") {
      updateData.deliveredAt = new Date();
    }

    const delivery = await prisma.delivery.update({
      where: { id: deliveryId },
      data: updateData,
    });

    // If delivered, update order and release escrow payment
    if (status === "DELIVERED") {
      await prisma.order.update({
        where: { id: delivery.orderId },
        data: { status: "DELIVERED" },
      });

      await prisma.payment.updateMany({
        where: { orderId: delivery.orderId, status: "ESCROW" },
        data: { status: "COMPLETED" },
      });
    }

    if (status === "IN_TRANSIT") {
      await prisma.order.update({
        where: { id: delivery.orderId },
        data: { status: "IN_TRANSIT" },
      });
    }

    return NextResponse.json({ delivery });
  } catch (error) {
    console.error("Update delivery error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
