import { Schema, Types } from 'mongoose';
export declare const ReplySchema: Schema<any, import("mongoose").Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    text: string;
    user: Types.ObjectId;
    name: string;
} & import("mongoose").DefaultTimestampProps, import("mongoose").Document<unknown, {}, {
    text: string;
    user: Types.ObjectId;
    name: string;
} & import("mongoose").DefaultTimestampProps, {
    id: string;
}, Omit<import("mongoose").DefaultSchemaOptions, "timestamps"> & {
    timestamps: true;
}> & Omit<{
    text: string;
    user: Types.ObjectId;
    name: string;
} & import("mongoose").DefaultTimestampProps & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, unknown, {
    text: string;
    user: Types.ObjectId;
    name: string;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
export declare const ReviewSchema: Schema<any, import("mongoose").Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    rating: number;
    comment: string;
    product: Types.ObjectId;
    user: Types.ObjectId;
    name: string;
    likes: Types.ObjectId[];
    isFlagged: boolean;
    replies: Types.DocumentArray<{
        text: string;
        user: Types.ObjectId;
        name: string;
    } & import("mongoose").DefaultTimestampProps, Types.Subdocument<import("bson").ObjectId, unknown, {
        text: string;
        user: Types.ObjectId;
        name: string;
    } & import("mongoose").DefaultTimestampProps, {}, {}> & {
        text: string;
        user: Types.ObjectId;
        name: string;
    } & import("mongoose").DefaultTimestampProps>;
} & import("mongoose").DefaultTimestampProps, import("mongoose").Document<unknown, {}, {
    rating: number;
    comment: string;
    product: Types.ObjectId;
    user: Types.ObjectId;
    name: string;
    likes: Types.ObjectId[];
    isFlagged: boolean;
    replies: Types.DocumentArray<{
        text: string;
        user: Types.ObjectId;
        name: string;
    } & import("mongoose").DefaultTimestampProps, Types.Subdocument<import("bson").ObjectId, unknown, {
        text: string;
        user: Types.ObjectId;
        name: string;
    } & import("mongoose").DefaultTimestampProps, {}, {}> & {
        text: string;
        user: Types.ObjectId;
        name: string;
    } & import("mongoose").DefaultTimestampProps>;
} & import("mongoose").DefaultTimestampProps, {
    id: string;
}, Omit<import("mongoose").DefaultSchemaOptions, "timestamps"> & {
    timestamps: true;
}> & Omit<{
    rating: number;
    comment: string;
    product: Types.ObjectId;
    user: Types.ObjectId;
    name: string;
    likes: Types.ObjectId[];
    isFlagged: boolean;
    replies: Types.DocumentArray<{
        text: string;
        user: Types.ObjectId;
        name: string;
    } & import("mongoose").DefaultTimestampProps, Types.Subdocument<import("bson").ObjectId, unknown, {
        text: string;
        user: Types.ObjectId;
        name: string;
    } & import("mongoose").DefaultTimestampProps, {}, {}> & {
        text: string;
        user: Types.ObjectId;
        name: string;
    } & import("mongoose").DefaultTimestampProps>;
} & import("mongoose").DefaultTimestampProps & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, unknown, {
    rating: number;
    comment: string;
    product: Types.ObjectId;
    user: Types.ObjectId;
    name: string;
    likes: Types.ObjectId[];
    isFlagged: boolean;
    replies: Types.DocumentArray<{
        text: string;
        user: Types.ObjectId;
        name: string;
        createdAt: NativeDate;
        updatedAt: NativeDate;
    }, Types.Subdocument<import("bson").ObjectId, unknown, {
        text: string;
        user: Types.ObjectId;
        name: string;
        createdAt: NativeDate;
        updatedAt: NativeDate;
    }, {}, {}> & {
        text: string;
        user: Types.ObjectId;
        name: string;
        createdAt: NativeDate;
        updatedAt: NativeDate;
    }>;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
