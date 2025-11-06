import connectDB from "@/config/db";
import Blog from "@/models/Blog";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = params;

    // Find by ID or slug
    const blog = await Blog.findOne({
      $or: [
        { _id: id },
        { slug: id }
      ],
      published: true
    });

    if (!blog) {
      return NextResponse.json(
        { success: false, message: "Blog post not found" },
        { status: 404 }
      );
    }

    // Increment views
    blog.views += 1;
    await blog.save();

    return NextResponse.json({ success: true, blog });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
