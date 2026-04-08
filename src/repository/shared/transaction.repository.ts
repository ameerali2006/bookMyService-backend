// src/repository/implementation/wallet-transaction.repository.ts
import { injectable } from 'inversify';

import { BaseRepository } from './base.repository';

import { ITransactionRepository } from '../../interface/repository/transaction.repository.interface';
import { ITransaction } from '../../interface/model/transactions.modal.interface';
import { TransactionModel } from '../../model/transactions.model';
import { WalletTransactionQuery } from '../../dto/shared/wallet.dto';

@injectable()
export class TransactionRepository
  extends BaseRepository<ITransaction>
  implements ITransactionRepository {
  constructor() {
    super(TransactionModel);
  }

  async createTransaction(data: Partial<ITransaction>): Promise<ITransaction> {
    return await TransactionModel.create(data);
  }

  async findById(id: string): Promise<ITransaction | null> {
    return await TransactionModel.findById(id)
      .populate('walletId')
      .exec();
  }

  async findByWalletId(walletId: string): Promise<ITransaction[]> {
    return await TransactionModel.find({ walletId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findLatestTransaction(walletId: string): Promise<ITransaction | null> {
    return await TransactionModel.findOne({ walletId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByType(walletId: string, type: string): Promise<ITransaction[]> {
    return await TransactionModel.find({ walletId, type })
      .sort({ createdAt: -1 })
      .exec();
  }

  async deleteTransaction(id: string): Promise<ITransaction | null> {
    return await TransactionModel.findByIdAndDelete(id);
  }

  async findWithFilters(
    walletId: string,
    query: WalletTransactionQuery,
  ): Promise<{
  transactions: ITransaction[];
  total: number;
}> {
    const {
      page = 1,
      limit = 10,
      type,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      startDate,
      endDate,
    } = query;

    const filter: any = {
      walletId: walletId.toString(),
    };

    if (type) filter.type = type;
    if (status) filter.status = status;

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    const [transactions, total] = await Promise.all([
      TransactionModel.find(filter)
        .sort({ [sortBy]: sortDirection })
        .skip(skip)
        .limit(limit)
        .exec(),
      TransactionModel.countDocuments(filter),
    ]);

    return {
      transactions,
      total,
    };
  }
}
