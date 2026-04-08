import { Schema, model } from 'mongoose';
import { IBooking } from '../interface/model/booking.model.interface';

const BookingSchema = new Schema<IBooking>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    workerId: { type: Schema.Types.ObjectId, ref: 'Worker', required: true },
    serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: true },

    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String },
    description: { type: String },

    address: { type: Schema.Types.ObjectId, ref: 'Address' },

    advanceAmount: { type: Number, required: true, default: 100 },
    totalAmount: { type: Number, default: 0 },
    remainingAmount: { type: Number, default: 0 },

    advancePaymentId: { type: String },
    advancePaymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'failed', 'refunded'],
      default: 'unpaid',
    },

    finalPaymentId: { type: String },
    finalPaymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'failed', 'refunded'],
      default: 'unpaid',
    },

    paymentMethod: {
      type: String,
      enum: ['stripe', 'upi', 'cash'],
    },

    additionalItems: [
      {
        name: { type: String },
        price: { type: Number },
      },
    ],
    paymentBreakdown: [
      {
        title: { type: String, required: true },
        rate: { type: Number, required: true },
        rateLabel: { type: String, required: true },
        quantity: { type: Number, required: true },
        total: { type: Number, required: true },
      },
    ],

    status: {
      type: String,
      enum: [
        'pending',
        'confirmed',
        'in-progress',
        'awaiting-final-payment',
        'completed',
        'cancelled',
      ],
      default: 'pending',
    },

    workerResponse: {
      type: String,
      enum: ['accepted', 'rejected', 'pending'],
      default: 'pending',
    },

    otp: { type: String },
    isSettled: { type: Boolean, default: false },

    reviewId: {
      type: Schema.Types.ObjectId,
      ref: 'Review',
      default: null,
    },
  },
  { timestamps: true },
);

export const Booking = model<IBooking>('Booking', BookingSchema);
