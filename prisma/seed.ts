import { PrismaClient, UserRole, ListingStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Quick Sales Hub database...\n");

  // ── Create Users ──────────────────────────────────────
  const password = await bcrypt.hash("password123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@quicksaleshub.com" },
    update: {},
    create: {
      email: "admin@quicksaleshub.com",
      name: "QSH Admin",
      password,
      role: UserRole.ADMIN,
      phone: "+2348000000001",
      isVerified: true,
      location: "Lagos",
    },
  });

  const sellers = await Promise.all([
    prisma.user.upsert({
      where: { email: "techzone@example.com" },
      update: {},
      create: {
        email: "techzone@example.com",
        name: "TechZone NG",
        password,
        role: UserRole.SELLER,
        phone: "+2348100000001",
        isVerified: true,
        location: "Lagos",
        rating: 4.8,
        totalRatings: 124,
      },
    }),
    prisma.user.upsert({
      where: { email: "autodeals@example.com" },
      update: {},
      create: {
        email: "autodeals@example.com",
        name: "AutoDeals",
        password,
        role: UserRole.SELLER,
        phone: "+2348100000002",
        isVerified: true,
        location: "Abuja",
        rating: 4.6,
        totalRatings: 89,
      },
    }),
    prisma.user.upsert({
      where: { email: "gadgetplug@example.com" },
      update: {},
      create: {
        email: "gadgetplug@example.com",
        name: "GadgetPlug",
        password,
        role: UserRole.SELLER,
        phone: "+2348100000003",
        isVerified: true,
        location: "Lagos",
        rating: 4.9,
        totalRatings: 203,
      },
    }),
  ]);

  const buyers = await Promise.all([
    prisma.user.upsert({
      where: { email: "john@example.com" },
      update: {},
      create: {
        email: "john@example.com",
        name: "John Okafor",
        password,
        role: UserRole.BUYER,
        phone: "+2348200000001",
        location: "Lagos",
      },
    }),
    prisma.user.upsert({
      where: { email: "chi@example.com" },
      update: {},
      create: {
        email: "chi@example.com",
        name: "ChiAmaka",
        password,
        role: UserRole.BUYER,
        phone: "+2348200000002",
        location: "Enugu",
      },
    }),
  ]);

  const driver = await prisma.user.upsert({
    where: { email: "driveking@example.com" },
    update: {},
    create: {
      email: "driveking@example.com",
      name: "DriveKing Logistics",
      password,
      role: UserRole.DRIVER,
      phone: "+2348300000001",
      isVerified: true,
      location: "Lagos",
      rating: 4.7,
      totalRatings: 56,
    },
  });

  console.log("✅ Users created");

  // ── Create Listings ───────────────────────────────────
  const listings = await Promise.all([
    prisma.listing.create({
      data: {
        title: "iPhone 15 Pro Max 256GB",
        description:
          "Brand new, sealed in box. 256GB storage, Natural Titanium. Comes with receipt and full warranty. Purchased from Apple Store directly.",
        price: 850000,
        category: "phones",
        location: "Lagos",
        images: [],
        status: ListingStatus.ACTIVE,
        isPromoted: true,
        promotedUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        views: 342,
        saves: 28,
        sellerId: sellers[0].id,
      },
    }),
    prisma.listing.create({
      data: {
        title: "Toyota Camry 2019 Full Option",
        description:
          "Clean title, low mileage (32k km). Full option with leather interior. No accident history. Serious buyers only.",
        price: 12500000,
        category: "vehicles",
        location: "Abuja",
        images: [],
        status: ListingStatus.ACTIVE,
        isPromoted: false,
        views: 189,
        saves: 15,
        sellerId: sellers[1].id,
      },
    }),
    prisma.listing.create({
      data: {
        title: 'MacBook Pro M3 14"',
        description:
          "Barely used, like new condition. 16GB RAM, 512GB SSD. Comes with charger, box, and Apple Care+.",
        price: 1200000,
        category: "computing",
        location: "Lagos",
        images: [],
        status: ListingStatus.ACTIVE,
        isPromoted: true,
        promotedUntil: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        views: 267,
        saves: 41,
        sellerId: sellers[2].id,
      },
    }),
    prisma.listing.create({
      data: {
        title: "Samsung Galaxy S24 Ultra 512GB",
        description:
          "UK used, excellent condition. 512GB, Titanium Black. No scratches, battery health 96%.",
        price: 720000,
        category: "phones",
        location: "Port Harcourt",
        images: [],
        status: ListingStatus.ACTIVE,
        views: 156,
        saves: 12,
        sellerId: sellers[0].id,
      },
    }),
    prisma.listing.create({
      data: {
        title: "PlayStation 5 Slim Disc Edition",
        description:
          "Brand new PS5 Slim disc edition. Comes with 1 DualSense controller and HDMI cable. Sealed.",
        price: 480000,
        category: "electronics",
        location: "Ibadan",
        images: [],
        status: ListingStatus.ACTIVE,
        views: 98,
        saves: 7,
        sellerId: sellers[2].id,
      },
    }),
  ]);

  console.log("✅ Listings created");

  // ── Create Conversations & Messages ───────────────────
  const convo = await prisma.conversation.create({
    data: {
      listingId: listings[0].id,
      participants: {
        create: [
          { userId: buyers[0].id },
          { userId: sellers[0].id },
        ],
      },
      messages: {
        create: [
          {
            senderId: buyers[0].id,
            receiverId: sellers[0].id,
            content: "Is this still available?",
          },
          {
            senderId: sellers[0].id,
            receiverId: buyers[0].id,
            content: "Yes it is! Are you in Lagos?",
          },
          {
            senderId: buyers[0].id,
            receiverId: sellers[0].id,
            content: "Yes, Lekki. Can we do ₦800k?",
          },
        ],
      },
    },
  });

  console.log("✅ Conversations & messages created");

  // ── Create Orders ─────────────────────────────────────
  const order = await prisma.order.create({
    data: {
      listingId: listings[2].id,
      buyerId: buyers[1].id,
      sellerId: sellers[2].id,
      amount: 1200000,
      status: "DELIVERED",
    },
  });

  console.log("✅ Orders created");

  // ── Create a Review ───────────────────────────────────
  await prisma.review.create({
    data: {
      orderId: order.id,
      reviewerId: buyers[1].id,
      revieweeId: sellers[2].id,
      rating: 5,
      comment: "Excellent seller! Item was exactly as described. Fast delivery.",
    },
  });

  console.log("✅ Reviews created");
  console.log("\n🎉 Seeding complete!\n");
  console.log("── Login Credentials ─────────────────────");
  console.log("Admin:  admin@quicksaleshub.com / password123");
  console.log("Seller: techzone@example.com    / password123");
  console.log("Buyer:  john@example.com        / password123");
  console.log("Driver: driveking@example.com   / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
