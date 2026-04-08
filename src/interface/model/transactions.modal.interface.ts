import { Document } from 'mongoose';

export interface ITransaction extends Document{
  _id: string;
  walletId: string;

  type:
    | 'TOPUP'
    | 'HOLD'
    | 'RELEASE'
    | 'PAYOUT'
    | 'REFUND'
    | 'COMMISSION'
    | 'ADJUSTMENT'
    | 'BONUS'
    | 'PENALTY';

  amount: number;
  direction: 'CREDIT' | 'DEBIT';

  balanceBefore: number;
  balanceAfter: number;

  description?: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  createdAt: Date;
  updatedAt: Date;
}
