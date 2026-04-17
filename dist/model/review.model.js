"use strict";
// models/review.model.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.Review = void 0;
const mongoose_1 = require("mongoose");
const ReviewSchema = new mongoose_1.Schema({
    bookingId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true,
        unique: true,
    },
    workerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Worker',
        required: true,
        index: true,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    comment: {
        type: String,
        trim: true,
        maxlength: 500,
    },
    isVisible: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });
ReviewSchema.index({ workerId: 1, createdAt: -1 });
ReviewSchema.index({ workerId: 1, rating: -1 });
exports.Review = (0, mongoose_1.model)('Review', ReviewSchema);
