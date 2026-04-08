import { inject, injectable } from 'tsyringe';
import {
  BookingDetails,
  IBookingService,
  VerifiedPaymentResult,
} from '../../interface/service/services/booking-service.sevice.interface';
import {
  setBasicBookingDetailsResponse,
  getBookingDetailsResponseDTO,
  updateWorkerDetailsResponseDto,
  verifyPaymentResponseDto,
} from '../../dto/service.dto';
import { TYPES } from '../../config/constants/types';
import { IBookingRepository } from '../../interface/repository/booking.repository.interface';
import { IWorkerRepository } from '../../interface/repository/worker.repository.interface';
import { IBooking } from '../../interface/model/booking.model.interface';
import { ISlotLockRepository } from '../../interface/repository/slot-lock.repository.interface';

@injectable()
export class BookingService implements IBookingService {
  constructor(
    @inject(TYPES.BookingRepository) private _bookingRepo: IBookingRepository,
    @inject(TYPES.WorkerRepository) private _workerRepo: IWorkerRepository,
    @inject(TYPES.SlotLockRepository)
    private _slotLockRepo: ISlotLockRepository,
  ) {}

  async setBasicBookingDetails(
    userId: string,
    workerId: string,
    time: string,
    date: Date,
    description: string,
  ): Promise<setBasicBookingDetailsResponse> {
    try {
      if (!userId || !workerId) {
        return {
          success: false,
          message: 'User not Found',
          bookingId: null,
        };
      }
      if (!time || !date || !description) {
        return {
          success: false,
          message: 'Missing required fields (time, date, or description)',
          bookingId: null,
        };
      }

      if (isNaN(new Date(date).getTime())) {
        return {
          success: false,
          message: 'Invalid date format',
          bookingId: null,
        };
      }
      const workerData = await this._workerRepo.findById(workerId);

      if (!workerData) {
        return {
          success: false,
          message: 'worker is not found',
          bookingId: null,
        };
      }
      const bookingDate = new Date(date);

      const [h, m] = time.split(':').map(Number);
      bookingDate.setHours(h, m, 0, 0);

      const startTime = new Date(bookingDate);
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

      /* 🔐 TRY LOCK */
      const locked = await this._slotLockRepo.acquireLock(
        workerId,
        date,
        startTime,
        endTime,
        userId,
      );

      if (!locked) {
        return {
          success: false,
          message: 'Slot already booked by another user',
          bookingId: null,
        };
      }

      const newBooking = await this._bookingRepo.create({
        userId,
        workerId,
        serviceId: workerData.category,
        date: bookingDate,
        startTime: time,
        description,
        status: 'pending',
        advancePaymentStatus: 'unpaid',
      });

      if (!newBooking) {
        return {
          success: false,
          message: 'Failed to create booking',
          bookingId: null,
        };
      }

      return {
        success: true,
        message: 'Slot locked for 10 minutes',
        bookingId: newBooking._id.toString(),
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: 'internal Error',
        bookingId: null,
      };
    }
  }

  async getBookingDetails(
    bookingId: string,
  ): Promise<getBookingDetailsResponseDTO> {
    try {
      if (!bookingId) {
        return {
          success: false,
          message: 'booking details not found',
          details: null,
        };
      }

      const booking = await this._bookingRepo.findByIdWithDetails(bookingId);
      if (!booking) {
        return {
          success: false,
          message: 'booking details not found',
          details: null,
        };
      }
      const worker = booking.workerId as unknown as { name?: string };
      const service = booking.serviceId as unknown as { category?: string };

      let time = `${Number(booking.startTime.split(':')[0]) % 12}:${booking.startTime.split(':')[1]} `;
      Number(booking.startTime.split(':')[0]) % 12
      == Number(booking.startTime.split(':')[0])
        ? (time += ' AM')
        : (time += ' PM');
      const data = {
        workerName: worker.name as string,
        serviceName: service.category as string,
        date: booking.date.toISOString().split('T')[0],
        time,
        description: booking.description as string,
        advancePaymentStatus: booking.advancePaymentStatus,

        advance: booking.advanceAmount,
      };
      return {
        success: true,
        message: 'booking details  found',
        details: data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'internal error',
        details: null,
      };
    }
  }

  async updateWorkerDetails(data: {
    bookingId: string;
    workerId: string;
    endingTime: string;
    itemsRequired: Array<{ name: string; price: number; description?: string }>;
    additionalNotes?: string;
  }): Promise<updateWorkerDetailsResponseDto> {
    try {
      const {
        bookingId,
        workerId,
        endingTime,
        itemsRequired,
        additionalNotes,
      } = data;

      if (!bookingId || !workerId) {
        return {
          success: false,
          message: 'Missing bookingId or workerId',
        };
      }

      // 🧠 Validate input
      if (!endingTime || !itemsRequired?.length) {
        return {
          success: false,
          message: 'Ending time and required items are mandatory',
        };
      }

      // 💾 Update the booking
      const updatedBooking = await this._bookingRepo.updateById(bookingId, {
        workerId,
        endTime: endingTime,
        additionalItems: itemsRequired,
        description: additionalNotes,
      });

      if (!updatedBooking) {
        return {
          success: false,
          message: 'Booking not found or unauthorized',
        };
      }

      // 📨 Optional: Send confirmation email to the user
      const user = updatedBooking.userId as { email?: string; name?: string };
      const worker = updatedBooking.workerId as { name?: string };
      // if (user?.email) {
      //     await this.sendBookingEmail({
      //     to: user.email,
      //     service: updatedBooking.serviceId,
      //     workerName: worker?.name || "Assigned Worker",
      //     });
      // }

      return {
        success: true,
        message: 'Worker details updated successfully',
        booking: updatedBooking,
      };
    } catch (error) {
      console.error('❌ Error updating worker details:', error);
      return {
        success: false,
        message: 'Internal server error while updating details',
      };
    }
  }

  async verifyPayment(
    bookingId: string,
    paymentType: 'advance' | 'final',
  ): Promise<verifyPaymentResponseDto> {
    try {
      if (!bookingId || !paymentType) {
        return {
          success: false,
          message: 'Missing bookingId or paymentType',
          data: null,
        };
      }

      const booking = await this._bookingRepo.findById(bookingId);
      if (!booking) {
        return { success: false, message: 'Booking not found', data: null };
      }

      // -------------------------
      // ADVANCE PAYMENT CHECK
      // -------------------------
      if (paymentType === 'advance') {
        if (booking.advancePaymentStatus !== 'paid') {
          return {
            success: false,
            message: 'Advance payment not completed',
            data: null,
          };
        }

        return {
          success: true,
          message: 'Advance payment verified',
          data: {
            bookingId,
            amountPaid: booking.advanceAmount,
            type: 'advance',
          },
        };
      }

      // -------------------------
      // FINAL PAYMENT CHECK
      // -------------------------
      if (paymentType === 'final') {
        if (booking.finalPaymentStatus !== 'paid') {
          return {
            success: false,
            message: 'Final payment not completed',
            data: null,
          };
        }

        return {
          success: true,
          message: 'Final payment verified',
          data: {
            bookingId,
            amountPaid: booking.totalAmount as number,
            type: 'final',
          },
        };
      }

      return { success: false, message: 'Invalid payment type', data: null };
    } catch (err) {
      console.error('Error verifying payment:', err);
      return {
        success: false,
        message: 'Internal server error',
        data: null,
      };
    }
  }
}
