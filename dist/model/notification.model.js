"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationModel = void 0;
const mongoose_1 = require("mongoose");
const NotificationSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    workerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Worker' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
        type: String,
        enum: ['booking', 'payment', 'review', 'system'],
        default: 'system',
    },
    isRead: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });
exports.NotificationModel = (0, mongoose_1.model)('Notification', NotificationSchema);
