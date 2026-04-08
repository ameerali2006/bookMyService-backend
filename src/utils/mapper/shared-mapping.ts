import { TransactionResponseDTO } from '../../dto/shared/transaction.dt';
import { ITransaction } from '../../interface/model/transactions.modal.interface';

export class SharedMapper {
  static toTransactionResponse(
    transaction: ITransaction,
  ): TransactionResponseDTO {
    return {
      id: transaction._id.toString(),
      type: transaction.type,
      direction: transaction.direction,
      amount: transaction.amount,
      balanceBefore: transaction.balanceBefore,
      balanceAfter: transaction.balanceAfter,
      status: transaction.status,
      description: transaction.description,
      createdAt: new Date(transaction.createdAt),
    };
  }

  static toTransactionResponseList(
    transactions: ITransaction[],
  ): TransactionResponseDTO[] {
    return transactions.map(this.toTransactionResponse);
  }
}
