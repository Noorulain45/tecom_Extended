import { Schema } from 'mongoose';
export declare const UserSchema: Schema<any, import("mongoose").Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    collection: string;
    timestamps: true;
}, {
    name?: string | null | undefined;
    email?: string | null | undefined;
    role?: string | null | undefined;
    isBlocked?: boolean | null | undefined;
    avatar?: string | null | undefined;
} & import("mongoose").DefaultTimestampProps, import("mongoose").Document<unknown, {}, {
    name?: string | null | undefined;
    email?: string | null | undefined;
    role?: string | null | undefined;
    isBlocked?: boolean | null | undefined;
    avatar?: string | null | undefined;
} & import("mongoose").DefaultTimestampProps, {
    id: string;
}, Omit<import("mongoose").DefaultSchemaOptions, "timestamps" | "collection"> & {
    collection: string;
    timestamps: true;
}> & Omit<{
    name?: string | null | undefined;
    email?: string | null | undefined;
    role?: string | null | undefined;
    isBlocked?: boolean | null | undefined;
    avatar?: string | null | undefined;
} & import("mongoose").DefaultTimestampProps & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, unknown, {
    name?: string | null | undefined;
    email?: string | null | undefined;
    role?: string | null | undefined;
    isBlocked?: boolean | null | undefined;
    avatar?: string | null | undefined;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
