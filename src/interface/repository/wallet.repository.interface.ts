// src/interface/repository/wallet.repository.interface.ts
import { IWallet } from '../model/wallet.model.interface';
import { IBaseRepository } from './base.repository.interface';

export interface IWalletRepository extends IBaseRepository<IWallet>{
  createWallet(data: Partial<IWallet>): Promise<IWallet>;
  findById(id: string): Promise<IWallet | null>;
  findByUser(userId: string, role: 'user'|'admin'|'worker'): Promise<IWallet | null>;
  updateBalance(id: string, balance: number): Promise<IWallet | null>;
  freezeWallet(id: string): Promise<IWallet | null>;
  unfreezeWallet(id: string): Promise<IWallet | null>;
  updateLastActivity(id: string): Promise<IWallet | null>;
  deleteWallet(id: string): Promise<IWallet | null>;
  findByRole(role: 'user'|'admin'|'worker'): Promise<IWallet[]>;
  findAdminWallet(): Promise<IWallet|null>;
}
