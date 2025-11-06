import Order from "@/models/Order";
import Product from "@/models/Product";
import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import Stripe from "stripe";

// initialize stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const { userId } = getAuth(request);

    const { address, items } = await request.json();
    const origin = request.headers.get("origin");

    if (!address || items.length === 0) {
      return NextResponse.json({
        success: false,
        message: "Please provide address and items",
      });
    }

    let productData = [];

    // calculate amount using items

    let amount = await items.reduce(async (acc, item) => {
      const product = await Product.findById(item.product);
      productData.push({
        name: product.name,
        price: product.offerPrice,
        quantity: item.quantity,
      });
      return (await acc) + product.offerPrice * item.quantity;
    }, 0);

    const order = await Order.create({
      userId,
      address,
      items,
      amount: amount + Math.floor(amount * 0.0), //this is for tax
      date: Date.now(),
      paymentType: "Stripe",
    });

    // create line items for stripe

    const line_items = productData.map((item) => {
      return {
        price_data: {
          currency: "USD",
          product_data: {
            name: item.name,
          },
          unit_amount: item.price * 100,
        },
        quantity: item.quantity,
      };
    });

    // create a session

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `${origin}/order-placed?method=Stripe`,
      cancel_url: `${origin}/payment-failed?message=${encodeURIComponent("Payment was cancelled")}&method=Stripe`,
      metadata: {
        orderId: order._id.toString(),
        userId,
      },
    });


    // session url

    const url = session.url;

    return NextResponse.json({ success: true, url });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: error.message });
  }
}
