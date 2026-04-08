import { Document, Types } from 'mongoose';

export interface IReview extends Document{
   _id: Types.ObjectId;
  bookingId: Types.ObjectId|string;
  workerId: Types.ObjectId|string;
  userId: Types.ObjectId|string;

  rating: number;
  comment: string;

  isVisible?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
