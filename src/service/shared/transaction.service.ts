import { inject, injectable } from 'tsyringe';
import { TYPES } from '../../config/constants/types';
import { WalletTransactionQuery } from '../../dto/shared/wallet.dto';
import { IWalletRepository } from '../../interface/repository/wallet.repository.interface';
import { ITransactionService } from '../../interface/service/transaction.service.interface';
import { ITransactionRepository } from '../../interface/repository/transaction.repository.interface';
import { TransactionResponseDTO } from '../../dto/shared/transaction.dt';
import { SharedMapper } from '../../utils/mapper/shared-mapping';

@injectable()
export class TransactionService implements ITransactionService {
  constructor(
        @inject(TYPES.WalletRepository) private _walletRepo:IWalletRepository,
        @inject(TYPES.TransactionRepository) private _transactionRepo:ITransactionRepository,

  ) {}

  async getTransactionData(
    ownerId: string,
    role: 'user' | 'admin' | 'worker',
    query: WalletTransactionQuery,
  ): Promise<{
    success: boolean;
    message: string;
    data: {
      transactions: TransactionResponseDTO[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    };
  }> {
    const wallet = await this._walletRepo.findByUser(ownerId, role);

    if (!wallet) {
      return {
        success: false,
        message: 'Wallet not found',
        data: {
          transactions: [],
          pagination: {
            page: query.page,
            limit: query.limit,
            total: 0,
            totalPages: 0,
          },
        },
      };
    }

    const result = await this._transactionRepo.findWithFilters(
      wallet._id.toString(),
      query,
    );
    const transactions = SharedMapper.toTransactionResponseList(result.transactions);

    return {
      success: true,
      message: 'Transactions fetched successfully',
      data: {
        transactions,
        pagination: {
          page: query.page,
          limit: query.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / (query.limit ?? 10)),
        },
      },
    };
  }
}
