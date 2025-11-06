// pages/api/wishlist/index.js
import { getAuth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    await dbConnect();
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.status(200).json({ success: true, wishlist: user.wishlist || [] });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}