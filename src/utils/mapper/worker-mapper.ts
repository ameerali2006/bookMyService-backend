import { responseDto } from '../../dto/worker/auth/worker-register.dto';
import {
  allBookingDto,
  ApprovedServices,
  ServiceRequest,
  WorkerProfileDTO,
} from '../../dto/worker/working-details.dto';
import { IBookingPopulated } from '../../interface/model/booking.model.interface';
import { IWorker } from '../../interface/model/worker.model.interface';
import { IBookingWorkerListItem } from '../../interface/service/worker/worker-booking.service.interface';

type CategoryObj = { category: string };

const isCategoryObj = (val: unknown): val is CategoryObj => typeof val === 'object' && val !== null && 'category' in val;

export class WorkerMapper {
  static responseWorkerDto(worker: IWorker): responseDto {
    const { _id, location, name,email,profileImage,zone } = worker;

    return {
      _id: _id.toString(),
      name: name,
      email: email,
      image: profileImage,
      location: {
        lat: location.coordinates[1],
        lng: location.coordinates[0],
        address:zone,
      },
    };
  }

  static serviceRequest(booking: IBookingPopulated): ServiceRequest {
    const { _id } = booking;

    return {
      userName: booking.userId?.name ?? 'Unknown',
      serviceName: booking.serviceId?.category ?? 'Unknown',
      date: booking.date?.toDateString() ?? '',
      id: _id?.toString() ?? '',
      location: booking?.address?.city ?? 'Unknown',
      notes: booking?.description ?? '',
      phone: booking.userId?.phone ?? '',
      status: booking.workerResponse ?? 'pending',
      time: booking.startTime ?? '',
      userLocation: {
        lat: booking?.address?.location?.coordinates?.[1] ?? 0,
        lng: booking?.address?.location?.coordinates?.[0] ?? 0,
      },
    };
  }

  static mapServiceRequest(booking: IBookingPopulated[]): ServiceRequest[] {
    return booking.map((b) => this.serviceRequest(b));
  }

  static mapWorkerToProfileDTO = (worker: IWorker): WorkerProfileDTO => ({
    id: worker._id?.toString(),
    name: worker.name,
    email: worker.email,
    phone: worker.phone || '',
    profileImage: worker.profileImage || '',
    experience: worker.experience,
    zone: worker.zone,
    category: isCategoryObj(worker.category)
      ? worker.category.category
      : typeof worker.category === 'string'
        ? worker.category
        : '',
    fees: worker.fees,
    isActive: worker.isActive,
    isVerified: worker.isVerified,
    description: worker.description || '',
    skills: worker.skills || [],
    location: {
      lat: worker.location?.coordinates[1] || 0,
      lng: worker.location?.coordinates[0] || 0,
    },
    documents: worker.documents || '',
  });

  static ApprovedService = (b: IBookingPopulated): ApprovedServices => {
    const { _id } = b;

    return {
      id: _id.toString(),
      customerName: b.userId.name,
      serviceName: b.serviceId.category,
      date: b.date,
      startTime: b.startTime,
      endTime: b.endTime,
      status: b.status as
        | 'confirmed'
        | 'in-progress'
        | 'awaiting-final-payment',
    };
  };

  static toAllWorkerBookingDto(booking: IBookingWorkerListItem): allBookingDto {
    const { _id } = booking;
    const { _id: userId } = booking.user._id;

    return {
      id: _id.toString(),
      userId: userId.toString(),
      userName: booking.user.name,
      serviceName: booking.service.category,
      date: booking.date.toISOString().split('T')[0],
      time: booking.startTime,
      address:
        typeof booking.address === 'string'
          ? booking.address
          : (booking.address?.buildingName
            ?? booking.address?.street
            ?? booking.address?.area
            ?? ''),
      status: booking.status,
      workerResponse: booking.workerResponse,
    };
  }
}
