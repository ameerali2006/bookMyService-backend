import { Address, ProfileDetails } from '../../dto/user/auth/profile.dto';
import { UserRegisterDTO, userResponse } from '../../dto/user/auth/user-register.dto';
import { BookingDetailDto, ongoingBookingDto } from '../../dto/user/booking-details.dto';
import { IAddress } from '../../interface/model/address.model.interface';
import { IBookingPopulated } from '../../interface/model/booking.model.interface';
import { IUser } from '../../interface/model/user.model.interface';

export class UserMapper {
  static toRegistrationModel(userDto: UserRegisterDTO): Partial<IUser> {
    return {
      googleId: userDto.googleId,
      name: userDto.name,
      email: userDto.email,
      password: userDto.password,
    };
  }

  static resposeWorkerDto(user:IUser):userResponse {
    return {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      image: user?.image,
    };
  }

  static responseuserProfileDetails(user:IUser):ProfileDetails {
    return {

      name: user.name,
      email: user.email,
      phone: user.phone,
      image: user?.image,
    };
  }

  static toDTOAddress(address: IAddress): Address {
    return {
      _id: address._id?.toString() as string,
      label: address.label,
      street: address.street,
      buildingName: address.buildingName,
      area: address.area,
      city: address.city,
      state: address.state,
      country: address.country,
      pinCode: address.pinCode,
      landmark: address.landmark,
      phone: address.phone,
      isPrimary: address.isPrimary,
    };
  }

  static formatAddress(address?: IAddress): string {
    if (!address) return '';

    const parts = [
      address.buildingName,
      address.street,
      address.area,
      address.landmark,
      address.city,
      address.state,
      address.country,
      address.pinCode,
    ];

    return parts.filter(Boolean).join(', ');
  }

  static toDTOAddressList(addresses: IAddress[]): Address[] {
    return addresses.map((addr) => this.toDTOAddress(addr));
  }

  static ongoingBooking(data: IBookingPopulated[]): ongoingBookingDto[] {
    return data.map((b) => ({
      id: b._id.toString(),
      serviceName: b.serviceId.category,
      workerName: b.workerId?.name,
      date: b.date.toISOString(),
      time: b.startTime,
      status: b.workerResponse,

      image: b.serviceId.image,
    }));
  }

  static bookingDetail(b:IBookingPopulated):BookingDetailDto {
    return {
      id: b._id.toString(),
      serviceName: b.serviceId.category,
      description: b.description || '',

      date: b.date.toString(),
      startTime: b.startTime,
      endTime: b.endTime,

      workerName: b.workerId?.name || '',
      workerImage: b.workerId?.profileImage || 'https://cdn.vectorstock.com/i/1000v/06/52/dabbing-construction-worker-cartoon-vector-51110652.jpg',
      contact: b.workerId?.phone || '',

      address: b.address,

      advanceAmount: b.advanceAmount,
      totalAmount: b.totalAmount || 0,
      remainingAmount: b.remainingAmount || 0,

      advancePaymentStatus: b.advancePaymentStatus || 'unpaid',
      finalPaymentStatus: b.finalPaymentStatus || 'unpaid',

      paymentMethod: b.paymentMethod,

      additionalItems: b.additionalItems || [],
      paymentItems: b?.paymentBreakdown,

      status: b.status,
      workerResponse: b.workerResponse,

      otp: b.otp ?? undefined,
      review: b.reviewId ? {
        comment: b.reviewId.comment,
        rating: b.reviewId.rating,
        createdAt: b.reviewId.createdAt.toLocaleDateString(),

      } : undefined,
    };
  }
}
