"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSchema = void 0;
const mongoose_1 = require("mongoose");
exports.UserSchema = new mongoose_1.Schema({
    name: String,
    email: String,
    role: String,
    isBlocked: Boolean,
    avatar: String,
}, { collection: 'users', timestamps: true });
//# sourceMappingURL=user.schema.js.map