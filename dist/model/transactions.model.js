"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionModel = void 0;
const mongoose_1 = require("mongoose");
const TransactionSchema = new mongoose_1.Schema({
    walletId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Wallet',
        required: true,
        index: true,
    },
    type: {
        type: String,
        enum: [
            'TOPUP',
            'HOLD',
            'RELEASE',
            'PAYOUT',
            'REFUND',
            'COMMISSION',
            'ADJUSTMENT',
            'BONUS',
            'PENALTY',
        ],
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    direction: {
        type: String,
        enum: ['CREDIT', 'DEBIT'],
        required: true,
    },
    balanceBefore: {
        type: Number,
        required: true,
    },
    balanceAfter: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
    },
    status: {
        type: String,
        enum: ['SUCCESS', 'PENDING', 'FAILED'],
        default: 'SUCCESS',
    },
}, { timestamps: true });
exports.TransactionModel = (0, mongoose_1.model)('Transaction', TransactionSchema);
