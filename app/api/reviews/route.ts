import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { createReviewSchema } from "@/lib/validations";

// GET /api/reviews?userId=xxx
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");

    const where = userId ? { revieweeId: userId } : {};

    const reviews = await prisma.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        reviewer: {
          select: { id: true, name: true, avatar: true },
        },
        order: {
          select: {
            listing: { select: { title: true } },
          },
        },
      },
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error("Get reviews error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/reviews
export async function POST(req: NextRequest) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = createReviewSchema.parse(body);

    const order = await prisma.order.findUnique({
      where: { id: validated.orderId },
    });

    if (!order || order.status !== "DELIVERED") {
      return NextResponse.json(
        { error: "Can only review delivered orders" },
        { status: 400 }
      );
    }

    // Determine reviewee (if buyer reviews, reviewee is seller and vice versa)
    const revieweeId =
      order.buyerId === payload.userId ? order.sellerId : order.buyerId;

    const review = await prisma.review.create({
      data: {
        orderId: validated.orderId,
        reviewerId: payload.userId,
        revieweeId,
        rating: validated.rating,
        comment: validated.comment,
      },
    });

    // Update user's average rating
    const allReviews = await prisma.review.findMany({
      where: { revieweeId },
      select: { rating: true },
    });

    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await prisma.user.update({
      where: { id: revieweeId },
      data: {
        rating: Math.round(avgRating * 10) / 10,
        totalRatings: allReviews.length,
      },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error("Create review error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
