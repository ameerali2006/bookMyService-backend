import { WalletTransactionQuery } from '../../dto/shared/wallet.dto';
import { ITransaction } from '../model/transactions.modal.interface';
import { IBaseRepository } from './base.repository.interface';

export interface ITransactionRepository extends IBaseRepository<ITransaction> {
  createTransaction(data: Partial<ITransaction>): Promise<ITransaction>;
  findById(id: string): Promise<ITransaction | null>;
  findByWalletId(walletId: string): Promise<ITransaction[]>;
  findLatestTransaction(walletId: string): Promise<ITransaction | null>;
  findByType(walletId: string, type: string): Promise<ITransaction[]>;
  deleteTransaction(id: string): Promise<ITransaction | null>;
  findWithFilters(
    walletId: string,
    query: WalletTransactionQuery,
  ): Promise<{
    transactions: ITransaction[];
    total: number;
  }>;
}
