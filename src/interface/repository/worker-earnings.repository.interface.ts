import { IBooking, IBookingPopulated } from '../model/booking.model.interface';

export interface IEarningsListQuery {
  page: number;
  limit: number;
  from?: Date;
  to?: Date;
  search?: string;
}

export interface IWorkerEarningsRepository {
  findEarningsSummary(workerId: string): Promise<IBooking[]>;
  findEarningsList(
    workerId: string,
    query: IEarningsListQuery,
  ): Promise<{ bookings: IBookingPopulated[]; total: number }>;
}
