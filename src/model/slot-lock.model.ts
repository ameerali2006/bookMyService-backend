import { Schema, model, Types } from 'mongoose';

const SlotLockSchema = new Schema({
  workerId: { type: Types.ObjectId, required: true },
  date: { type: Date, required: true },

  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },

  lockedBy: { type: Types.ObjectId, required: true },

  expiresAt: { type: Date, required: true },
}, { timestamps: true });

SlotLockSchema.index({ workerId: 1, startTime: 1, endTime: 1 });

SlotLockSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const SlotLockModel = model('SlotLock', SlotLockSchema);
