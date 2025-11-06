import connectDB from "@/config/db";
import authSeller from "@/lib/authSeller";
import Address from "@/models/Address";
import Order from "@/models/Order";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { userId } = getAuth(request);

    const isSeller = await authSeller(userId);

    if (!isSeller) {
      return NextResponse.json({
        success: false,
        message: "You are not authorized to view orders",
      });
    }
    // if user is seller
    await connectDB();

    Address.length;
    //check orders available in database
    const orders = await Order.find({ }).populate(
      "address items.product"
    );

    return NextResponse.json({ success: true, orders });
    
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message });
  }
}
