import connectDB from "@/config/db";
import User from "@/models/User";
import { getAuth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { userId } = getAuth(request);

    // Check if userId is present
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: No user ID found" },
        { status: 401 }
      );
    }

    await connectDB();

    // Query by clerkId field (as per User model)
    let user = await User.findOne({ clerkId: userId });

    // If user doesn't exist, create them automatically
    if (!user) {
      try {
        // Fetch user details from Clerk
        const client = await clerkClient();
        const clerkUser = await client.users.getUser(userId);

        // Create new user in database
        user = await User.create({
          _id: userId,
          clerkId: userId,
          name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User',
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          imageUrl: clerkUser.imageUrl || '',
          cartItems: {},
          wishList: {}
        });

        console.log('New user created:', userId);
      } catch (createError) {
        console.error("Error creating user:", createError.message);
        return NextResponse.json(
          { success: false, message: "Failed to create user: " + createError.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Error fetching user:", error.message);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}