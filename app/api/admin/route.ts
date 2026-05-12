import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

function parseDriverVerification(bio?: string | null) {
  if (!bio?.includes('"driverVerification"')) return null;
  try {
    return JSON.parse(bio).driverVerification || null;
  } catch {
    return null;
  }
}

// GET /api/admin/stats
export async function GET(req: NextRequest) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload || payload.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [
      totalUsers,
      totalListings,
      activeListings,
      totalOrders,
      totalRevenue,
      pendingDisputes,
      newUsersThisWeek,
      newListingsThisWeek,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.listing.count(),
      prisma.listing.count({ where: { status: "ACTIVE" } }),
      prisma.order.count(),
      prisma.payment.aggregate({
        where: { status: "COMPLETED" },
        _sum: { fee: true },
      }),
      prisma.order.count({ where: { status: "DISPUTED" } }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.listing.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    const [recentOrders, users, listings, deliveries, driverUsers, roleDistribution] = await Promise.all([
      prisma.order.findMany({
        take: 100,
        orderBy: { createdAt: "desc" },
        include: {
          listing: { select: { id: true, title: true, images: true, location: true, category: true } },
          buyer: { select: { id: true, name: true, email: true, phone: true, location: true } },
          seller: { select: { id: true, name: true, email: true, phone: true, location: true } },
          delivery: true,
          payment: true,
          review: true,
        },
      }),
      prisma.user.findMany({
        take: 100,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          avatar: true,
          bio: true,
          location: true,
          rating: true,
          totalRatings: true,
          isVerified: true,
          isBanned: true,
          createdAt: true,
          _count: { select: { listings: true } },
        },
      }),
      prisma.listing.findMany({
        take: 150,
        orderBy: { createdAt: "desc" },
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              location: true,
              isVerified: true,
            },
          },
          _count: { select: { orders: true, conversations: true, savedBy: true } },
        },
      }),
      prisma.delivery.findMany({
        take: 100,
        orderBy: { createdAt: "desc" },
        include: {
          driver: { select: { id: true, name: true, email: true, phone: true, rating: true } },
          order: {
            include: {
              listing: { select: { id: true, title: true, images: true, location: true } },
              buyer: { select: { id: true, name: true, email: true, phone: true, location: true } },
              seller: { select: { id: true, name: true, email: true, phone: true, location: true } },
            },
          },
        },
      }),
      prisma.user.findMany({
        where: {
          role: "DRIVER",
          bio: { contains: "driverVerification" },
        },
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          bio: true,
          isVerified: true,
          isBanned: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.user.groupBy({
        by: ["role"],
        _count: true,
      }),
    ]);

    const driverApplications = driverUsers.map((driver) => ({
      ...driver,
      verification: parseDriverVerification(driver.bio),
      bio: undefined,
    }));

    return NextResponse.json({
      stats: {
        totalUsers,
        totalListings,
        activeListings,
        totalOrders,
        totalRevenue: totalRevenue._sum.fee || 0,
        pendingDisputes,
        newUsersThisWeek,
        newListingsThisWeek,
      },
      recentOrders,
      users,
      listings,
      deliveries,
      driverApplications,
      roleDistribution,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload || payload.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const action = String(body.action || "");

    if (action === "approveListing") {
      const listing = await prisma.listing.update({
        where: { id: body.listingId },
        data: { status: "ACTIVE" },
      });
      await prisma.notification.create({
        data: {
          userId: listing.sellerId,
          title: "Listing approved",
          body: `${listing.title} is now live on Quick Sales Hub.`,
          type: "listing",
          data: { listingId: listing.id, status: "ACTIVE" },
        },
      });
      return NextResponse.json({ listing });
    }

    if (action === "setListingStatus") {
      const listing = await prisma.listing.update({
        where: { id: body.listingId },
        data: { status: body.status },
      });
      await prisma.notification.create({
        data: {
          userId: listing.sellerId,
          title: `Listing ${String(body.status || "").toLowerCase()}`,
          body: `${listing.title} status is now ${body.status}.`,
          type: "listing",
          data: { listingId: listing.id, status: body.status },
        },
      });
      return NextResponse.json({ listing });
    }

    if (action === "setOrderStatus") {
      const order = await prisma.order.update({
        where: { id: body.orderId },
        data: { status: body.status },
        include: { listing: { select: { title: true } } },
      });
      await prisma.notification.createMany({
        data: [order.buyerId, order.sellerId].map((userId) => ({
          userId,
          title: "Order status updated",
          body: `${order.listing?.title || "Your order"} is now ${order.status}.`,
          type: "order",
          data: { orderId: order.id, status: order.status },
        })),
      });
      return NextResponse.json({ order });
    }

    if (action === "setDeliveryStatus") {
      const delivery = await prisma.delivery.update({
        where: { id: body.deliveryId },
        data: { status: body.status },
        include: { order: true },
      });
      if (body.status === "DELIVERED") {
        await prisma.order.update({
          where: { id: delivery.orderId },
          data: { status: "DELIVERED" },
        });
      }
      await prisma.notification.createMany({
        data: [delivery.order.buyerId, delivery.order.sellerId].map((userId) => ({
          userId,
          title: "Delivery status updated",
          body: `Delivery ${delivery.trackingCode || delivery.id.slice(0, 8)} is now ${delivery.status}.`,
          type: "driver",
          data: { deliveryId: delivery.id, orderId: delivery.orderId, status: delivery.status },
        })),
      });
      return NextResponse.json({ delivery });
    }

    if (action === "approveDriver") {
      const user = await prisma.user.findUnique({ where: { id: body.userId }, select: { bio: true } });
      const verification = parseDriverVerification(user?.bio);
      const nextBio = JSON.stringify({
        driverVerification: {
          ...(verification || {}),
          status: "approved",
          approvedAt: new Date().toISOString(),
        },
      });
      const updated = await prisma.user.update({
        where: { id: body.userId },
        data: { role: "DRIVER", isVerified: true, bio: nextBio },
      });
      await prisma.notification.create({
        data: {
          userId: updated.id,
          title: "Driver verified",
          body: "Your driver account has been approved. You can now accept delivery jobs.",
          type: "driver",
          data: { status: "approved", screen: "driver" },
        },
      });
      return NextResponse.json({ user: updated });
    }

    if (action === "rejectDriver") {
      const reason = String(body.reason || "Your documents could not be approved. Please update and resubmit.");
      const user = await prisma.user.findUnique({ where: { id: body.userId }, select: { bio: true } });
      const verification = parseDriverVerification(user?.bio);
      const nextBio = JSON.stringify({
        driverVerification: {
          ...(verification || {}),
          status: "rejected",
          rejectedAt: new Date().toISOString(),
          reason,
        },
      });
      const updated = await prisma.user.update({
        where: { id: body.userId },
        data: { isVerified: false, bio: nextBio },
      });
      await prisma.notification.create({
        data: {
          userId: updated.id,
          title: "Driver verification needs update",
          body: reason,
          type: "driver",
          data: { status: "rejected", screen: "driver" },
        },
      });
      return NextResponse.json({ user: updated });
    }

    if (action === "rejectListing") {
      const listing = await prisma.listing.update({
        where: { id: body.listingId },
        data: { status: "REJECTED" },
      });
      await prisma.notification.create({
        data: {
          userId: listing.sellerId,
          title: "Listing needs review",
          body: `${listing.title} was not approved. Please update it and try again.`,
          type: "listing",
          data: { listingId: listing.id, status: "REJECTED" },
        },
      });
      return NextResponse.json({ listing });
    }

    if (action === "verifyUser") {
      const user = await prisma.user.update({
        where: { id: body.userId },
        data: { isVerified: true },
      });
      return NextResponse.json({ user });
    }

    if (action === "banUser") {
      const user = await prisma.user.update({
        where: { id: body.userId },
        data: { isBanned: true },
      });
      return NextResponse.json({ user });
    }

    if (action === "unbanUser") {
      const user = await prisma.user.update({
        where: { id: body.userId },
        data: { isBanned: false },
      });
      return NextResponse.json({ user });
    }

    return NextResponse.json({ error: "Unknown admin action" }, { status: 400 });
  } catch (error) {
    console.error("Admin action error:", error);
    return NextResponse.json(
      { error: "Admin action failed" },
      { status: 500 }
    );
  }
}
