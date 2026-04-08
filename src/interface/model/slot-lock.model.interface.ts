import { Document, Types } from 'mongoose';

export interface ISlotLock extends Document {
  _id: Types.ObjectId;

  workerId: Types.ObjectId|string;
  date: Date;

  startTime: Date;
  endTime: Date;

  lockedBy: Types.ObjectId|string;

  expiresAt: Date;

  createdAt: Date;
  updatedAt: Date;
}
