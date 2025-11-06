import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    
    },
    clerkId: {
      type: String,
      unique: true,
      required: true,
    },

    name: {
      type: String,
      required: false, 
    },
    email: {
      type: String,
      required: false,
      sparse: true, 
    },
    imageUrl: {
      type: String,
      required: false, 
    },
    cartItems: {
      type: Object,
      default: {},
    },
    wishList: {
      type: Object,
      default: {},
    },
  },
  {
    minimize: false,
    timestamps: true,
  }
);

const User = mongoose.models["User"] || mongoose.model("User", userSchema);

export default User;
