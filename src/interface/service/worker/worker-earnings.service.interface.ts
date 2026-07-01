import { Readable } from 'stream';

export interface IWorkerEarningsService {
  getEarningsSummary(workerId: string): Promise<{
    success: boolean;
    data: {
      lifetimeEarnings: number;
      todayEarnings: number;
      thisWeekEarnings: number;
      thisMonthEarnings: number;
      totalCompletedJobs: number;
      averageEarnings: number;
    };
  }>;

  getEarningsList(
    workerId: string,
    query: {
      page: number;
      limit: number;
      from?: string;
      to?: string;
      search?: string;
    },
  ): Promise<{
    success: boolean;
    data: {
      bookings: any[];
      total: number;
      page: number;
      limit: number;
    };
  }>;

  generateEarningsPdf(
    workerId: string,
    query: {
      from?: string;
      to?: string;
      search?: string;
    },
  ): Promise<{
    pdfStream: Readable;
    filename: string;
  }>;
}
