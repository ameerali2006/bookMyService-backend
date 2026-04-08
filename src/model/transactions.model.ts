import {
  InferSchemaType, model, Schema, Types,
} from 'mongoose';
import { ITransaction } from '../interface/model/transactions.modal.interface';

const TransactionSchema = new Schema(
  {
    walletId: {
      type: Schema.Types.ObjectId,
      ref: 'Wallet',
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: [
        'TOPUP',
        'HOLD',
        'RELEASE',
        'PAYOUT',
        'REFUND',
        'COMMISSION',
        'ADJUSTMENT',
        'BONUS',
        'PENALTY',
      ],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    direction: {
      type: String,
      enum: ['CREDIT', 'DEBIT'],
      required: true,
    },

    balanceBefore: {
      type: Number,
      required: true,
    },

    balanceAfter: {
      type: Number,
      required: true,
    },

    description: {
      type: String,
    },

    status: {
      type: String,
      enum: ['SUCCESS', 'PENDING', 'FAILED'],
      default: 'SUCCESS',
    },
  },
  { timestamps: true },
);

export const TransactionModel = model<ITransaction>(
  'Transaction',
  TransactionSchema,
);
