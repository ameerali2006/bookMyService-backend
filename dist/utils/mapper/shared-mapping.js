"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SharedMapper = void 0;
class SharedMapper {
    static toTransactionResponse(transaction) {
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
    static toTransactionResponseList(transactions) {
        return transactions.map(this.toTransactionResponse);
    }
}
exports.SharedMapper = SharedMapper;
