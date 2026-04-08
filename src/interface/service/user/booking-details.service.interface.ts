import {
  bookingDetailDataResponseDto, BookingDetailDto, ongoingBookingDto, ongoingBookingsResponseDto,
} from '../../../dto/user/booking-details.dto';
import { IBooking } from '../../model/booking.model.interface';

export interface IBookingDetailsService{
    ongoingBookings(userId:string, limit:number, skip:number, search:string):Promise<ongoingBookingsResponseDto>
    bookingDetailData(bookingId:string):Promise<bookingDetailDataResponseDto>

      updatePaymentStatus(
        bookingId: string,
        addressId: string,
        paymentType: 'advance' | 'final',
      ):Promise<IBooking|null>
}
