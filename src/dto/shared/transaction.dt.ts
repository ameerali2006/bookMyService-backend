export interface TransactionResponseDTO {
  id: string
  type: 'TOPUP' | 'HOLD' | 'RELEASE' | 'PAYOUT' | 'REFUND' | 'COMMISSION' | 'ADJUSTMENT' | 'BONUS' | 'PENALTY'
  direction: 'CREDIT' | 'DEBIT'
  amount: number
  balanceBefore: number
  balanceAfter: number
  status: 'SUCCESS' | 'PENDING' | 'FAILED'
  createdAt: Date
  description?: string
}
