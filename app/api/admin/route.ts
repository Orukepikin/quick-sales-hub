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

    // Recent orders
    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        listing: { select: { title: true } },
        buyer: { select: { name: true } },
        seller: { select: { name: true } },
      },
    });

    // User role distribution
    const roleDistribution = await prisma.user.groupBy({
      by: ["role"],
      _count: true,
    });

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
