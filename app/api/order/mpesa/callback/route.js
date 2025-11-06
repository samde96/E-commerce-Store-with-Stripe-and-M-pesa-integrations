import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Order from "@/models/Order";

export async function POST(req) {
  try {
    const body = await req.json();
    console.log('M-Pesa Callback received:', JSON.stringify(body, null, 2));

    await connectDB();

    // M-Pesa callback structure
    const { Body } = body;
    const stkCallback = Body?.stkCallback;

    if (!stkCallback) {
      console.error('Invalid callback structure');
      return NextResponse.json({ success: false, message: 'Invalid callback' });
    }

    const { ResultCode, ResultDesc, CallbackMetadata } = stkCallback;
    const checkoutRequestId = stkCallback.CheckoutRequestID;

    console.log('CheckoutRequestID:', checkoutRequestId);
    console.log('ResultCode:', ResultCode);
    console.log('ResultDesc:', ResultDesc);

    // Extract payment details from CallbackMetadata
    let mpesaReceiptNumber = null;
    let transactionDate = null;
    let phoneNumber = null;
    let amount = null;

    if (CallbackMetadata?.Item) {
      for (const item of CallbackMetadata.Item) {
        if (item.Name === 'MpesaReceiptNumber') {
          mpesaReceiptNumber = item.Value;
        } else if (item.Name === 'TransactionDate') {
          transactionDate = item.Value;
        } else if (item.Name === 'PhoneNumber') {
          phoneNumber = item.Value;
        } else if (item.Name === 'Amount') {
          amount = item.Value;
        }
      }
    }

    // Find order by CheckoutRequestID
    const order = await Order.findOne({
      checkoutRequestId: checkoutRequestId
    });

    if (!order) {
      console.error('Order not found for CheckoutRequestID:', checkoutRequestId);
      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: "Order not found but callback acknowledged"
      });
    }

    // ResultCode 0 means success
    if (ResultCode === 0) {
      console.log('Payment successful:', {
        orderId: order._id,
        mpesaReceiptNumber,
        amount,
        phoneNumber,
        transactionDate
      });

      order.isPaid = true;
      order.status = "Order Placed";
      order.mpesaReceiptNumber = mpesaReceiptNumber;
      order.transactionDate = transactionDate;
      await order.save();

      console.log(`✅ Order ${order._id} marked as paid`);
    } else {
      console.log('Payment failed for order:', order._id, 'Reason:', ResultDesc);

      order.status = "Payment Failed";
      order.paymentFailureReason = ResultDesc;
      await order.save();

      console.log(`❌ Order ${order._id} marked as failed`);
    }

    // Always return success to M-Pesa so they don't retry
    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Callback received successfully"
    });

  } catch (error) {
    console.error('M-Pesa Callback Error:', error);
    // Still return success to M-Pesa
    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Callback received"
    });
  }
}
