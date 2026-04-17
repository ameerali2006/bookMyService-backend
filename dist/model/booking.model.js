"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Booking = void 0;
const mongoose_1 = require("mongoose");
const BookingSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    workerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Worker', required: true },
    serviceId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Service', required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String },
    description: { type: String },
    address: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Address' },
    advanceAmount: { type: Number, required: true, default: 100 },
    totalAmount: { type: Number, default: 0 },
    remainingAmount: { type: Number, default: 0 },
    advancePaymentId: { type: String },
    advancePaymentStatus: {
        type: String,
        enum: ['unpaid', 'paid', 'failed', 'refunded'],
        default: 'unpaid',
    },
    finalPaymentId: { type: String },
    finalPaymentStatus: {
        type: String,
        enum: ['unpaid', 'paid', 'failed', 'refunded'],
        default: 'unpaid',
    },
    paymentMethod: {
        type: String,
        enum: ['stripe', 'upi', 'cash'],
    },
    additionalItems: [
        {
            name: { type: String },
            price: { type: Number },
        },
    ],
    paymentBreakdown: [
        {
            title: { type: String, required: true },
            rate: { type: Number, required: true },
            rateLabel: { type: String, required: true },
            quantity: { type: Number, required: true },
            total: { type: Number, required: true },
        },
    ],
    status: {
        type: String,
        enum: [
            'pending',
            'confirmed',
            'in-progress',
            'awaiting-final-payment',
            'completed',
            'cancelled',
        ],
        default: 'pending',
    },
    workerResponse: {
        type: String,
        enum: ['accepted', 'rejected', 'pending'],
        default: 'pending',
    },
    otp: { type: String },
    isSettled: { type: Boolean, default: false },
    reviewId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Review',
        default: null,
    },
}, { timestamps: true });
exports.Booking = (0, mongoose_1.model)('Booking', BookingSchema);
