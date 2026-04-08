import Stripe from 'stripe';
import { IWorker } from '../../interface/model/worker.model.interface';
import {
  AdminBookingDto, serviceManageDto, userManageDto, workerManageDto,
} from '../admin/management.dto';
import { responsePart } from './responsePart';

export interface getServiceNamesResponse {
    value:string, label:string
}
export interface getWorkerAvailableTimeResponse {
    success: boolean; availableTime?: string
}

export interface getAllUsersResponse {
    users:userManageDto[]|workerManageDto[];currentPage: number;totalPages: number;totalItems: number
}
export interface verifyWorkerResponse {
   status:'approved'|'rejected'
}
export interface getUnverifiedWorkersResponse {
   workers:IWorker[]|null, total:number, currentPage:number, totalPages:number
}
export interface getAllServicesResponse {
   services:serviceManageDto[];currentPage: number;totalPages: number;totalItems: number
}
export interface serviceRegisterResponse {
   data?:serviceManageDto, message:string
}
export interface updateServiceStatusResponse {
   success:boolean, status:'inactive' |'active'
}
export interface getAllBookingsResponse extends responsePart{
   bookings?: AdminBookingDto[], total: number, page: number, limit: number
}

export interface createPaymentIntentResponse extends responsePart{
   paymentIntent:Stripe.PaymentIntent|null
}
export interface refreshTokenResponse{
    role: string; accessToken: string
}
