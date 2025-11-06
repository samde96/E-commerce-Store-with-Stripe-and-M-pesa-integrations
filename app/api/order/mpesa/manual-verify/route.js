import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import connectDB from "@/config/db";
import Order from "@/models/Order";

// Temporary endpoint to manually verify pending M-Pesa payments
export async function POST(req) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { orderId } = await req.json();

    await connectDB();

    const order = await Order.findOne({ _id: orderId, userId });

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // Manually mark as paid - use this only for testing/debugging
    order.isPaid = true;
    order.status = "Order Placed";
    order.mpesaReceiptNumber = "MANUAL_" + Date.now();
    await order.save();

    return NextResponse.json({
      success: true,
      message: "Order manually marked as paid",
      order: {
        _id: order._id,
        isPaid: order.isPaid,
        status: order.status
      }
    });

  } catch (error) {
    console.error('Manual verify error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
