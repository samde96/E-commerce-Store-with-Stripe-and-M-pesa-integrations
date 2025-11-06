import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import connectDB from "@/config/db";
import Order from "@/models/Order";

export async function GET(req, { params }) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { orderId } = params;

    await connectDB();

    const order = await Order.findOne({ _id: orderId, userId });

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order: {
        _id: order._id,
        isPaid: order.isPaid,
        status: order.status,
        amount: order.amount,
        paymentType: order.paymentType,
        mpesaReceiptNumber: order.mpesaReceiptNumber,
        paymentFailureReason: order.paymentFailureReason
      }
    });

  } catch (error) {
    console.error('Order status check error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
