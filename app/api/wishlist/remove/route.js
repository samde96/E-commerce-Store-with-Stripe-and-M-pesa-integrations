// pages/api/wishlist/remove.js
import { getAuth } from "@clerk/nextjs/server";
import connectDB from "@/config/db";
import User from "@/models/User";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const { productId } = req.body;
  if (!productId) {
    return res.status(400).json({ success: false, message: "Product ID required" });
  }

  try {
    await connectDB();
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.wishlist = user.wishlist.filter((id) => id !== productId);
    await user.save();

    return res.status(200).json({ success: true, wishlist: user.wishlist });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}