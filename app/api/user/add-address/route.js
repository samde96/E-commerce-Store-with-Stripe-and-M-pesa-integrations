import connectDB from "@/config/db";
import Address from "@/models/Address";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { checkRateLimit, RateLimitPresets } from "@/lib/rateLimit";
import { applySecurityHeaders, performSecurityChecks } from "@/lib/securityHeaders";

export async function POST(request) {
  try {
    // Apply security checks
    const securityCheck = performSecurityChecks(request, {
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

    // Rate limiting - MODERATE for address operations
    const rateLimitResult = await checkRateLimit(request, RateLimitPresets.MODERATE);

    if (rateLimitResult.error) {
      return NextResponse.json(
        rateLimitResult.response,
        {
          status: rateLimitResult.status,
          headers: applySecurityHeaders(rateLimitResult.headers)
        }
      );
    }

    // Get the authenticated user ID from Clerk
    const { userId } = await getAuth(request);

    // Check if userId is present
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: No user ID found" },
        {
          status: 401,
          headers: applySecurityHeaders()
        }
      );
    }

    // Parse the address data from the request body
    const { address } = await request.json();

    // Validate address data

    if (!address || typeof address !== "object") {
      return NextResponse.json(
        { success: false, message: "Invalid address data" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await connectDB();

    // Create the new address document

    const newAddress = await Address.create({ ...address, userId });

    return NextResponse.json(
      {
        success: true,
        message: "Address added successfully",
        address: newAddress,
      },
      {
        headers: applySecurityHeaders(rateLimitResult.headers)
      }
    );
  } catch (error) {
    console.error("Error adding address:", error.message);
    return NextResponse.json(
      { success: false, message: error.message },
      {
        status: 400,
        headers: applySecurityHeaders()
      }
    );
  }
}





// import connectDB from "@/config/db"
// import Address from "@/models/Address";
// import {getAuth} from "@clerk/nextjs/server"
// import { NextResponse } from "next/server";

// export async function POST(request) {

//     try {

//         const {userId} = getAuth(request)
//         const {address} = await request.json()

//         await connectDB();
//         const newAddress = await Address.create({...address, userId})

//         return NextResponse.json ({success: true, message: "Address added successfully", address: newAddress})

//     } catch (error) {
//         return NextResponse.json({success: false, message: error.message})

//     }
// }
