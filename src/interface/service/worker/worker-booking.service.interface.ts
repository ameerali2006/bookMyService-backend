import { WorkerBookingListRequest } from '../../../controller/validation/allBookingList.zod';
import { responsePart } from '../../../dto/shared/responsePart';
import {
  allBookingDto,
  ApprovedServices,
  getServiceRequestsResponseDto,
  getWorkerApprovedBookingsRequestDto,
  getWorkerApprovedBookingsResponseDto,
  getWorkerAprrovalpageDetailsResponseDto,
  IWorkerRequestResponse,
  reachedCustomerLocationResponseDto,
  workerComplateWorkResponseDto,
} from '../../../dto/worker/working-details.dto';
import { IBookingPopulated } from '../../model/booking.model.interface';

export interface serviceData {
  bookingId: string;
  serviceName: string;
  durationHours: number;
  distance: number;
  additionalItems?: {
    name: string;
    price: number;
  }[];
  additionalNotes?: string;
}
export interface IRequestFilters {
  workerId: string;
  search?: string;
  status?: 'pending' | 'accepted' | 'rejected';
  advancePaymentStatus: 'paid';
  date?: string;
  page: number;
  limit: number;
}
export interface IWorkerBookingService {
  approveService(data: serviceData): Promise<responsePart>;
  rejectService(bookingId: string, description: string): Promise<responsePart>;
  getServiceRequests(
    filter: IRequestFilters
  ): Promise<getServiceRequestsResponseDto>;
  getWorkerApprovedBookings(
    query: getWorkerApprovedBookingsRequestDto
  ): Promise<getWorkerApprovedBookingsResponseDto>;
  getWorkerAprrovalpageDetails(
    bookingid: string
  ): Promise<getWorkerAprrovalpageDetailsResponseDto>;
  reachedCustomerLocation(
    bookingid: string
  ): Promise<reachedCustomerLocationResponseDto>;
  verifyWorker(bookingId: string, otp: string): Promise<responsePart>;
  workerComplateWork(bookingId: string): Promise<workerComplateWorkResponseDto>;
  getWorkerBookings(
    workerId: string,
    query: WorkerBookingListRequest
  ): Promise<{
    success: boolean;
    message: string;
    data?: {
      bookings: allBookingDto[];
      total: number;
      page: number;
      limit: number;
    };
  }>;
}
