import mongoose, { Schema, Document, Types } from 'mongoose';
import { IWorker } from '../interface/model/worker.model.interface';

export const WorkerSchema: Schema = new Schema<IWorker>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    profileImage: { type: String, default: '' },
    googleId: { type: String, unique: true, sparse: true },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },

    zone: { type: String, required: true, trim: true },

    experience: {
      type: String,
      enum: ['0-1', '2-5', '6-10', '10+'],
      required: true,
    },

    category: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    description: {
      type: String,
      require: false,
    },
    skills: {
      type: [String],
      require: false,
    },

    fees: { type: Number, default: 200 },
    isBlocked: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false },
    isVerified: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },

    documents: { type: String },
  },
  {
    timestamps: true,
  },
);
WorkerSchema.index({ location: '2dsphere' });
export const WorkerModel = mongoose.model<IWorker>('Worker', WorkerSchema);
