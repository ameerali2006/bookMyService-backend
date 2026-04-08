import { IBooking } from '../interface/model/booking.model.interface';
import { IWorker } from '../interface/model/worker.model.interface';
import {
  BookingDetails,
  VerifiedPaymentResult,
} from '../interface/service/services/booking-service.sevice.interface';
import { serviceCreateDto } from './admin/management.dto';
import { responsePart } from './shared/responsePart';
import { IWorkerListItem } from './user/worker-listing-home.dto';

export interface setBasicBookingDetailsResponse extends responsePart {
  bookingId: string | null;
}
export interface getBookingDetailsResponseDTO extends responsePart {
  details: BookingDetails | null;
}
export interface updateWorkerDetailsRequestDto {
  bookingId: string;
  workerId: string;
  endingTime: string;
  itemsRequired: Array<{ name: string; price: number; description?: string }>;
  additionalNotes?: string;
}
export interface updateWorkerDetailsResponseDto extends responsePart {
  booking?: IBooking;
}
export interface verifyPaymentResponseDto extends responsePart {
  data: VerifiedPaymentResult | null;
}

export interface getServicesResponseDto extends responsePart {
  services?: serviceCreateDto[];
}
export interface getWorkerAvailablityResponseDto extends responsePart {
  data?: {
    dates: {
      date: string;
      enabled: boolean;
      day: string;
      availableTimes: {
        start: string;
        end: string;
        status: 'available' | 'unavailable' | 'break' | 'booked';
      }[];
    }[];
  };
}
export interface getNearByWorkersResponseDto extends responsePart {
  data: { workers: IWorkerListItem[]; totalCount: number }|null
}
