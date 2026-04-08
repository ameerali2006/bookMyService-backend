// models/review.model.ts

import { Schema, model } from 'mongoose';
import { IReview } from '../interface/model/review.model.interface';

const ReviewSchema = new Schema<IReview>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true,
    },

    workerId: {
      type: Schema.Types.ObjectId,
      ref: 'Worker',
      required: true,
      index: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    isVisible: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

ReviewSchema.index({ workerId: 1, createdAt: -1 });
ReviewSchema.index({ workerId: 1, rating: -1 });

export const Review = model<IReview>('Review', ReviewSchema);
