import { AdminDataDTO } from '../../dto/admin/admin.dto';
import {
  AdminBookingDetailsDto,
  serviceManageDto,
  userManageDto,
  workerManageDto,
} from '../../dto/admin/management.dto';
import { IAdmin } from '../../interface/model/admin.model.interface';
import { IBookingPopulated } from '../../interface/model/booking.model.interface';
import { IService } from '../../interface/model/service.model.interface';
import { IUser } from '../../interface/model/user.model.interface';
import { IWorker } from '../../interface/model/worker.model.interface';

export class AdminMapper {
  static resAdminData(admin: IAdmin): AdminDataDTO {
    return {
      _id: admin._id.toString(),
      name: admin.name,
      email: admin.email,
    };
  }

  static resUserDetails(users: IUser[]): userManageDto[] {
    return users.map((user) => ({
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      image: user.image,
      isBlocked: user.isBlocked,
      createdAt: user.createdAt,
    }));
  }

  static resWorkersDetails(workers: IWorker[]): workerManageDto[] {
    return workers.map((w) => ({
      _id: w._id.toString(),
      name: w.name,
      email: w.email,
      phone: w.phone,
      isBlocked: w.isBlocked,
      isVerified: w.isVerified,
      category: w.category.toString(),
      experience: w.experience,
      profileImage: w?.profileImage || undefined,
      createdAt: w.createdAt,
    }));
  }

  static resServiceDetails(services: IService[]): serviceManageDto[] {
    return services.map((w) => ({
      _id: String(w._id),
      category: w.category,
      description: w.description,
      price: w.price,
      priceUnit: w.priceUnit,
      duration: w.duration,
      image: w.image,

      status: w.status,
      createdAt: w.createdAt,
    }));
  }

  static resBookingDetails(booking: IBookingPopulated): AdminBookingDetailsDto {
    return {
      id: booking._id.toString(),
      status: booking.status,
      bookingDate: booking.date,
      timeSlot: `${booking.startTime} - ${booking.endTime ?? ''}`,

      customer: {
        name: booking.userId.name,
        phone: booking.userId.phone,
        avatar: booking.userId.image,
      },

      worker: {
        name: booking.workerId.name,
        phone: booking.workerId.phone,
        email: booking.workerId.email,
        avatar: booking.workerId.profileImage,
        response: booking.workerResponse,
      },

      service: {
        name: booking.serviceId.category,
        category: booking.serviceId.category,
        duration: booking.serviceId.duration,
      },

      address: {
        street: booking.address.street,
        city: booking.address.city,
        state: booking.address.state,
        pinCode: booking.address.pinCode,
        phone: booking.address.phone,
        lat: booking.address.location.coordinates[1],
        lng: booking.address.location.coordinates[0],
      },

      description: booking.description,

      additionalItems: booking.additionalItems ?? [],

      payment: {
        advanceAmount: booking.advanceAmount,
        remainingAmount: booking.remainingAmount ?? 0,
        totalAmount: booking.totalAmount ?? 0,
        advancePaid: booking.advancePaymentStatus === 'paid',
        finalPaid: booking.finalPaymentStatus === 'paid',
        paymentMethod: booking.paymentMethod,
        breakdown: booking.paymentBreakdown,
      },

      rating: booking.reviewId
        ? {
          stars: booking.reviewId.rating ?? 0,
          review: booking.reviewId.comment,
        }
        : undefined,

      timeline: [
        { status: 'confirmed', completed: booking.status !== 'pending' },
        {
          status: 'in-progress',
          completed:
            booking.status === 'in-progress' || booking.status === 'completed',
        },
        { status: 'completed', completed: booking.status === 'completed' },
      ],
    };
  }
}
