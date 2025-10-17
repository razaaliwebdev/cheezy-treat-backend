import mongoose from 'mongoose';


const dealSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            trim: true,
        },
        image: {
            type: String,
            required: true,
            default: "https://res.cloudinary.com/demo/image/upload/v1699999999/default-deal.jpg"
        },
        items: [
            {
                itemName: {
                    type: String,
                    required: true,
                    trim: true
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1
                },
                size: {
                    type: String,
                    trim: true
                }
            }
        ],
        basePrice: {
            type: Number,
            required: true,
            min: 0
        },
        compareAtPrice: {
            type: Number,
            default: 0,
            min: 0
        },
        category: {
            type: String,
            enum: ["combo", "family", "special", "drinks"],
            default: "combo"
        },
        isAvailable: {
            type: Boolean,
            default: true
        },
        inStock: {
            type: String,
            enum: ['available', 'out_of_stock', 'limited'],
            default: 'available'
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
    },
    {
        timestamps: true
    }
);

const Deal = mongoose.model('Deal', dealSchema);
export default Deal;