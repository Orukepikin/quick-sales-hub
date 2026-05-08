import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { generateTrackingCode } from "@/lib/utils";
import { createDeliverySchema, updateDeliverySchema } from "@/lib/validations";

// GET /api/logistics — Get deliveries (filtered by role)
export async function GET(req: NextRequest) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { role: true, isVerified: true },
    });

    let where: any = {};

    if (currentUser?.role === "DRIVER") {
      if (!currentUser.isVerified) {
        return NextResponse.json({ error: "Driver verification pending" }, { status: 403 });
      }
      where = {
        OR: [
          { driverId: payload.userId },
          { status: "PENDING", driverId: null }, // Available jobs
        ],
      };
    } else if (currentUser?.role !== "ADMIN") {
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
            buyer: { select: { name: true, location: true, phone: true } },
            seller: { select: { name: true, location: true, phone: true } },
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

    const body = await req.json();
    const { orderId, pickupAddress, dropoffAddress, price } =
      createDeliverySchema.parse(body);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        listing: { select: { id: true, title: true } },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    if (
      payload.role !== "ADMIN" &&
      order.buyerId !== payload.userId &&
      order.sellerId !== payload.userId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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

    const verifiedDrivers = await prisma.user.findMany({
      where: { role: "DRIVER", isVerified: true, isBanned: false },
      select: { id: true },
      take: 100,
    });

    if (verifiedDrivers.length > 0) {
      await prisma.notification.createMany({
        data: verifiedDrivers.map((driver) => ({
          userId: driver.id,
          title: "New delivery request",
          body: `${order.listing?.title || "An item"} needs delivery. Open Driver Dashboard to accept.`,
          type: "driver",
          data: { deliveryId: delivery.id, orderId, listingId: order.listingId, screen: "driver" },
        })),
      });
    }

    await prisma.notification.create({
      data: {
        userId: payload.userId,
        title: "Delivery requested",
        body: "Verified drivers can now accept your delivery request.",
        type: "driver",
        data: { deliveryId: delivery.id, orderId, listingId: order.listingId, screen: "driver" },
      },
    });

    return NextResponse.json({ delivery }, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
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

    const body = await req.json();
    const { deliveryId, status, price } = updateDeliverySchema.parse(body);

    const currentUser = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { role: true, isVerified: true },
    });

    const existing = await prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: { order: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Delivery not found" },
        { status: 404 }
      );
    }

    if (currentUser?.role === "DRIVER") {
      if (!currentUser.isVerified) {
        return NextResponse.json({ error: "Driver verification pending" }, { status: 403 });
      }
      if (status === "ACCEPTED" && existing.driverId && existing.driverId !== payload.userId) {
        return NextResponse.json({ error: "Delivery already accepted" }, { status: 409 });
      }

      if (status !== "ACCEPTED" && existing.driverId !== payload.userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    } else if (currentUser?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

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
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error("Update delivery error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
