import { TransactionResponseDTO } from '../../dto/shared/transaction.dt';
import { WalletTransactionQuery } from '../../dto/shared/wallet.dto';

export interface ITransactionService{
    getTransactionData(ownerId:string, role:'user'|'admin'|'worker', query:WalletTransactionQuery):Promise<{
  success: boolean
  message: string
  data: {
    transactions: TransactionResponseDTO[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
}>
}
