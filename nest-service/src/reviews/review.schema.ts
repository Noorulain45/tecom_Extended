import { Schema, Types } from 'mongoose';

export const ReplySchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    text: { type: String, required: true },
  },
  { timestamps: true },
);

export const ReviewSchema = new Schema(
  {
    product: { type: Types.ObjectId, ref: 'Product', required: true },
    user: { type: Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    likes: [{ type: Types.ObjectId, ref: 'User' }],
    isFlagged: { type: Boolean, default: false },
    replies: [ReplySchema],
  },
  { timestamps: true },
);
