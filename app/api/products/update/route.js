import authSeller from "@/lib/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Product from "@/models/Product";

// Configuring Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function PUT(request) {
    try {
        const { userId } = getAuth(request);

        // Check if seller is logged in
        const isSeller = await authSeller(userId);
        if (!isSeller) {
            return NextResponse.json({ success: false, message: "You are not authorized to update products" });
        }

        const formData = await request.formData();
        const productId = formData.get("productId");
        const name = formData.get("name");
        const description = formData.get("description");
        const price = formData.get("price");
        const category = formData.get("category");
        const offerPrice = formData.get("offerPrice");
        const files = formData.getAll("images");
        const stockStatus = formData.get("stockStatus");
        const color = formData.get("color");
        const brand = formData.get("brand");

        // Connect to database
        await connectDB();

        // Find the product
        const product = await Product.findById(productId);
        if (!product) {
            return NextResponse.json({ success: false, message: "Product not found" });
        }

        // Verify the product belongs to the seller
        if (product.userId !== userId) {
            return NextResponse.json({ success: false, message: "You are not authorized to update this product" });
        }

        // Prepare update object
        const updateData = {
            ...(name && { name }),
            ...(description && { description }),
            ...(price && { price: Number(price) }),
            ...(category && { category }),
            ...(offerPrice && { offerPrice: Number(offerPrice) }),
            ...(stockStatus && { stockStatus }),
            ...(color && { color }),
            ...(files && { image: files }),
            ...(brand && { brand: formData.get("brand") }),
            updatedAt: Date.now(),
        };

        // Handle image updates if new images are provided
        if (files && files.length > 0) {
            // Delete existing images from Cloudinary
            if (product.image && product.image.length > 0) {
                await Promise.all(
                    product.image.map(async (imageUrl) => {
                        const publicId = imageUrl.split('/').pop().split('.')[0];
                        await cloudinary.uploader.destroy(publicId);
                    })
                );
            }

            // Upload new images to Cloudinary
            const result = await Promise.all(
                files.map(async (file) => {
                    const arrayBuffer = await file.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);

                    return new Promise((resolve, reject) => {
                        const stream = cloudinary.uploader.upload_stream(
                            { resource_type: "auto" },
                            (error, result) => {
                                if (error) {
                                    reject(error);
                                } else {
                                    resolve(result);
                                }
                            }
                        );
                        stream.end(buffer);
                    });
                })
            );

            updateData.image = result.map((res) => res.secure_url);
        }

        // Update product in database
        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            { $set: updateData },
            { new: true }
        );

        return NextResponse.json({
            success: true,
            message: "Product updated successfully",
            updatedProduct,
        });

    } catch (error) {
        return NextResponse.json({ success: false, message: error.message });
    }
}