import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    ref: "User",
  },
  items: [{
    product: {type: String, required: true, ref: "Product"},
    quantity: {type: Number, required: true},
  }],

  amount: {
    type: Number,
    required: true,
  },
  address:{
    type: String,
    required: true,
    ref: 'Address'
  },
  status: {
    type: String,
    default: "Order Placed", 
    required: true,

  },
  date: {
    type: Date,
    required: true,
  },
  paymentType: {
    type: String,
    required: true,
  },
  isPaid: {
    type: Boolean,
    required: true,
    default: false
  },
  mpesaReceiptNumber: {
    type: String,
    required: false
  },
  transactionDate: {
    type: String,
    required: false
  },
  paymentFailureReason: {
    type: String,
    required: false
  },
  checkoutRequestId: {
    type: String,
    required: false
  }

});



const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;