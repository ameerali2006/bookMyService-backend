import { inject, injectable } from "tsyringe";
import {
  BookingDetails,
  IBookingService,
  VerifiedPaymentResult,
} from "../../interface/service/services/booking-service.sevice.interface";
import {
  setBasicBookingDetailsResponse,
  getBookingDetailsResponseDTO,
  updateWorkerDetailsResponseDto,
  verifyPaymentResponseDto,
} from "../../dto/service.dto";
import { TYPES } from "../../config/constants/types";
import { IBookingRepository } from "../../interface/repository/booking.repository.interface";
import { IWorkerRepository } from "../../interface/repository/worker.repository.interface";
import { IBooking } from "../../interface/model/booking.model.interface";
import { ISlotLockRepository } from "../../interface/repository/slot-lock.repository.interface";
import { MESSAGES } from "../../config/constants/message";
import { IEmailService } from "../../interface/helpers/email-service.service.interface";
import { INotificationService } from "../../interface/service/notification.service.interface";

@injectable()
export class BookingService implements IBookingService {
  constructor(
    @inject(TYPES.BookingRepository) private _bookingRepo: IBookingRepository,
    @inject(TYPES.WorkerRepository) private _workerRepo: IWorkerRepository,
    @inject(TYPES.SlotLockRepository)
    private _slotLockRepo: ISlotLockRepository,
    @inject(TYPES.EmailService) private _emailService: IEmailService,
    @inject(TYPES.NotificationService)
    private notification: INotificationService,
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
          message: MESSAGES.USER_NOT_FOUND,
          bookingId: null,
        };
      }
      if (!time || !date || !description) {
        return {
          success: false,
          message: MESSAGES.MISSING_REQUIRED_FIELDS_TIME_DATE_OR_DES,
          bookingId: null,
        };
      }

      if (isNaN(new Date(date).getTime())) {
        return {
          success: false,
          message: MESSAGES.INVALID_DATE_FORMAT,
          bookingId: null,
        };
      }
      const workerData = await this._workerRepo.findById(workerId);

      if (!workerData) {
        return {
          success: false,
          message: MESSAGES.WORKER_IS_NOT_FOUND,
          bookingId: null,
        };
      }
      const bookingDate = new Date(date);

      const [h, m] = time.split(":").map(Number);
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
          message: MESSAGES.SLOT_ALREADY_BOOKED_BY_ANOTHER_USER,
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
        status: "pending",
        advancePaymentStatus: "unpaid",
      });

      if (!newBooking) {
        return {
          success: false,
          message: MESSAGES.FAILED_TO_CREATE_BOOKING,
          bookingId: null,
        };
      }

      return {
        success: true,
        message: MESSAGES.SLOT_LOCKED_FOR_10_MINUTES,
        bookingId: newBooking._id.toString(),
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: MESSAGES.INTERNAL_ERROR,
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
          message: MESSAGES.BOOKING_DETAILS_NOT_FOUND,
          details: null,
        };
      }

      const booking = await this._bookingRepo.findByIdWithDetails(bookingId);
      if (!booking) {
        return {
          success: false,
          message: MESSAGES.BOOKING_DETAILS_NOT_FOUND,
          details: null,
        };
      }
      const worker = booking.workerId as unknown as { name?: string };
      const service = booking.serviceId as unknown as { category?: string };

      let time = `${Number(booking.startTime.split(":")[0]) % 12}:${booking.startTime.split(":")[1]} `;
      Number(booking.startTime.split(":")[0]) % 12 ==
      Number(booking.startTime.split(":")[0])
        ? (time += " AM")
        : (time += " PM");
      const data = {
        workerName: worker.name as string,
        serviceName: service.category as string,
        date: booking.date.toISOString().split("T")[0],
        time,
        description: booking.description as string,
        advancePaymentStatus: booking.advancePaymentStatus,

        advance: booking.advanceAmount,
      };
      return {
        success: true,
        message: MESSAGES.BOOKING_DETAILS_FOUND,
        details: data,
      };
    } catch (error) {
      return {
        success: false,
        message: MESSAGES.INTERNAL_ERROR,
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
          message: MESSAGES.MISSING_BOOKINGID_OR_WORKERID,
        };
      }

      // 🧠 Validate input
      if (!endingTime || !itemsRequired?.length) {
        return {
          success: false,
          message: MESSAGES.ENDING_TIME_AND_REQUIRED_ITEMS_ARE_MANDA,
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
          message: MESSAGES.BOOKING_NOT_FOUND_OR_UNAUTHORIZED,
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
        message: MESSAGES.WORKER_DETAILS_UPDATED_SUCCESSFULLY,
        booking: updatedBooking,
      };
    } catch (error) {
      console.error("❌ Error updating worker details:", error);
      return {
        success: false,
        message: MESSAGES.INTERNAL_SERVER_ERROR_WHILE_UPDATING_DET,
      };
    }
  }

  async verifyPayment(
    bookingId: string,
    paymentType: "advance" | "final",
  ): Promise<verifyPaymentResponseDto> {
    try {
      if (!bookingId || !paymentType) {
        return {
          success: false,
          message: MESSAGES.MISSING_BOOKINGID_OR_PAYMENTTYPE,
          data: null,
        };
      }

      const booking = await this._bookingRepo.findById(bookingId);
      if (!booking) {
        return { success: false, message: MESSAGES.BOOKING_NOT_FOUND, data: null };
      }

      // -------------------------
      // ADVANCE PAYMENT CHECK
      // -------------------------
      if (paymentType === "advance") {
        if (booking.advancePaymentStatus !== "paid") {
          return {
            success: false,
            message: MESSAGES.ADVANCE_PAYMENT_NOT_COMPLETED,
            data: null,
          };
        }

        return {
          success: true,
          message: MESSAGES.ADVANCE_PAYMENT_VERIFIED,
          data: {
            bookingId,
            amountPaid: booking.advanceAmount,
            type: "advance",
          },
        };
      }

      // -------------------------
      // FINAL PAYMENT CHECK
      // -------------------------
      if (paymentType === "final") {
        if (booking.finalPaymentStatus !== "paid") {
          return {
            success: false,
            message: MESSAGES.FINAL_PAYMENT_NOT_COMPLETED,
            data: null,
          };
        }

        return {
          success: true,
          message: MESSAGES.FINAL_PAYMENT_VERIFIED,
          data: {
            bookingId,
            amountPaid: booking.totalAmount as number,
            type: "final",
          },
        };
      }

      return { success: false, message: MESSAGES.INVALID_PAYMENT_TYPE, data: null };
    } catch (err) {
      console.error("Error verifying payment:", err);
      return {
        success: false,
        message: MESSAGES.INTERNAL_SERVER_ERROR,
        data: null,
      };
    }
  }
  async cancelBooking(
    bookingId: string,
    userId: string,
    reason: string,
  ): Promise<{ success: boolean; message: string; booking?: IBooking }> {
    const booking = await this._bookingRepo.findByIdPopulated(bookingId);
    if (!booking) {
      return {
        success: false,
        message: MESSAGES.BOOKING_NOT_FOUND,
      };
    }
    if(booking.workerResponse=="rejected"){
       return {
        success: false,
        message: MESSAGES.WORKER_ALREADY_REJECTED_THIS_BOOKING,
      };
    }
    if (!["pending", "confirmed"].includes(booking.status)) {
      return {
        success: false,
        message: MESSAGES.ONLY_STATUS_WITH_PENDING_AND_CONIFIRMED_,
      };
    }
    const updateBooking = await this._bookingRepo.updateStatus(
      bookingId,
      "cancelled",
    );
    if (!updateBooking) {
      return {
        success: false,
        message: MESSAGES.BOOKING_NOT_FOUND,
      };
    }
    await this.notification.createNotification({
        title: 'booking canceled',
        message: MESSAGES.USER_CANCEL_THE_BOOKING,
        type: 'booking',
        workerId: booking.workerId._id.toString(),
        bookingId,
      });


    await this._emailService.sendBookingCancelledEmail({
      email: booking.userId.email,
      userName: booking.userId.name,
      serviceName: booking.serviceId.category,
      bookingCode: booking._id.toString(),
      reason,
    });
    return {
      success: true,
      message: MESSAGES.BOOKING_CANCELLED,
      booking: updateBooking,
    };
  }
}
