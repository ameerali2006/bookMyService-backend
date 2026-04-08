import { inject, injectable } from 'tsyringe';
import { TYPES } from '../../config/constants/types';
import { responsePart } from '../../dto/shared/responsePart';
import { IWalletRepository } from '../../interface/repository/wallet.repository.interface';
import { ITransactionRepository } from '../../interface/repository/transaction.repository.interface';
import {
  IAddBalanceInput,
  IWalletService,
} from '../../interface/service/wallet.service.interface';

import { IWallet } from '../../interface/model/wallet.model.interface';

@injectable()
export class WalletService implements IWalletService {
  constructor(
    @inject(TYPES.WalletRepository) private walletRepo: IWalletRepository,
    @inject(TYPES.TransactionRepository)
    private walletTransaction: ITransactionRepository,
  ) {}

  private async getOrCreateWallet(
    userId: string,
    role: 'user' | 'worker' | 'admin',
  ) {
    let wallet = await this.walletRepo.findByUser(userId, role);

    if (!wallet) {
      wallet = await this.walletRepo.create({
        userId,
        role,
        balance: 0,
        isFrozen: false,
      });
    }

    return wallet;
  }

  async addBalance(data: IAddBalanceInput): Promise<responsePart> {
    try {
      const {
        userId, role, amount, description,
      } = data;

      const wallet = await this.getOrCreateWallet(userId, role);

      if (wallet.isFrozen) { return { success: false, message: 'Wallet is frozen' }; }

      const balanceBefore = wallet.balance;
      const balanceAfter = wallet.balance + amount;

      const transactionPayload = {
        walletId: wallet._id.toString(),
        type: data.type || 'TOPUP',
        amount,
        direction: 'CREDIT',
        balanceBefore,
        balanceAfter,
        description: description || 'Balance credited',
        status: 'SUCCESS',
      } as const;

      await Promise.all([
        this.walletRepo.updateBalance(wallet._id.toString(), balanceAfter),
        this.walletTransaction.createTransaction(transactionPayload),
      ]);

      return { success: true, message: 'Balance credited successfully' };
    } catch (error) {
      return { success: false, message: 'Something went wrong' };
    }
  }

  async getWalletData(
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
  }> {
    const wallet = await this.getOrCreateWallet(ownerId, role);

    if (!wallet) {
      return {
        success: false,
        message: 'Wallet not found',
        data: {
          balance: 0,
          isFrozen: false,
          lastActivityAt: new Date(),
          role,
        },
      };
    }

    return {
      success: true,
      message: 'Wallet data fetched successfully',
      data: {
        balance: wallet.balance,
        isFrozen: wallet.isFrozen,
        lastActivityAt: wallet.updatedAt,
        role,
      },
    };
  }

  async creditAdminWallet(
    amount: number,
    paymentIntentId: string,
  ): Promise<IWallet | null> {
    const adminWallet = await this.walletRepo.findAdminWallet();
    if (!adminWallet) return null;

    const before = adminWallet.balance;
    const after = before + amount;

    await this.walletTransaction.createTransaction({
      walletId: adminWallet._id.toString(),
      type: 'TOPUP',
      direction: 'CREDIT',
      amount,
      balanceBefore: before,
      balanceAfter: after,
      status: 'SUCCESS',
      description: `Stripe payment credited to admin wallet (${paymentIntentId})`,
    });

    return await this.walletRepo.updateById(adminWallet._id.toString(), {
      balance: after,
      lastActivityAt: new Date(),
    });
  }

  async debitBalance(data: {
    userId: string;
    role: 'user' | 'worker' | 'admin';
    amount: number;
    description?: string;
    type: 'REFUND' | 'TOPUP' | 'HOLD' | 'RELEASE' | 'PAYOUT' | 'COMMISSION' | 'ADJUSTMENT' | 'BONUS' | 'PENALTY';
  }): Promise<responsePart> {
    try {
      const {
        userId, role, amount, description, type,
      } = data;

      const wallet = await this.getOrCreateWallet(userId, role);

      if (wallet.isFrozen) { return { success: false, message: 'Wallet is frozen' }; }

      if (wallet.balance < amount) { return { success: false, message: 'Insufficient wallet balance' }; }

      const balanceBefore = wallet.balance;
      const balanceAfter = wallet.balance - amount;

      const transactionPayload = {
        walletId: wallet._id.toString(),
        type,
        amount,
        direction: 'DEBIT',
        balanceBefore,
        balanceAfter,
        description: description || 'Wallet payment',
        status: 'SUCCESS',
      } as const;

      await Promise.all([
        this.walletRepo.updateBalance(wallet._id.toString(), balanceAfter),
        this.walletTransaction.createTransaction(transactionPayload),
      ]);

      return {
        success: true,
        message: 'Payment completed successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Something went wrong',
      };
    }
  }
}
