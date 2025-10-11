import mongoose from "mongoose";

const sizeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
});

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    category: {
      type: String,
      enum: ["pizza", "burger", "pasta", "sandwich", "drinks"],
      required: true,
    },

    images: [
      {
        type: String,
        default:
          "https://media.istockphoto.com/id/1418025896/vector/pizza-doodle-5.webp?a=1&b=1&s=612x612&w=0&k=20&c=bco3z0XxoTNGcxD0cxULBpk8D9sAs9ZK-q5Ky5s_ybo=",
      },
    ],

    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },

    // 💡 "Line-through" price (original price before discount)
    compareAtPrice: {
      type: Number,
      default: 0,
    },

    sizes: [sizeSchema],

    tags: [String], // spicy , non-spicy etc

    isAvailable: {
      type: Boolean,
      default: true,
    },

    inStock: {
      type: String,
      enum: ["available", "unavailable"],
      default: "available",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // you can use "User" if admin is a type of user
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
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
