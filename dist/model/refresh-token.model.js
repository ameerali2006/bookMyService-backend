"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenModel = exports.refreshTokenSchema = void 0;
const mongoose_1 = require("mongoose");
exports.refreshTokenSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
    },
    userType: {
        type: String,
        enum: ['admin', 'user', 'worker'],
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
        expires: 604800,
    },
}, {
    timestamps: true,
});
exports.RefreshTokenModel = (0, mongoose_1.model)('RefreshToken', exports.refreshTokenSchema);
