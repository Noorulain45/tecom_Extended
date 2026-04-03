import { Schema } from 'mongoose';

// Minimal schema — we only read from the existing User collection
export const UserSchema = new Schema(
  {
    name: String,
    email: String,
    role: String,
    isBlocked: Boolean,
    avatar: String,
  },
  { collection: 'users', timestamps: true },
);
