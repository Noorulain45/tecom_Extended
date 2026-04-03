import { Schema, Types } from 'mongoose';
export declare const ProductSchema: Schema<any, import("mongoose").Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    collection: string;
    timestamps: true;
}, {
    rating: number;
    numReviews: number;
    reviews: Types.ObjectId[];
    name?: string | null | undefined;
} & import("mongoose").DefaultTimestampProps, import("mongoose").Document<unknown, {}, {
    rating: number;
    numReviews: number;
    reviews: Types.ObjectId[];
    name?: string | null | undefined;
} & import("mongoose").DefaultTimestampProps, {
    id: string;
}, Omit<import("mongoose").DefaultSchemaOptions, "timestamps" | "collection"> & {
    collection: string;
    timestamps: true;
}> & Omit<{
    rating: number;
    numReviews: number;
    reviews: Types.ObjectId[];
    name?: string | null | undefined;
} & import("mongoose").DefaultTimestampProps & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, unknown, {
    rating: number;
    numReviews: number;
    reviews: Types.ObjectId[];
    name?: string | null | undefined;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
