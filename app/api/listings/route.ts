import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { createListingSchema } from "@/lib/validations";
import { Prisma } from "@prisma/client";

// GET /api/listings — Browse listings with filters
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const category = searchParams.get("category");
    const location = searchParams.get("location");
    const search = searchParams.get("search");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const sort = searchParams.get("sort") || "newest";
    const promoted = searchParams.get("promoted");

    const where: Prisma.ListingWhereInput = {
      status: "ACTIVE",
    };

    if (category) where.category = category;
    if (location) where.location = location;
    if (promoted === "true") where.isPromoted = true;

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    let orderBy: Prisma.ListingOrderByWithRelationInput = { createdAt: "desc" };
    if (sort === "price_low") orderBy = { price: "asc" };
    if (sort === "price_high") orderBy = { price: "desc" };
    if (sort === "popular") orderBy = { views: "desc" };

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        orderBy: [
          { isPromoted: "desc" }, // Promoted listings first
          orderBy,
        ],
        skip: (page - 1) * limit,
        take: limit,
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              avatar: true,
              isVerified: true,
              rating: true,
            },
          },
        },
      }),
      prisma.listing.count({ where }),
    ]);

    return NextResponse.json({
      listings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get listings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/listings — Create a new listing
export async function POST(req: NextRequest) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = createListingSchema.parse(body);

    const listing = await prisma.listing.create({
      data: {
        ...validated,
        sellerId: payload.userId,
        status: "ACTIVE", // Auto-approve for now; change to PENDING for moderation
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            avatar: true,
            isVerified: true,
          },
        },
      },
    });

    return NextResponse.json({ listing }, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error("Create listing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
