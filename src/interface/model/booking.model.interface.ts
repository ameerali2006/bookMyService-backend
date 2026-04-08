import { Document, Types } from 'mongoose';
import { IWorker } from './worker.model.interface';
import { IUser } from './user.model.interface';
import { IService } from './service.model.interface';
import { IAddress } from './address.model.interface';
import { IReview } from './review.model.interface';

export interface IAdditionalItem{
  name: string;
  price: number;
}

export interface IRating {
  score?: number;
  review?: string;
}
export interface IPaymentItem {
  title: string;
  rate: number;
  rateLabel: string;
  quantity: number;
  total: number;
}
export type BookingStatus= 'pending'| 'confirmed'| 'in-progress' | 'awaiting-final-payment'| 'completed'| 'cancelled'

export interface IBooking extends Document{
  _id: Types.ObjectId;

  userId: Types.ObjectId|string;
  workerId: Types.ObjectId|string;
  serviceId: Types.ObjectId|string;
  address: Types.ObjectId|string;

  date: Date;
  startTime: string;
  endTime?: string;
  description?: string;

  advanceAmount: number;
  totalAmount?: number;
  remainingAmount?: number;

  advancePaymentId?: string;
  advancePaymentStatus?: 'unpaid' | 'paid' | 'failed' | 'refunded';

  finalPaymentId?: string;
  finalPaymentStatus?: 'unpaid' | 'paid' | 'failed' | 'refunded';

  paymentMethod?: 'stripe' | 'upi' | 'cash';

  additionalItems?: IAdditionalItem[];
  paymentBreakdown?: IPaymentItem[];

  status:BookingStatus

  workerResponse: 'accepted' | 'rejected' | 'pending';

  otp?: string;

  reviewId?: Types.ObjectId ;
  isSettled:boolean
  createdAt?: Date;
  updatedAt?: Date;
}
export type IBookingPopulated = Omit<IBooking, 'workerId' | 'userId' | 'serviceId'|'address'|'reviewId'> & {
  workerId: IWorker;
  userId: IUser;
  serviceId: IService;
  address:IAddress;
  reviewId:IReview

};
