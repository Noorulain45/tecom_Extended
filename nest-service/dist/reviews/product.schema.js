"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductSchema = void 0;
const mongoose_1 = require("mongoose");
exports.ProductSchema = new mongoose_1.Schema({
    name: String,
    reviews: [{ type: mongoose_1.Types.ObjectId, ref: 'Review' }],
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
}, { collection: 'products', timestamps: true });
//# sourceMappingURL=product.schema.js.map