import { model, Schema } from 'mongoose';
import { INotification } from '../interface/model/notification.model.interface';

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    workerId: { type: Schema.Types.ObjectId, ref: 'Worker' },

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
  },
  { timestamps: true },
);

export const NotificationModel = model<INotification>('Notification', NotificationSchema);
