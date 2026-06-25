import { Role } from '../../config/constants/role';
import { inject, injectable } from 'tsyringe';
import {
  IRequestFilters,
  IWorkerBookingService,
  serviceData,
} from '../../interface/service/worker/worker-booking.service.interface';
import {
  allBookingDto,
  getServiceRequestsResponseDto,
  getWorkerApprovedBookingsResponseDto,
  getWorkerAprrovalpageDetailsResponseDto,
  reachedCustomerLocationResponseDto,
  workerComplateWorkResponseDto,
  ApprovedServices,
  IWorkerRequestResponse,
} from '../../dto/worker/working-details.dto';
import { responsePart } from '../../dto/shared/responsePart';
import { TYPES } from '../../config/constants/types';
import { IBookingRepository } from '../../interface/repository/booking.repository.interface';
import {
  addDurationToTime,
  doTimesOverlap,
  isTimeGreater,
} from '../../utils/time&Intervals';
import { IWalletService } from '../../interface/service/wallet.service.interface';
import { IUserRepository } from '../../interface/repository/user.repository.interface';
import { IEmailService } from '../../interface/helpers/email-service.service.interface';
import {
  IBooking,
  IBookingPopulated,
} from '../../interface/model/booking.model.interface';
import { WorkerMapper } from '../../utils/mapper/worker-mapper';
import { IWorkerHelperService } from '../../interface/service/helper-service.service.interface';
import { MESSAGES } from '../../config/constants/message';
import { IHashService } from '../../interface/helpers/hash.interface';
import { STATUS_CODES } from '../../config/constants/status-code';
import { WorkerBookingListRequest } from '../../controller/validation/allBookingList.zod';
import { INotificationService } from '../../interface/service/notification.service.interface';

@injectable()
export class WorkerBookingService implements IWorkerBookingService {
  constructor(
    @inject(TYPES.BookingRepository) private bookingRepo: IBookingRepository,
    @inject(TYPES.WalletService) private walletService: IWalletService,
    @inject(TYPES.AuthUserRepository) private userRepo: IUserRepository,
    @inject(TYPES.EmailService) private emailService: IEmailService,
    @inject(TYPES.WorkerHelperService)
    private workerHelper: IWorkerHelperService,
    @inject(TYPES.PasswordService) private _hash: IHashService,
    @inject(TYPES.NotificationService)
    private notification: INotificationService,
  ) {}

  async approveService(data: serviceData): Promise<responsePart> {
    try {
      const {
        bookingId,
        durationHours,
        distance,
        additionalItems,
        additionalNotes,
      } = data;
      console.log(data);

      const booking = await this.bookingRepo.findByIdPopulated(bookingId);

      if (!booking) {
        return { success: false, message: MESSAGES.BOOKING_NOT_FOUND };
      }

      if (!booking.startTime) {
        return {
          success: false,
          message:
            'Start time missing. User has not selected service time yet.',
        };
      }

      const endTime = addDurationToTime(booking.startTime, durationHours);
      if (!isTimeGreater(endTime, booking.startTime)) {
        return {
          success: false,
          message: MESSAGES.END_TIME_MUST_BE_GREATER_THAN_START_TIME,
        };
      }
      const workerBooking = await this.bookingRepo.findByWorkerAndDate(
        booking.workerId._id.toString(),
        booking.date,
      );
      console.log(booking);
      console.log(workerBooking);
      const conflict = workerBooking.some((b) => {
        if (b.endTime) {
          return doTimesOverlap(
            b.startTime,
            b.endTime,
            booking.startTime,
            endTime,
          );
        }
      });
      console.log(conflict);
      if (conflict) {
        return {
          success: false,
          message: MESSAGES.TIME_CONFLICT_WITH_ANOTHER_APPROVED_BOOK,
        };
      }
      if (additionalItems?.length) {
        for (const item of additionalItems) {
          if (!item.name || typeof item.price !== 'number') {
            return { success: false, message: MESSAGES.INVALID_ADDITIONAL_ITEM };
          }
        }
      }
      const perKmRate = 10;
      const platformFee = 20;
      const paymentBreakdown = [];

      paymentBreakdown.push({
        title: 'Service Duration Charge',
        rate: booking.workerId.fees,
        rateLabel: `₹${booking.workerId.fees} per hour`,
        quantity: durationHours,
        total: durationHours * booking.workerId.fees,
      });
      paymentBreakdown.push({
        title: 'Travel Cost',
        rate: perKmRate,
        rateLabel: `₹${perKmRate} per km`,
        quantity: distance,
        total: distance * perKmRate,
      });
      let additionalTotal = 0;
      if (additionalItems?.length) {
        additionalItems.forEach((item) => {
          additionalTotal += item.price;
          paymentBreakdown.push({
            title: item.name,
            rate: item.price,
            rateLabel: `₹${item.price} per item`,
            quantity: 1,
            total: item.price,
          });
        });
      }
      paymentBreakdown.push({
        title: 'Platform Fee',
        rate: platformFee,
        rateLabel: 'Fixed Fee',
        quantity: 1,
        total: platformFee,
      });
      const totalAmount = paymentBreakdown.reduce(
        (sum, item) => sum + item.total,
        0,
      );

      const remainingAmount = totalAmount - booking.advanceAmount;

      const description = `${booking.description ?? ''}\nWorker Response: ${additionalNotes ?? ''}`;

      await this.bookingRepo.updateById(bookingId, {
        endTime,
        additionalItems: additionalItems || [],
        description,
        workerResponse: 'accepted',
        paymentBreakdown,
        totalAmount,
        remainingAmount,
      });
      await this.notification.createNotification({
        title: 'booking Approve',
        message: MESSAGES.WORKER_APPROVED_YOUR_BOOKING,
        type: 'booking',
        userId: booking.userId._id.toString(),
        bookingId:bookingId
      });

      return { success: true, message: MESSAGES.SERVICE_APPROVED_SUCCESSFULLY };
    } catch (error) {
      console.error(error);
      return { success: false, message: MESSAGES.INTERNAL_SERVER_ERROR };
    }
  }

  async rejectService(
    bookingId: string,
    description: string,
  ): Promise<responsePart> {
    try {
      const booking = await this.bookingRepo.findById(bookingId);

      if (!booking) {
        throw new Error(MESSAGES.BOOKING_NOT_FOUND);
      }

      if (booking.workerResponse === 'rejected') {
        throw new Error(MESSAGES.ALREADY_REJECTED);
      }

      let refundAmount = 0;
      const updateBooking: Partial<IBooking> = {
        status: 'cancelled',
        workerResponse: 'rejected',
        description,
      };
      if (
        booking.advanceAmount > 0
        && booking.advancePaymentStatus === 'paid'
      ) {
        refundAmount = booking.advanceAmount;

        const wallet = await this.walletService.addBalance({
          userId: booking.userId as string,
          amount: refundAmount,
          role: Role.USER,
          description: `Refund for rejected service (${booking.serviceId})`,
        });
        if (!wallet) return { success: false, message: MESSAGES.USER_WALLET_ERROR };

        updateBooking.advancePaymentStatus = 'refunded';
      }

      const updatedBooking = await this.bookingRepo.updateById(
        bookingId,
        updateBooking,
      );

      if (!updatedBooking) {
        return { success: false, message: MESSAGES.USER_BOOKING_UPDATION_FAILED };
      }

      const user = await this.userRepo.findById(booking.userId as string);

      if (user && user.email) {
        await this.emailService.sendServiceRejectedEmail({
          email: user.email,
          userName: user.name,
          serviceName: booking.serviceId.toString(),
          reason: description,
          refundAmount,
        });
      }
      await this.notification.createNotification({
        title: 'booking rejected',
        message: MESSAGES.WORKER_REJECTED_YOUR_BOOKING,
        type: 'booking',
        userId: booking.userId.toString(),
        bookingId,
      });

      return {
        success: true,
        message: MESSAGES.SERVICE_REJECTED_SUCCESSFULLY,
      };
    } catch (error) {
      return {
        success: false,
        message: MESSAGES.SOMETHING_WENT_WRONG,
      };
    }
  }

  async getServiceRequests(
    filter: IRequestFilters,
  ): Promise<getServiceRequestsResponseDto> {
    try {
      console.log(filter);
      const { data: bookings, total } = await this.bookingRepo.findServiceRequests(filter);
      console.log(bookings);

      const mapped = WorkerMapper.mapServiceRequest(bookings);
      const finalMapped = await Promise.all(
        mapped.map(async (req, index) => {
          const b = bookings[index];

          const nextAvailable = await this.workerHelper.getWorkerAvailableTime(
            b.workerId._id.toString(),
            b.date,
            b.startTime,
          );

          return {
            ...req,
            availableTime: nextAvailable.availableTime ?? '0.00',
          };
        }),
      );
      console.log(finalMapped);
      return {
        success: true,
        message: MESSAGES.REQUESTS_FETCHED_SUCCESSFULLY,
        data: {
          data: finalMapped,
          page: filter.page,
          total,
        },
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: MESSAGES.INTERNAL_ERROR,
      };
    }
  }

  async getWorkerApprovedBookings(query: {
    workerId: string;
    page: number;
    limit: number;
    search?: string;
    status?: 'approved' | 'in-progress' | 'awaiting-final-payment';
  }): Promise<getWorkerApprovedBookingsResponseDto> {
    try {
      const {
        workerId, page = 1, limit = 10, search = '', status,
      } = query;
      console.log(query);
      if (!workerId) {
        return {
          success: false,
          message: MESSAGES.WORKER_DATA_NOT_FONT,
        };
      }
      status === 'approved' ? 'confirmed' : status;
      const { items, total } = await this.bookingRepo.findWorkerApprovedBookings({
        workerId,
        limit,
        page,
        search,
        status,
      });
      console.log({ items, total });
      if (!items) {
        return {
          success: false,
          message: MESSAGES.DATA_NOT_FOUNT,
        };
      }

      const normalizeDate = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

      const today = normalizeDate(new Date());

      const todayBookings = [];
      const upcomingBookings = [];

      for (const b of items) {
        const bookingDate = normalizeDate(new Date(b.date));
        const mapped = WorkerMapper.ApprovedService(b);

        if (bookingDate.getTime() === today.getTime()) {
          todayBookings.push(mapped);
        } else if (bookingDate.getTime() > today.getTime()) {
          upcomingBookings.push(mapped);
        }
      }

      return {
        success: true,
        message: MESSAGES.DATA_FETCH_SUCCESSFULLY,
        today: todayBookings,
        upcoming: upcomingBookings,
        pagination: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages: Math.ceil(total / query.limit),
        },
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: MESSAGES.BAD_REQUEST,
      };
    }
  }

  async getWorkerAprrovalpageDetails(
    bookingId: string,
  ): Promise<getWorkerAprrovalpageDetailsResponseDto> {
    try {
      if (!bookingId) {
        return {
          success: false,
          message: MESSAGES.BOOKING_DATA_MISSING,
        };
      }
      const booking = await this.bookingRepo.findByIdPopulated(bookingId);
      if (!booking) {
        return {
          success: false,
          message: MESSAGES.BOOKING_DATA_NOT_FOUNT,
        };
      }
      const verification = Boolean(booking.otp);
      return {
        success: true,
        message: MESSAGES.DATA_FETCH_SUCCESS,
        booking: { ...booking.toObject(), verification },
      };
    } catch (error) {
      return {
        success: false,
        message: MESSAGES.INTERNAL_EROR,
      };
    }
  }

  async reachedCustomerLocation(
    bookingid: string,
  ): Promise<reachedCustomerLocationResponseDto> {
    try {
      if (!bookingid) {
        return {
          success: false,
          message: MESSAGES.BOOKING_DEATAILS_IS_NOT_FOUNT,
        };
      }
      const otp = Math.floor(1000 + Math.random() * 9000).toString();

      const updateBooking = this.bookingRepo.updateById(bookingid, { otp });
      if (!updateBooking) {
        return {
          success: false,
          message: MESSAGES.BOOKING_DETAILS_IS_NOT_FOUNT,
        };
      }
      const booking = await this.getWorkerAprrovalpageDetails(bookingid);
      if (!booking.success && !booking.booking) {
        return {
          success: false,
          message: MESSAGES.BOOKING_DETAILS_IS_NOT_FOUNT,
        };
      }
      await this.notification.createNotification({
        title: 'worker reached',
        message: MESSAGES.WORKER_REACHED_TO_YOUR_LOCATION,
        type: 'booking',
        userId: booking.booking?.userId._id.toString(),
        bookingId:bookingid,
      });

      return {
        success: true,
        message: MESSAGES.SUCCESSFULLY_GENERATED_OTP,
        booking: booking.booking,
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: MESSAGES.INTERNAL_ERROR,
      };
    }
  }

  async verifyWorker(bookingId: string, otp: string): Promise<responsePart> {
    try {
      if (!bookingId) {
        return {
          success: false,
          message: MESSAGES.BOOKING_DETAIL_MISSING,
        };
      }
      if (!otp) {
        return {
          success: true,
          message: MESSAGES.VALIDATION_NOT_FOUNT,
        };
      }
      const booking = await this.bookingRepo.findById(bookingId);
      console.log(booking);
      if (!booking) {
        return {
          success: false,
          message: MESSAGES.BOOKING_DETAIL_MISSING,
        };
      }
      if (booking.otp != otp) {
        return {
          success: false,
          message: MESSAGES.WORKER_VARIFICATION_FAILED,
        };
      }
      const updatebooking = await this.bookingRepo.updateStatusWithOTP(
        bookingId,
        'in-progress',
      );
      if (!updatebooking) {
        return {
          success: false,
          message: MESSAGES.WORKER_VARIFICATION_FAILED,
        };
      }

      await this.notification.createNotification({
        title: 'worker verified',
        message: MESSAGES.WORKER_SUCCESSFULLY_VERIFIED,
        type: 'booking',
        userId: booking.userId.toString(),
        bookingId,
      });

      return {
        success: true,
        message: MESSAGES.WORKER_SUCCESSFULLY_VERIFIED,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: MESSAGES.INTERNAL_ERROR,
      };
    }
  }

  async workerComplateWork(
    bookingId: string,
  ): Promise<workerComplateWorkResponseDto> {
    try {
      if (!bookingId) {
        return {
          status: STATUS_CODES.BAD_REQUEST,
          success: false,
          message: MESSAGES.BOOKING_ID_IS_NOT_FOUNT,
        };
      }
      const updateBooking = await this.bookingRepo.updateStatus(
        bookingId,
        'awaiting-final-payment',
      );
      if (!updateBooking) {
        return {
          status: STATUS_CODES.BAD_REQUEST,
          success: false,
          message: MESSAGES.BOOKING_UPDATETION_FAILED,
        };
      }
      const booking = await this.bookingRepo.findByIdPopulated(bookingId);
      if (!booking) {
        return {
          status: STATUS_CODES.BAD_REQUEST,
          success: false,
          message: MESSAGES.BOOKING_IS_NOT_FOUNT,
        };
      }
      await this.notification.createNotification({
        title: ' work complated',
        message: MESSAGES.WORK_IS_COMPLATE,
        type: 'booking',
        userId: booking.userId._id.toString(),
        bookingId,
      });

      return {
        status: STATUS_CODES.OK,
        success: true,
        message: MESSAGES.SUCCESSFULLY_UPDATED,
        booking: { ...booking.toObject(), verification: false },
      };
    } catch (error) {
      return {
        status: STATUS_CODES.NOT_FOUND,
        success: false,
        message: MESSAGES.BOOKING_IS_NOT_FOUNT,
      };
    }
  }

  async getWorkerBookings(
    workerId: string,
    query: WorkerBookingListRequest,
  ): Promise<{
    success: boolean;
    message: string;
    data?: {
      bookings: allBookingDto[];
      total: number;
      page: number;
      limit: number;
    };
  }> {
    const {
      page, limit, search, workerResponses, statuses, from, to,
    } = query;

    const { items, total } = await this.bookingRepo.allBookingList({
      workerId,
      page,
      limit,
      search,
      statuses: Array.isArray(statuses)
        ? statuses
        : statuses
          ? [statuses]
          : undefined,
      workerResponses,
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    });

    return {
      success: true,
      message: MESSAGES.SUCCESSFULLY_FETCH_DATA,
      data: {
        bookings: items.map(WorkerMapper.toAllWorkerBookingDto),
        total,
        page,
        limit,
      },
    };
  }
}
