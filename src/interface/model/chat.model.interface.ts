import { Document, Types } from 'mongoose';

export interface IChat extends Document {
  _id: Types.ObjectId|string;

  userId: Types.ObjectId|string;
  workerId: Types.ObjectId|string;
  createdAt: Date;
  updatedAt: Date;
}
