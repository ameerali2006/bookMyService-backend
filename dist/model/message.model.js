"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageModel = void 0;
const mongoose_1 = require("mongoose");
const messageSchema = new mongoose_1.Schema({
    chatId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Chat',
        required: true,
        index: true,
    },
    senderId: {
        type: mongoose_1.Schema.Types.ObjectId,
        refPath: 'role',
        required: true,
    },
    role: {
        type: String,
        enum: ['User', 'Worker', 'Admin'],
        required: true,
    },
    type: {
        type: String,
        enum: ['TEXT', 'IMAGE', 'VIDEO', 'AUDIO'],
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    metadata: {
        fileName: String,
        mimeType: String,
    },
    readBy: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            refPath: 'role',
        },
    ],
    isDeleted: {
        type: Boolean,
        default: false,
    },
    replyTo: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Message',
        default: null,
    },
    // 🆕
    reactions: [
        {
            userId: {
                type: mongoose_1.Schema.Types.ObjectId,
                required: true,
            },
            emoji: {
                type: String,
                required: true,
            },
        },
    ],
    editedAt: Date,
}, {
    timestamps: true,
});
exports.MessageModel = (0, mongoose_1.model)('Message', messageSchema);
