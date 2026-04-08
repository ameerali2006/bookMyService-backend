import mongoose, { Schema } from 'mongoose';
import { IOtp } from '../interface/model/otp.model.interface';

const OtpSchema = new Schema<IOtp>(
  {
    email: { type: String, required: true },
    otp: { type: String, required: true },
    expireAt: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now, expires: 120 }, // Auto-delete after 120s
  },
  { collection: 'otp' },
);

const OtpModel = mongoose.model<IOtp>('Otp', OtpSchema);
export default OtpModel;
