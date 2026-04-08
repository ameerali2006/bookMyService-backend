import { Document, Types } from 'mongoose';

export interface INotification extends Document {
  userId?: Types.ObjectId|string
  workerId?: Types.ObjectId|string
  title: string;
  message: string;
  type: 'booking' | 'payment' | 'review' | 'system';
  isRead: boolean;
  createdAt: Date;
}
