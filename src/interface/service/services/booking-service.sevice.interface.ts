import {
  getBookingDetailsResponseDTO, setBasicBookingDetailsResponse, updateWorkerDetailsRequestDto, updateWorkerDetailsResponseDto, verifyPaymentResponseDto,
} from '../../../dto/service.dto';
import { IBooking } from '../../model/booking.model.interface';

export interface VerifiedPaymentResult {
  bookingId: string
  amountPaid: number
  type: 'advance' | 'final'

}
export interface BookingDetails {
  workerName: string;
  serviceName: string;
  date: string;
  time: string;
  description: string;
  advancePaymentStatus?:'unpaid' | 'paid' | 'failed' | 'refunded'
  advance: number;
}
export interface IBookingService {
  setBasicBookingDetails(
    userId: string,
    workerId: string,
    time: string,
    date: Date,
    description: string
  ): Promise<setBasicBookingDetailsResponse>;
  getBookingDetails(
    bookingId: string
  ): Promise<getBookingDetailsResponseDTO>;
  updateWorkerDetails(data: updateWorkerDetailsRequestDto): Promise<updateWorkerDetailsResponseDto>;
  verifyPayment(
    bookingId: string,
    paymentType: 'advance' | 'final'
  ): Promise<verifyPaymentResponseDto>;
}
