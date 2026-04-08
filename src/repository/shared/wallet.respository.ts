// src/repository/implementation/wallet.repository.ts
import { injectable } from 'inversify';

import { BaseRepository } from './base.repository';
import { WalletModel } from '../../model/wallet.model';
import { IWallet } from '../../interface/model/wallet.model.interface';
import { IWalletRepository } from '../../interface/repository/wallet.repository.interface';

@injectable()
export class WalletRepository
  extends BaseRepository<IWallet>
  implements IWalletRepository {
  constructor() {
    super(WalletModel);
  }

  async createWallet(data: Partial<IWallet>): Promise<IWallet> {
    return await WalletModel.create(data);
  }

  async findById(id: string): Promise<IWallet | null> {
    return await WalletModel.findById(id).exec();
  }

  async findByUser(userId: string, role: string): Promise<IWallet | null> {
    return await WalletModel.findOne({ userId, role }).exec();
  }

  async updateBalance(id: string, balance: number): Promise<IWallet | null> {
    return await WalletModel.findByIdAndUpdate(
      id,
      { balance, lastActivityAt: new Date() },
      { new: true },
    );
  }

  async freezeWallet(id: string): Promise<IWallet | null> {
    return await WalletModel.findByIdAndUpdate(
      id,
      { isFrozen: true, lastActivityAt: new Date() },
      { new: true },
    );
  }

  async unfreezeWallet(id: string): Promise<IWallet | null> {
    return await WalletModel.findByIdAndUpdate(
      id,
      { isFrozen: false, lastActivityAt: new Date() },
      { new: true },
    );
  }

  async updateLastActivity(id: string): Promise<IWallet | null> {
    return await WalletModel.findByIdAndUpdate(
      id,
      { lastActivityAt: new Date() },
      { new: true },
    );
  }

  async deleteWallet(id: string): Promise<IWallet | null> {
    return await WalletModel.findByIdAndDelete(id);
  }

  async findByRole(role: 'user'|'admin'|'worker'): Promise<IWallet[]> {
    return await WalletModel.find({ role }).sort({ createdAt: -1 }).exec();
  }

  async findAdminWallet(): Promise<IWallet|null> {
    return await WalletModel.findOne({ role: 'admin' });
  }
}
