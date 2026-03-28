import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPayment } from "@/lib/paystack";

export async function GET(req: NextRequest) {
  try {
    const reference = req.nextUrl.searchParams.get("reference");
    if (!reference) {
      return NextResponse.json({ error: "Reference is required" }, { status: 400 });
    }

    const payment = await prisma.payment.findFirst({
      where: { providerRef: reference },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    const verification = await verifyPayment(reference);

    if (!verification.status || verification.data.status !== "success") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED" },
      });
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "ESCROW", providerTxnId: verification.data.reference },
    });

    await prisma.order.update({
      where: { id: payment.orderId },
      data: { status: "CONFIRMED" },
    });

    return NextResponse.json({ message: "Payment verified successfully", status: "escrow" });
  } catch (error) {
    console.error("Verify payment error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}