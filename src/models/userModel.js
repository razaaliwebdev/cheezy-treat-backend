import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  addressLine: { type: String },
  street: { type: String },
  city: { type: String },
  state: {
    type: String,
    enum: ["Punjab", "Sindh", "Khyber Pakhtunkhwa", "Balochistan"],
  },
  zipCode: { type: String },
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: true,
      minLength: 6,
    },
    phone: {
      type: String,
      match: [/^(\+92|0)3\d{9}$/, "Invalid Pakistani phone number"],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      code: { type: String },
      expiresAt: { type: Date },
    },
    orders: [
      {
        orderId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Order",
        },
        status: {
          type: String,
          // 🛠️ FIX: Corrected typo from 'prepairing' to 'preparing'
          enum: ["preparing", "out_of_delivery", "delivered", "cancelled"],
          default: "preparing",
        },
        totalAmount: {
          type: Number,
          default: 0,
        },
        paymentMethod: {
          type: String,
          enum: ["cod", "stripe"],
          default: "cod",
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    address: [addressSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
    profileImage: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
export default User;

