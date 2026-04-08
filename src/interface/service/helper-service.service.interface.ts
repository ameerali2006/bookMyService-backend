import {
  getServiceNamesResponse,
  getWorkerAvailableTimeResponse,
} from '../../dto/shared/helpers.dto';
import { IService } from '../model/service.model.interface';

export interface ITodayScheduleItem {
  bookingId: string;
  time: string;
  service: string;
  clientName: string;
  status:
    | 'pending'
    | 'confirmed'
    | 'in-progress'
    | 'awaiting-final-payment'
    | 'completed'
    | 'cancelled';
}

export interface IWorkerDashboardStats {
  totalJobs: number;
  monthlyEarnings: number;
  upcomingJobs: number;
  averageRating: number;
  totalReviews: number;
  todayJobs: number;
  efficiency: number;
  satisfaction: number;
}

export interface IWorkerDashboardServiceResponse {
  workerStatus: 'approved' | 'pending' | 'rejected';
  stats: IWorkerDashboardStats;
  todaySchedule: ITodayScheduleItem[];
}

export interface IWorkerHelperService {
  getServiceNames(): Promise<getServiceNamesResponse[] | null>;
  getWorkerAvailableTime(
    workerId: string,
    date: Date,
    startTime: string,
  ): Promise<getWorkerAvailableTimeResponse>;
  getDashboard(workerId: string): Promise<{success:boolean, message:string, data?:IWorkerDashboardServiceResponse}>;
}
