import authSeller from "@/lib/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Product from "@/models/Product";


//THIS IS A PRODUCT API


// configuring cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

  export async function POST(request) {
    try {
        
        const { userId } = getAuth(request);

        //check if seller is logged in or not
        const isSeller = await authSeller(userId);

        if(!isSeller) {
            return NextResponse.json({ success: false, message: "You are not authorized to add products" })
        }
        const formData = await request.formData();
        const name = formData.get("name");
        const description = formData.get("description");
        const price = formData.get("price");
        const category = formData.get("category");
        const offerPrice = formData.get("offerPrice");
        const files = formData.getAll("images");
        const stockStatus = formData.get("stockStatus");
        const color = formData.get("color");
        const brand = formData.get("brand");

        //check if there are images or not

        if(!files || files.length === 0) {
            return NextResponse.json({ success: false, message: "Please upload images" })
        }
        const result = await Promise.all(files.map(async(file) => {

            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream({
                     resource_type: "auto" },
                     (error, result) => {

                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
            }
        )
                stream.end(buffer);
            });

        }))

        const image = result.map(result => result.secure_url);
        
        //save product to database
        await connectDB();

        // Convert stockStatus to match enum format (capitalize and use underscore)
        const formattedStockStatus = stockStatus
          ? stockStatus.split('_').map((word, index) =>
              index === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word
            ).join('_')
          : 'In_stock';

        const NewProduct = await Product.create({
            userId,
            name,
            description,
            price: Number(price),
            category,
            offerPrice: Number(offerPrice),
            image: image,
            stockStatus: formattedStockStatus,
            color,
            brand: brand || 'Generic',
            date: Date.now()
        })


        return NextResponse.json({ success: true, message: "Product added successfully", NewProduct })


    } catch (error) {
        return NextResponse.json({ success: false, message: error.message })
    }
  }