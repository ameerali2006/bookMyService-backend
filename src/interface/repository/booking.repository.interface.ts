import { IAdminDashboardRaw } from '../../dto/admin/admin-dashboard.dto';
import {
  BookingStatus,
  IBooking,
  IBookingPopulated,
} from '../model/booking.model.interface';
import { PaymentStatus } from '../model/wallet.model.interface';

import { IRequestFilters } from '../service/worker/worker-booking.service.interface';
import { IBaseRepository } from './base.repository.interface';

export interface IWorkerDashboardRepoResult {
  totalJobs: number;
  completedJobs: number;
  monthlyEarnings: number;
  upcomingJobs: number;
  avgRating: number;
  totalReviews: number;
  todaySchedule: IBookingPopulated[];
}

export interface IBookingRepository extends IBaseRepository<IBooking> {
  createBooking(data: Partial<IBooking>): Promise<IBooking>;
  // findById(id: string): Promise<IBooking | null>;
  // findByUserId(userId: string): Promise<IBooking[]>;
  // findByWorkerId(workerId: string): Promise<IBooking[]>;
  findServiceRequests(
    filters: IRequestFilters,
  ): Promise<{ data: IBookingPopulated[]; total: number }>;
  findByIdPopulated(id: string): Promise<IBookingPopulated | null>;
  findByUserId(userId: string): Promise<IBookingPopulated[]>;
  findByWorkerId(workerId: string): Promise<IBookingPopulated[]>;
  updateStatus(id: string, status: BookingStatus): Promise<IBooking | null>;
  updateWorkerResponse(id: string, response: string): Promise<IBooking | null>;
  updateStatusWithOTP(
    id: string,
    status:
      | 'pending'
      | 'confirmed'
      | 'in-progress'
      | 'awaiting-final-payment'
      | 'completed'
      | 'cancelled',
  ): Promise<IBooking | null>;
  updatePaymentStatus(
    id: string,
    paymentStatus: string,
    paymentId?: string,
  ): Promise<IBooking | null>;
  addRating(
    id: string,
    score: number,
    review?: string,
  ): Promise<IBooking | null>;
  cancelBooking(id: string): Promise<IBooking | null>;
  findByWorkerAndDate(workerId: string, date: Date): Promise<IBooking[]>;
  findBookingWithinTimeRange(
    workerId: string,
    date: Date,
    startTime: Date,
    endTime: Date,
  ): Promise<IBooking | null>;
  findByIdWithDetails(id: string): Promise<IBooking | null>;
  updateAdvancePaymentStatus(
    bookingId: string,
    paymentIntentId: string,
    status: PaymentStatus,
    addressId: string,
  ): Promise<IBooking | null>;
  updateFinalPaymentStatus(
    bookingId: string,
    paymentIntentId: string,
    status: PaymentStatus,
  ): Promise<IBooking | null>;
  findByWorkerAndRange(
    workerId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<
    Array<{
      date: Date;
      startTime: string;
      endTime?: string | null;
      advancePaymentStatus?: 'unpaid' | 'paid' | 'failed' | 'refunded';
    }>
  >;
  findPendingAdvanceBookings(workerId: string): Promise<IBooking[]>;
  findBookingListByUserId(
    userId: string,
    status: string[],
    workerResponse: string[],
    limit: number,
    skip: number,
    search: string,
  ): Promise<{ bookings: IBookingPopulated[] | null; total: number }>;
  findWorkerApprovedBookings({
    workerId,
    page,
    limit,
    search,
    status,
  }: {
    workerId: string;
    page: number;
    limit: number;
    search?: string;
    status?: 'approved' | 'in-progress' | 'awaiting-final-payment';
  }): Promise<{ items: IBookingPopulated[] | null; total: number }>;
  getAllBookings(params: {
    search?: string;
    status?: string;
    limit?: number;
    page?: number;
  }): Promise<{
    data: IBookingPopulated[];
    total: number;
    page: number;
    limit: number;
  }>;
  allBookingList(params: {
    workerId: string;

    page: number;
    limit: number;

    search?: string;
    statuses?: string[];
    workerResponses?: string[];

    from?: Date;
    to?: Date;
  }): Promise<{
    items: IBookingPopulated[];
    total: number;
  }>;
  getWorkerDashboardStats(
    workerId: string,
  ): Promise<IWorkerDashboardRepoResult>;
  getDashboardRawData(): Promise<IAdminDashboardRaw[]>
  findUnsettledCompleted(): Promise<IBooking[]>;
  markAsSettled(ids: string[]): Promise<void>;
}
