export interface WalletTransactionQuery {
  page: number
  limit: number
  type?: string
  status?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  startDate?: string
  endDate?: string
}
