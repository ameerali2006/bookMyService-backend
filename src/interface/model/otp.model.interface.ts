import { Document } from 'mongoose';

export interface IOtp extends Document {
  email: string;
  otp: string;
  expireAt: Date;
  createdAt?: Date;
}
