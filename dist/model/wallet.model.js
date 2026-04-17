"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletModel = void 0;
const mongoose_1 = require("mongoose");
const WalletSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        index: true,
        refPath: 'role',
    },
    role: {
        type: String,
        enum: ['user', 'worker', 'admin'],
        required: true,
    },
    balance: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
    },
    isFrozen: {
        type: Boolean,
        default: false,
    },
    lastActivityAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });
exports.WalletModel = (0, mongoose_1.model)('Wallet', WalletSchema);
