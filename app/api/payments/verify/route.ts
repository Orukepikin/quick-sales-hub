import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPayment } from "@/lib/paystack";

// GET /api/payments/verify?reference=xxx
export async function GET(req: NextRequest) {
  try {
    const reference = req.nextUrl.searchParams.get("reference");

    if (!reference) {
      return NextResponse.json(
        { error: "Reference is required" },
        { status: 400 }
      );
    }

    const verification = await verifyPayment(reference);

    if (!verification.status || verification.data.status !== "success") {
      // Update payment status to failed
      await prisma.payment.update({
        where: { providerRef: reference },
        data: { status: "FAILED" },
      });

      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 400 }
      );
    }

    // Update payment to escrow (held until delivery confirmed)
    const payment = await prisma.payment.update({
      where: { providerRef: reference },
      data: {
        status: "ESCROW",
        providerTxnId: verification.data.reference,
      },
    });

    // Update order status
    await prisma.order.update({
      where: { id: payment.orderId },
      data: { status: "CONFIRMED" },
    });

    return NextResponse.json({
      message: "Payment verified successfully",
      status: "escrow",
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
