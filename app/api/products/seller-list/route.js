
import { getAuth } from "@clerk/nextjs/server"
import authSeller from "@/lib/authSeller"
import Product from "@/models/Product"
import { NextResponse } from "next/server"
import connectDB from "@/config/db"



export async function GET(request) {

    try {
        
        const {userId}  = getAuth(request)
        const isSeller = authSeller(userId)


        if(!isSeller) {
            return NextResponse.json({ success: false, message: "You are not authorized to view products" })
        }

        await connectDB()
        const products = await Product.find({ });

        return NextResponse.json({ success: true, products })

    } catch (error) {
       return NextResponse.json({ success: false, message: error.message }) 
    }
}