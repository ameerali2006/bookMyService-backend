import { Schema, model, Types } from 'mongoose';
import { IMessage } from '../interface/model/message.model.interface';

const messageSchema = new Schema<IMessage>(
  {
    chatId: {
      type: Schema.Types.ObjectId,
      ref: 'Chat',
      required: true,
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
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
        type: Schema.Types.ObjectId,
        refPath: 'role',
      },
    ],

    isDeleted: {
      type: Boolean,
      default: false,
    },

    replyTo: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
    // 🆕
    reactions: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          required: true,
        },
        emoji: {
          type: String,
          required: true,
        },
      },
    ],

    editedAt: Date,
  },

  {
    timestamps: true,
  },
);

export const MessageModel = model<IMessage>('Message', messageSchema);
