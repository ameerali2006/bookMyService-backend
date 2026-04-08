import { responsePart } from '../../dto/shared/responsePart';
import { IWallet } from '../model/wallet.model.interface';

export interface IAddBalanceInput {
  userId: string;
  role: 'user' | 'worker' | 'admin';
  amount: number;
  description?: string;
  type?: 'REFUND' | 'TOPUP' | 'PAYOUT' | 'COMMISSION';
}
export interface IWalletService {
  addBalance(data: IAddBalanceInput): Promise<responsePart>;
  getWalletData(
    ownerId: string,
    role: 'user' | 'admin' | 'worker',
  ): Promise<{
    success: boolean;
    message: string;
    data: {
      balance: number;
      isFrozen: boolean;
      lastActivityAt: Date;
      role: 'user' | 'admin' | 'worker';
    };
  }>;
  creditAdminWallet(
    amount: number,
    paymentIntentId: string,
  ): Promise<IWallet | null>
  debitBalance(data: {
    userId: string;
    role: 'user' | 'worker' | 'admin';
    amount: number;
    description?: string;
    type: 'REFUND' | 'TOPUP' | 'HOLD' | 'RELEASE' | 'PAYOUT' | 'COMMISSION' | 'ADJUSTMENT' | 'BONUS' | 'PENALTY';
  }): Promise<responsePart>
}
