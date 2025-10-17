import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ""
  },
  category: {
    type: String,
    required: true
  },
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
  images: [{
    url: {
      type: String,
      required: true
    },
    public_id: {
      type: String,
      required: true
    }
  }],
  sizes: [{
    title: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    }
  }],
  tags: [{
    type: String
  }],
  isAvailable: {
    type: Boolean,
    default: true
  },
  inStock: {
    type: String,
    enum: ['available', 'out_of_stock', 'limited'],
    default: 'available'
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

export default mongoose.model('Product', productSchema);

