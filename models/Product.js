import mongoose from "mongoose";


const productSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        ref: "User",
    },

    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    offerPrice: {
        type: Number,
        required: true,
    },
    image: {
        type: Array,
        required: true,
    },

    category: {
        type: String,
        required: true,
    },
    
    date: {
        type: Number,        
        required: true,
    },
    stockStatus: {
        type: String,
        enum: ["In_stock", "Out_of_stock", "Limited_stock"],
        required: true,
        default: "In_stock",
      },
    color: {
        type: String,
        required: true
        
    },
    brand: {
        type: String,
        required: true
    },
    
}, {timestamps: true});


    const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
    export default Product;