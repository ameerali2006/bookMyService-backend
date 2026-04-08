import { model, Schema } from 'mongoose';
import { IWallet } from '../interface/model/wallet.model.interface';

const WalletSchema = new Schema<IWallet>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
      refPath: 'role',
    },

    role: {
      type: String,
      enum: ['user', 'worker', 'admin'],
      required: true,
    },

    balance: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    isFrozen: {
      type: Boolean,
      default: false,
    },

    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

export const WalletModel = model<IWallet>('Wallet', WalletSchema);
