"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewSchema = exports.ReplySchema = void 0;
const mongoose_1 = require("mongoose");
exports.ReplySchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    text: { type: String, required: true },
}, { timestamps: true });
exports.ReviewSchema = new mongoose_1.Schema({
    product: { type: mongoose_1.Types.ObjectId, ref: 'Product', required: true },
    user: { type: mongoose_1.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    likes: [{ type: mongoose_1.Types.ObjectId, ref: 'User' }],
    isFlagged: { type: Boolean, default: false },
    replies: [exports.ReplySchema],
}, { timestamps: true });
//# sourceMappingURL=review.schema.js.map