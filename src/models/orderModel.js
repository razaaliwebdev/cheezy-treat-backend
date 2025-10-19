import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  size: {
    type: String, // small , medium large
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  image: {
    type: String,
  },
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  items: [orderItemSchema],
  shippingAddress: {
    addressLine: { type: String },
    street: { type: String },
    city: { type: String },
    state: {
      type: String,
      enum: ["Punjab", "Sindh", "Khyber Pakhtunkhwa", "Balochistan"],
    },
    zipCode: { type: String },
    country: { type: String },
  },
  phone: { type: String },
  totalAmount: { type: Number, required: true, min: 0 },
  discount: {
    type: Number,
    default: 0,
  },
  paymentMethod: {
    type: String,
    enum: ["cod", "online"],
    default: "cod",
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending",
  },
  orderStatus: {
    type: String,
    // 🛠️ FIX: Corrected typo from 'prepairing' to 'preparing'
    enum: ["preparing", "out_of_delivery", "delivered", "cancelled"],
    default: "preparing",
  },
  deliveryFee: {
    type: Number,
    default: 0,
  },
  note: { type: String },
  deliverAt: {
    type: Date,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  deletedAt: {
    type: Date,
    default: null,
  },
});

const Order = mongoose.model("Order", orderSchema);
export default Order;

