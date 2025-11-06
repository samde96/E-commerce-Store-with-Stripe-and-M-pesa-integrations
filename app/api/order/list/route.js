import connectDB from "@/config/db";
import Address from "@/models/Address";
import Order from "@/models/Order";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Product from "@/models/Product";

export async function GET(request) {
  try {
    const { userId } = await getAuth(request);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    Address.length;
    Product.length;

    // Get all orders for the user, excluding only "Pending Payment" status
    const orders = await Order.find({
      userId,
      status: { $ne: "Pending Payment" } // Exclude pending payments
    })
    .populate("address items.product")
    .sort({ date: -1 }); // Most recent first

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message });
  }
}


