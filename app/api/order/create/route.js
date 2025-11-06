import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";
import { getAuth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server";

export async function POST(request) {
     
   try {
    
    const {userId} = getAuth(request);

    const {address, items} = await request.json();

    if (!address || items.length  === 0) {
        return NextResponse.json({ success: false, message: "Please provide address and items" });
    }

    // calculate amount using items

    const amount = await items.reduce (async(acc, item) => {

        const product = await Product.findById(item.product);
        return await acc + product.offerPrice * item.quantity
    }, 0)
    
    await Order.create({
        //name: "order.created",
            userId,
            address,
            items,
            amount: amount + Math.floor(amount * 0.00), //this is for tax
            date: Date.now(),
            paymentType: 'COD'
        
    })

    // clear user cart

    const user = await User.findById(userId);
    user.cartItems = {};
    await user.save();

    return NextResponse.json({ success: true, message: "Order placed successfully" }); 



   } catch (error) {
   
    return NextResponse.json({ success: false, message: error.message });
    
   }






}