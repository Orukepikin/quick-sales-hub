import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import {
  initializePayment,
  generatePaymentReference,
} from "@/lib/paystack";

// POST /api/payments — Initialize payment
export async function POST(req: NextRequest) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId, amount } = await req.json();

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { buyer: true },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    if (order.buyerId !== payload.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const reference = generatePaymentReference();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Initialize Paystack payment
    const paystackRes = await initializePayment({
      email: order.buyer.email,
      amount,
      reference,
      callbackUrl: `${appUrl}/api/payments/callback`,
      metadata: {
        orderId: order.id,
        buyerId: payload.userId,
      },
    });

    if (!paystackRes.status) {
      return NextResponse.json(
        { error: "Payment initialization failed" },
        { status: 500 }
      );
    }

    // Create payment record
    const fee = amount * 0.015; // 1.5% platform fee
    await prisma.payment.create({
      data: {
        orderId: order.id,
        userId: payload.userId,
        amount,
        fee,
        status: "PENDING",
        provider: "paystack",
        providerRef: reference,
      },
    });

    return NextResponse.json({
      authorizationUrl: paystackRes.data.authorization_url,
      reference: paystackRes.data.reference,
    });
  } catch (error) {
    console.error("Initialize payment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
