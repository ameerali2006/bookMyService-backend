import { inject, injectable } from 'tsyringe';
import { string } from 'zod';
import { TYPES } from '../../config/constants/types';
import {
  BookingDetailDto, ongoingBookingDto, ongoingBookingsResponseDto, bookingDetailDataResponseDto,
} from '../../dto/user/booking-details.dto';
import { IBookingRepository } from '../../interface/repository/booking.repository.interface';
import { IBookingDetailsService } from '../../interface/service/user/booking-details.service.interface';
import { UserMapper } from '../../utils/mapper/user-mapper';
import { IBooking } from '../../interface/model/booking.model.interface';

@injectable()
export class BookingDetailsService implements IBookingDetailsService {
  constructor(
        @inject(TYPES.BookingRepository) private bookingRepo:IBookingRepository,
  ) {}

  async ongoingBookings(userId:string, limit: number, skip: number, search: string): Promise<ongoingBookingsResponseDto> {
    try {
      const statuses = ['pending', 'confirmed', 'in-progress', 'awaiting-final-payment', 'completed'];
      const workerResponses = ['pending', 'accepted'];

      const { bookings, total } = await this.bookingRepo.findBookingListByUserId(
        userId,
        statuses,
        workerResponses,
        limit,
        skip,
        search,
      );

      console.log(bookings);
      if (!bookings) {
        return {
          success: false,
          message: 'No bookings found',
        };
      }

      const formatted = UserMapper.ongoingBooking(bookings);

      return {
        success: true,
        message: 'Ongoing bookings fetched successfully',
        data: {
          data: formatted,
          total,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'internal Error',
      };
    }
  }

  async bookingDetailData(bookingId: string): Promise<bookingDetailDataResponseDto> {
    try {
      if (!bookingId) {
        return { success: false, message: 'bookiing detail is missing' };
      }
      const bookingData = await this.bookingRepo.findByIdPopulated(bookingId);
      if (!bookingData) {
        return { success: false, message: 'booking not fount' };
      }
      const dtoData = UserMapper.bookingDetail(bookingData);
      return { success: true, message: 'successfully fetched data', booking: dtoData };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: 'internal Error',
      };
    }
  }

  async updatePaymentStatus(
    bookingId: string,
    addressId: string,
    paymentType: 'advance' | 'final',
  ):Promise<IBooking|null> {
    const updateData: Partial<IBooking> = {
      address: addressId,
    };

    if (paymentType === 'advance') {
      updateData.advancePaymentStatus = 'paid';
      updateData.status = 'confirmed';
    }

    if (paymentType === 'final') {
      updateData.finalPaymentStatus = 'paid';
      updateData.status = 'completed';
    }

    return await this.bookingRepo.updateById(bookingId, updateData);
  }
}
