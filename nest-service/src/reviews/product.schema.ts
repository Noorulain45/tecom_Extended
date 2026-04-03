import { Schema, Types } from 'mongoose';

// Minimal product schema — only fields we need to read/update
export const ProductSchema = new Schema(
  {
    name: String,
    reviews: [{ type: Types.ObjectId, ref: 'Review' }],
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
  },
  { collection: 'products', timestamps: true },
);
