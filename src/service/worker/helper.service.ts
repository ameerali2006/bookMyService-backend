import { inject, injectable } from 'tsyringe';
import { IWorkerDashboardServiceResponse, IWorkerHelperService } from '../../interface/service/helper-service.service.interface';
import { getServiceNamesResponse, getWorkerAvailableTimeResponse } from '../../dto/shared/helpers.dto';
import { IService } from '../../interface/model/service.model.interface';
import { TYPES } from '../../config/constants/types';
import { IServiceRepository } from '../../interface/repository/service.repository.interface';
import { CustomError } from '../../utils/custom-error';
import { MESSAGES } from '../../config/constants/message';
import { STATUS_CODES } from '../../config/constants/status-code';
import { fromMinutes, toMinutes } from '../../utils/time&Intervals';
import { IWorkingDetailsRepository } from '../../interface/repository/working-details.interface';
import { IBookingRepository } from '../../interface/repository/booking.repository.interface';
import { IWorkerRepository } from '../../interface/repository/worker.repository.interface';

@injectable()
export class WorkerHelperService implements IWorkerHelperService {
  constructor(
        @inject(TYPES.ServiceRepository) private _serviceRepo:IServiceRepository,
        @inject(TYPES.WorkingDetailsRepository) private workingRepo:IWorkingDetailsRepository,
        @inject(TYPES.BookingRepository) private bookingRepo:IBookingRepository,
        @inject(TYPES.WorkerRepository) private workerRepo:IWorkerRepository,
  ) {

  }

  async getServiceNames(): Promise<getServiceNamesResponse[] | null> {
    try {
      const data = await this._serviceRepo.findActiveServices();
      if (!data) {
        return null;
      }
      const finalData = data.map((dat, i) => ({
        value: String(dat._id),
        label: dat.category.charAt(0).toUpperCase() + dat.category.slice(1),
      }));
      return finalData;
    } catch (error) {
      console.error('Login error:', error);

      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError(
        MESSAGES.UNAUTHORIZED_ACCESS,
        STATUS_CODES.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getWorkerAvailableTime(
    workerId: string,
    date: Date,
    startTime: string,
  ): Promise<getWorkerAvailableTimeResponse> {
    const working = await this.workingRepo.findByWorkerId(workerId);
    if (!working) return { success: false };

    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const schedule = working.days.find((d) => d.day === dayName && d.enabled);

    if (!schedule) return { success: true, availableTime: '0.00' };

    const startMin = toMinutes(startTime);
    const endMin = toMinutes(schedule.endTime);

    // Convert breaks into time blocks
    const breakBlocks = schedule.breaks.map((b) => ({
      start: toMinutes(b.breakStart),
      end: toMinutes(b.breakEnd),
    }));

    // Convert bookings into time blocks
    const bookings = await this.bookingRepo.findByWorkerAndDate(workerId, date);
    const bookingBlocks = bookings
      .filter((b) => b.startTime && b.endTime)
      .map((b) => ({
        start: toMinutes(b.startTime),
        end: toMinutes(b.endTime!),
      }));

    // Merge & sort all unavailable blocks
    const blocks = [...breakBlocks, ...bookingBlocks].sort((a, b) => a.start - b.start);

    // Find the closest upcoming block after startTime
    const nextBlock = blocks.find((b) => b.start > startMin);

    const nextStart = nextBlock ? nextBlock.start : endMin;

    const diff = nextStart - startMin;
    const availableMinutes = diff > 0 ? diff : 0;

    return {
      success: true,
      availableTime: fromMinutes(availableMinutes), // returns 1.30 for 1 hr 30 mins
    };
  }

  async getDashboard(workerId: string): Promise<{success:boolean, message:string, data?:IWorkerDashboardServiceResponse}> {
    const worker = await this.workerRepo.findById(workerId);

    if (!worker) {
      return { success: false, message: 'worker not fount' };
    }

    const dashboardData = await this.bookingRepo.getWorkerDashboardStats(workerId);

    const efficiency = dashboardData.totalJobs
      ? Math.round(
        (dashboardData.completedJobs / dashboardData.totalJobs) * 100,
      )
      : 0;

    const satisfaction = Math.round(
      (dashboardData.avgRating / 5) * 100,
    );

    return {
      success: true,
      message: 'dashboardfetch successfully',
      data: {
        workerStatus: worker.isVerified,
        stats: {
          totalJobs: dashboardData.totalJobs,
          monthlyEarnings: dashboardData.monthlyEarnings,
          upcomingJobs: dashboardData.upcomingJobs,
          averageRating: Number(dashboardData.avgRating.toFixed(1)),
          totalReviews: dashboardData.totalReviews,
          todayJobs: dashboardData.todaySchedule.length,
          efficiency,
          satisfaction,
        },
        todaySchedule: dashboardData.todaySchedule.map((job: any) => ({
          bookingId: job._id,
          time: job.startTime,
          service: job.serviceId?.category,
          clientName: job.userId?.name,
          status: job.status,
        })),
      },
    };
  }
}
