import { IAddress } from '../../interface/model/address.model.interface';
import { IPaymentItem } from '../../interface/model/booking.model.interface';
import { responsePart } from '../shared/responsePart';
import { responseDto } from '../worker/auth/worker-register.dto';

import { Address, ProfileDetails } from './auth/profile.dto';

export interface ongoingBookingDto{
    id: string
    serviceName: string
    workerName: string
    date: string
    time: string
    status: 'accepted' | 'rejected' | 'pending'
}
interface IReviewResponseData {
  comment: string;
  rating: number;
  createdAt: string;
}
export interface BookingDetailDto {
  id: string
  serviceName: string
  description?: string
  date: string
  startTime: string
  endTime?: string
  workerName: string
  workerImage: string
  contact: string
  address: IAddress
  advanceAmount: number
  totalAmount: number
  remainingAmount: number
  advancePaymentStatus: 'unpaid' | 'paid' | 'failed' | 'refunded'
  finalPaymentStatus: 'unpaid' | 'paid' | 'failed' | 'refunded'
  paymentMethod?: 'stripe' | 'upi' | 'cash'
  additionalItems?: { name: string; price: number }[]
  paymentItems?:IPaymentItem[]
  status:
    | 'pending'
    | 'confirmed'
    | 'in-progress'
    | 'awaiting-final-payment'
    | 'completed'
    | 'cancelled'
  workerResponse: 'accepted' | 'rejected' | 'pending'
  otp?: string
  review?:IReviewResponseData
}

export interface ongoingBookingsResponseDto extends responsePart{
  data?:{data:ongoingBookingDto[], total:number}
}
export interface bookingDetailDataResponseDto extends responsePart{
  booking?:BookingDetailDto
}

export interface updateUserProfileDetailsResponseDto extends responsePart{
  user:ProfileDetails|null
}
export interface getUserAddressResponseDto extends responsePart{
   addresses:Address[]|null
}
export interface addUserAddressResponseDto extends responsePart{
  address:Address|null
}
