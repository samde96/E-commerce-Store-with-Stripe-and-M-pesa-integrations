import connectDB from "@/config/db";
import Blog from "@/models/Blog";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { userId } = await getAuth(request);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { title, content, excerpt, coverImage, author, authorImage, category, tags } = body;

    // Validate required fields
    if (!title || !content || !excerpt || !coverImage || !author || !category) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create blog post
    const blog = await Blog.create({
      title,
      content,
      excerpt,
      coverImage,
      author,
      authorImage,
      category,
      tags: tags || [],
      published: true
    });

    return NextResponse.json({
      success: true,
      message: "Blog post created successfully",
      blog
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
