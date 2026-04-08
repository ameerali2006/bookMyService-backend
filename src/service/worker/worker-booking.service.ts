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
        return { success: false, message: 'Booking not found' };
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
          message: 'End time must be greater than start time',
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
          message: 'Time conflict with another approved booking',
        };
      }
      if (additionalItems?.length) {
        for (const item of additionalItems) {
          if (!item.name || typeof item.price !== 'number') {
            return { success: false, message: 'Invalid additional item' };
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
        message: 'worker  Approved your booking',
        type: 'booking',
        userId: booking.userId._id.toString(),
      });

      return { success: true, message: 'Service approved successfully' };
    } catch (error) {
      console.error(error);
      return { success: false, message: 'Internal server error' };
    }
  }

  async rejectService(
    bookingId: string,
    description: string,
  ): Promise<responsePart> {
    try {
      const booking = await this.bookingRepo.findById(bookingId);

      if (!booking) {
        throw new Error('Booking not found');
      }

      if (booking.workerResponse === 'rejected') {
        throw new Error('Already rejected');
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
          role: 'user',
          description: `Refund for rejected service (${booking.serviceId})`,
        });
        if (!wallet) return { success: false, message: 'user wallet error' };

        updateBooking.advancePaymentStatus = 'refunded';
      }

      const updatedBooking = await this.bookingRepo.updateById(
        bookingId,
        updateBooking,
      );

      if (!updatedBooking) {
        return { success: false, message: 'user booking updation failed' };
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
        message: 'worker  rejected your booking',
        type: 'booking',
        userId: booking.userId.toString(),
      });

      return {
        success: true,
        message: 'Service rejected successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: 'something went wrong',
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
        message: 'Requests fetched successfully',
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
        message: 'internal error',
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
          message: 'worker data not font',
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
          message: 'data not fount',
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
        message: 'data fetch successfully',
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
          message: 'booking data missing',
        };
      }
      const booking = await this.bookingRepo.findByIdPopulated(bookingId);
      if (!booking) {
        return {
          success: false,
          message: 'booking data not fount',
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
        message: 'Internal Eror',
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
          message: 'booking deatails is not fount ',
        };
      }
      const otp = Math.floor(1000 + Math.random() * 9000).toString();

      const updateBooking = this.bookingRepo.updateById(bookingid, { otp });
      if (!updateBooking) {
        return {
          success: false,
          message: 'booking details is not fount ',
        };
      }
      const booking = await this.getWorkerAprrovalpageDetails(bookingid);
      if (!booking.success && !booking.booking) {
        return {
          success: false,
          message: 'booking details is not fount ',
        };
      }
      await this.notification.createNotification({
        title: 'worker reached',
        message: 'worker reached to your location',
        type: 'booking',
        userId: booking.booking?.userId._id.toString(),
      });

      return {
        success: true,
        message: 'successfully generated otp',
        booking: booking.booking,
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: 'Internal error',
      };
    }
  }

  async verifyWorker(bookingId: string, otp: string): Promise<responsePart> {
    try {
      if (!bookingId) {
        return {
          success: false,
          message: 'booking detail missing',
        };
      }
      if (!otp) {
        return {
          success: true,
          message: 'validation  not fount ',
        };
      }
      const booking = await this.bookingRepo.findById(bookingId);
      console.log(booking);
      if (!booking) {
        return {
          success: false,
          message: 'booking detail missing',
        };
      }
      if (booking.otp != otp) {
        return {
          success: false,
          message: 'worker varification failed',
        };
      }
      const updatebooking = await this.bookingRepo.updateStatusWithOTP(
        bookingId,
        'in-progress',
      );
      if (!updatebooking) {
        return {
          success: false,
          message: 'worker varification failed',
        };
      }

      await this.notification.createNotification({
        title: 'worker verified',
        message: 'worker successfully verified',
        type: 'booking',
        userId: booking.userId.toString(),
      });

      return {
        success: true,
        message: 'worker successfully verified',
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: 'internal error',
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
          message: 'booking Id is not fount',
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
          message: 'booking updatetion failed',
        };
      }
      const booking = await this.bookingRepo.findByIdPopulated(bookingId);
      if (!booking) {
        return {
          status: STATUS_CODES.BAD_REQUEST,
          success: false,
          message: 'booking is not fount',
        };
      }
      await this.notification.createNotification({
        title: ' work complated',
        message: ' work is complate',
        type: 'booking',
        userId: booking.userId._id.toString(),
      });

      return {
        status: STATUS_CODES.OK,
        success: true,
        message: 'successfully updated',
        booking: { ...booking.toObject(), verification: false },
      };
    } catch (error) {
      return {
        status: STATUS_CODES.NOT_FOUND,
        success: false,
        message: 'booking is not fount',
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
      message: 'successfully fetch data',
      data: {
        bookings: items.map(WorkerMapper.toAllWorkerBookingDto),
        total,
        page,
        limit,
      },
    };
  }
}
