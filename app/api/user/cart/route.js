import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import User from "@/models/User";

// Add to cart
export async function POST(request) {
    try {
        const { userId } = getAuth(request);
        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const { productId, quantity = 1 } = await request.json();
        if (!productId) {
            return NextResponse.json({ success: false, message: "Product ID is required" }, { status: 400 });
        }

        await connectDB();
        const user = await User.findOne({ clerkId: userId });
        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }

        // Initialize cartItems if it doesn't exist
        if (!user.cartItems) {
            user.cartItems = {};
        }

        // Add or update quantity
        user.cartItems[productId] = (user.cartItems[productId] || 0) + quantity;

        await user.save();
        return NextResponse.json({ 
            success: true, 
            message: "Item added to cart",
            cartItems: user.cartItems 
        });

    } catch (error) {
        console.error("Cart error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

// Update cart quantity
export async function PUT(request) {
    try {
        const { userId } = getAuth(request);
        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const { productId, quantity } = await request.json();
        if (!productId) {
            return NextResponse.json({ success: false, message: "Product ID is required" }, { status: 400 });
        }

        await connectDB();
        const user = await User.findOne({ clerkId: userId });
        if (!user) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
        }

        if (quantity === 0) {
            // Remove item from cart
            delete user.cartItems[productId];
        } else {
            // Update quantity
            user.cartItems[productId] = quantity;
        }

        await user.save();
        return NextResponse.json({ 
            success: true, 
            message: "Cart updated",
            cartItems: user.cartItems 
        });

    } catch (error) {
        console.error("Cart error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
