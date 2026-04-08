import { response } from 'express';
import { responsePart } from '../shared/responsePart';

export interface userManageDto{
    _id:string,
    name:string,
    email:string,
    phone:string,
    image?:string,
    isBlocked:boolean,
    createdAt:Date

}
export interface workerManageDto {
  _id: string
  name: string
  email: string
  phone?: string
  isBlocked: boolean
  isVerified: string
  category: string
  experience: string
  profileImage?: string
  createdAt: Date
}
export interface serviceCreateDto{

  category: string;
  description: string;
  price: number;
  priceUnit: 'per hour'| 'per job'| 'per item';
  duration: number;
  image: string;

  status: 'active' | 'inactive';

}
export interface serviceManageDto extends serviceCreateDto {
  _id: string;
  createdAt: Date;
}
export interface AdminBookingDto {
  id: string
  customerName: string
  workerName: string
  serviceName: string
  date: Date
  startTime: string
  endTime?: string
  status: 'pending' | 'confirmed' | 'in-progress' | 'awaiting-final-payment' | 'completed' | 'cancelled'
  createdAt: Date
}
export interface AdminBookingDetailsDto {
  id: string
  status: string
  bookingDate: Date
  timeSlot: string

  customer: {
    name: string
    phone: string
    avatar?: string
  }

  worker: {
    name: string
    phone?: string
    email: string
    avatar?: string
    response: 'accepted' | 'rejected' | 'pending'
  }

  service: {
    name: string
    category: string
    duration: number
  }

  address: {
    street?: string
    city: string
    state: string
    pinCode: string
    phone: string
    lat: number
    lng: number
  }

  description?: string

  additionalItems: {
    name: string
    price: number
  }[]

  payment: {
    advanceAmount: number
    remainingAmount: number
    totalAmount: number
    advancePaid: boolean
    finalPaid: boolean
    paymentMethod?: string
    breakdown?: {
      title: string
      rate: number
      quantity: number
      total: number
    }[]
  }

  rating?: {
    stars: number
    review?: string
  }

  timeline: {
    status: string
    completed: boolean
    date?: Date
  }[]
}
export interface IbookingDetailPageResponse extends responsePart{
  booking?:AdminBookingDetailsDto

}
