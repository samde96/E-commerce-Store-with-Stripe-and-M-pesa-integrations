import { NextResponse } from "next/server";
import axios from "axios";
import { getAuth } from "@clerk/nextjs/server";
import connectDB from "@/config/db";
import Order from "@/models/Order";
import { checkRateLimit, RateLimitPresets } from "@/lib/rateLimit";
import { verifyTurnstileToken, getClientIP } from "@/lib/cloudflare";
import { applySecurityHeaders, validateAuthHeader, performSecurityChecks } from "@/lib/securityHeaders";

export async function POST(req) {
  try {
    // Apply security checks
    const securityCheck = performSecurityChecks(req, {
      checkAuth: true,
      checkSuspicious: true
    });

    if (!securityCheck.passed) {
      return NextResponse.json(
        { success: false, message: securityCheck.message },
        {
          status: securityCheck.status,
          headers: applySecurityHeaders()
        }
      );
    }

    // Rate limiting - STRICT for payment endpoints
    const rateLimitResult = await checkRateLimit(req, RateLimitPresets.STRICT);

    if (rateLimitResult.error) {
      return NextResponse.json(
        rateLimitResult.response,
        {
          status: rateLimitResult.status,
          headers: applySecurityHeaders(rateLimitResult.headers)
        }
      );
    }

    const { userId } = await getAuth(req);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        {
          status: 401,
          headers: applySecurityHeaders()
        }
      );
    }

    const body = await req.json();
    const { address, items, phoneNumber, amount, turnstileToken } = body;

    // Verify Turnstile token (optional - can be enforced by removing the if check)
    if (turnstileToken) {
      const clientIP = getClientIP(req);
      const verification = await verifyTurnstileToken(turnstileToken, clientIP);

      if (!verification.success) {
        return NextResponse.json(
          { success: false, message: verification.error || "Security verification failed" },
          {
            status: 403,
            headers: applySecurityHeaders(rateLimitResult.headers)
          }
        );
      }
    }

    // Validation
    if (!address || !items || items.length === 0 || !phoneNumber || !amount) {
      return NextResponse.json(
        { success: false, message: 'Address, items, phone number, and amount are required' },
        { status: 400 }
      );
    }

    // Connect to database and create order first
    await connectDB();

    const order = await Order.create({
      userId,
      address,
      items,
      amount,
      date: Date.now(),
      paymentType: "M-Pesa",
      isPaid: false,
      status: "Pending Payment"
    });

    // Check if M-Pesa credentials are configured
    if (!process.env.MPESA_CONSUMER_KEY || !process.env.MPESA_CONSUMER_SECRET) {
      return NextResponse.json(
        {
          success: false,
          message: 'M-Pesa is not configured. Please contact administrator or use alternative payment methods.'
        },
        { status: 503 }
      );
    }

    if (!process.env.MPESA_SHORTCODE || !process.env.MPESA_PASSKEY) {
      return NextResponse.json(
        {
          success: false,
          message: 'M-Pesa configuration is incomplete. Please use alternative payment methods.'
        },
        { status: 503 }
      );
    }

    // Get token from Safaricom
    const MPESA_BASE_URL =
      process.env.MPESA_ENVIRONMENT === "live"
        ? "https://api.safaricom.co.ke"
        : "https://sandbox.safaricom.co.ke";

    const auth = Buffer.from(
      `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
    ).toString("base64");

    const tokenRes = await axios.get(
      `${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    const accessToken = tokenRes.data.access_token;

    // Prepare STK Push
    const date = new Date();
    const timestamp =
      date.getFullYear().toString() +
      ("0" + (date.getMonth() + 1)).slice(-2) +
      ("0" + date.getDate()).slice(-2) +
      ("0" + date.getHours()).slice(-2) +
      ("0" + date.getMinutes()).slice(-2) +
      ("0" + date.getSeconds()).slice(-2);

    const password = Buffer.from(
      process.env.MPESA_SHORTCODE + process.env.MPESA_PASSKEY + timestamp
    ).toString("base64");

    const formattedPhone = `254${phoneNumber.slice(-9)}`;

    const stkRes = await axios.post(
      `${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`,
      {
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: formattedPhone,
        PartyB: process.env.MPESA_SHORTCODE,
        PhoneNumber: formattedPhone,
        CallBackURL: `${process.env.MPESA_CALLBACK_URL || process.env.NEXT_PUBLIC_APP_URL + '/api/order/mpesa/callback'}`,
        AccountReference: order._id.toString(),
        TransactionDesc: `Payment for order ${order._id.toString().slice(-8)}`,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    // Store the CheckoutRequestID in the order for callback matching
    order.checkoutRequestId = stkRes.data.CheckoutRequestID;
    await order.save();

    return NextResponse.json(
      {
        success: true,
        message: `STK Push sent successfully to ${phoneNumber}. Please check your phone and enter your PIN.`,
        orderId: order._id.toString(),
        checkoutRequestId: stkRes.data.CheckoutRequestID,
      },
      {
        headers: applySecurityHeaders(rateLimitResult.headers)
      }
    );
  } catch (error) {
    console.error('M-Pesa API Error:', error.response?.data || error.message);

    // Provide user-friendly error messages
    let errorMessage = 'M-Pesa payment failed. Please try again or use an alternative payment method.';

    if (error.response?.data) {
      const mpesaError = error.response.data;
      if (mpesaError.errorMessage) {
        errorMessage = mpesaError.errorMessage;
      } else if (mpesaError.error_description) {
        errorMessage = mpesaError.error_description;
      }
    } else if (error.message.includes('ENOTFOUND')) {
      errorMessage = 'Unable to connect to M-Pesa. Please check your internet connection.';
    }

    return NextResponse.json(
      { success: false, message: errorMessage },
      {
        status: 500,
        headers: applySecurityHeaders()
      }
    );
  }
}
