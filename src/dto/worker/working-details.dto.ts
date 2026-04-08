import { BookingStatus, IBookingPopulated } from '../../interface/model/booking.model.interface';
import { ICustomSlot, IHoliday, IWorkingDetailsDocument } from '../../interface/model/working-details.interface';
import { responsePart } from '../shared/responsePart';

export interface allBookingDto{

  id: string
  userId: string
  userName: string
  serviceName: string
  date: string
  time: string
  address: string
  status:
    | 'pending'
    | 'confirmed'
    | 'in-progress'
    | 'awaiting-final-payment'
    | 'completed'
    | 'cancelled'
    workerResponse: 'accepted' | 'rejected' | 'pending'
}
export interface WorkerBookingListResponseDto {
  bookings: allBookingDto[];
  total: number;
  page: number;
  limit: number;
}

export interface WorkerProfileDTO {
  id: string;
  name: string;
  email: string;
  phone: string;
  profileImage?: string;
  experience: string;
  zone: string;
  category: string;
  fees: number;
  isActive: boolean;
  isVerified: 'pending' | 'approved' | 'rejected';
  location: {
    lat: number;
    lng: number;
  };
  description:string
  skills:string[]
  documents?: string;
}
export interface ServiceRequest {
  id: string;
  serviceName: string;
  userName: string;
  date: string;
  time: string;
  availableTime?:string;
  location?: string;
  status?: 'pending' | 'accepted' | 'rejected';
  userLocation: { lat: number; lng: number };
  notes?: string;
  phone: string;
}
export interface ApprovedServices {
  id: string
  customerName: string
  serviceName: string
  date: Date
  startTime: string
  endTime?: string

  status: 'confirmed' | 'in-progress'|'awaiting-final-payment'
}
export interface ILocation {
  type: 'Point';
  coordinates: [number, number];
}
export interface IAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  location: ILocation;
}

export interface IWorkerRequestResponse {

  data: ServiceRequest[];
  page: number;
  total: number;
}

export interface getServiceRequestsResponseDto extends responsePart{
   data?: IWorkerRequestResponse;
}
export interface getWorkerApprovedBookingsRequestDto {
    workerId: string;
    page: number;
    limit: number;
    search?: string;
    status?: 'approved' | 'in-progress' | 'awaiting-final-payment';
}
export interface getWorkerApprovedBookingsResponseDto extends responsePart{
   today?: ApprovedServices[];
    upcoming?: ApprovedServices[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
}
export interface getWorkerAprrovalpageDetailsResponseDto extends responsePart{
  booking?:(IBookingPopulated&{verification:boolean})
}
export interface reachedCustomerLocationResponseDto extends responsePart{
  booking?:(IBookingPopulated&{verification:boolean})
}

export interface updateWorkingDetailsResponseDto extends responsePart{
  data:IWorkingDetailsDocument|null
}
export interface getProfileDetailsResponseDto extends responsePart{
  worker:WorkerProfileDTO|null
}
export interface updateWorkerProfileResponseDto extends responsePart{
  worker:WorkerProfileDTO|null
}
export interface getCalenderDetailsResponseDto extends responsePart{
  customSlots:ICustomSlot[]|null,
  holidays:IHoliday[]|null
}
export interface updateCalenderDetailsResponseDto extends responsePart{
  customSlots:ICustomSlot[]|null,
  holidays:IHoliday[]|null
}
export interface workerComplateWorkResponseDto extends responsePart{
  booking?:(IBookingPopulated&{verification:boolean})
}
