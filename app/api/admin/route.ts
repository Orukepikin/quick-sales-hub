import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

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

    const [recentOrders, users, listings, deliveries, roleDistribution] = await Promise.all([
      prisma.order.findMany({
        take: 25,
        orderBy: { createdAt: "desc" },
        include: {
          listing: { select: { id: true, title: true, images: true } },
          buyer: { select: { id: true, name: true, email: true } },
          seller: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.user.findMany({
        take: 50,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          isVerified: true,
          isBanned: true,
          createdAt: true,
          _count: { select: { listings: true } },
        },
      }),
      prisma.listing.findMany({
        take: 75,
        orderBy: { createdAt: "desc" },
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              email: true,
              isVerified: true,
            },
          },
        },
      }),
      prisma.delivery.findMany({
        take: 50,
        orderBy: { createdAt: "desc" },
        include: {
          driver: { select: { id: true, name: true, email: true } },
          order: {
            include: {
              listing: { select: { id: true, title: true } },
              buyer: { select: { id: true, name: true, email: true } },
              seller: { select: { id: true, name: true, email: true } },
            },
          },
        },
      }),
      prisma.user.groupBy({
        by: ["role"],
        _count: true,
      }),
    ]);

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
