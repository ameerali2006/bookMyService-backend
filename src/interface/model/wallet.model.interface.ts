import { Document, Types } from 'mongoose';

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'refunded'
  | 'partially_refunded';
export interface IWallet extends Document {
  _id: Types.ObjectId|string;
  userId: Types.ObjectId|string;
  role: 'user' | 'worker' | 'admin';
  balance: number;
  isFrozen: boolean;
  lastActivityAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
