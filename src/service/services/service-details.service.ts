import { inject, injectable } from 'tsyringe';
import { IWorker } from '../../interface/model/worker.model.interface';
import { IServiceDetails } from '../../interface/service/services/Service-details.service.interface';
import { TYPES } from '../../config/constants/types';
import { IWorkerAggregation } from '../../interface/repository/worker-aggregation.repository.interface';
import { serviceCreateDto } from '../../dto/admin/management.dto';
import { STATUS_CODES } from '../../config/constants/status-code';
import { CustomError } from '../../utils/custom-error';
import { MESSAGES } from '../../config/constants/message';
import { IServiceRepository } from '../../interface/repository/service.repository.interface';
import { IWorkingDetailsRepository } from '../../interface/repository/working-details.interface';
import { IBookingRepository } from '../../interface/repository/booking.repository.interface';
import { IWorkingHelper } from '../../interface/service/working-helper.service.interface';
import { IWorkingDetails } from '../../interface/model/working-details.interface';
import {
  buildLabeledTimeline,
  dateKey,
  dayBounds,
  fromMinutes,
  Interval,
  LabeledStatus,
  mergeIntervals,
  subtractIntervals,
  toMinutes,
} from '../../utils/time&Intervals';
import {
  IWorkerListItem,
  IWorkerProfileResponse,
} from '../../dto/user/worker-listing-home.dto';

import { IReviewRepository } from '../../interface/repository/review.repository.interface';
import { IWorkerRepository } from '../../interface/repository/worker.repository.interface';

@injectable()
export class ServiceDetails implements IServiceDetails {
  constructor(
    @inject(TYPES.WorkerAggregation) private _workerAgg: IWorkerAggregation,
    @inject(TYPES.ServiceRepository) private _serviceRepo: IServiceRepository,
    @inject(TYPES.WorkingDetailsRepository)
    private _workingDetails: IWorkingDetailsRepository,
    @inject(TYPES.BookingRepository) private _booking: IBookingRepository,
    @inject(TYPES.WorkingHelper) private _workingHelper: IWorkingHelper,
    @inject(TYPES.ReviewRepository) private _reviewRepo: IReviewRepository,
    @inject(TYPES.WorkerRepository) private _workerRepo: IWorkerRepository,
  ) {}

  async getNearByWorkers(
    serviceId: string,
    lat: number,
    lng: number,
    search: string,
    sort: string,
    page: number,
    pageSize: number,
  ): Promise<{
    success: boolean;
    message: string;
    data: { workers: IWorkerListItem[]; totalCount: number } | null;
  }> {
    try {
      if (!lat || !lng || !serviceId) {
        throw new Error('Latitude, longitude and serviceId are required');
      }
      console.log({
        serviceId,
        lat,
        lng,
        search,
        sort,
        page,
        pageSize,
      });
      const data = await this._workerAgg.findNearbyWorkersByServiceId(
        serviceId,
        lat,
        lng,
        search,
        sort,
        page,
        pageSize,
      );

      console.log(data);
      if (!data) {
        return { success: false, message: 'Worker not Found', data: null };
      }
      return { success: true, message: 'Data fetched Successfully', data };
    } catch (error) {
      console.error(error);
      return { success: false, message: 'Worker not Found', data: null };
    }
  }

  async getServices(
    lat: number,
    lng: number,
    maxDistance: number,
  ): Promise<{
    status: number;
    success: boolean;
    message: string;
    services?: serviceCreateDto[];
  }> {
    try {
      if (!lat || !lng) {
        return {
          status: STATUS_CODES.BAD_REQUEST,
          success: false,
          message: 'Latitude and longitude are required',
        };
      }
      console.log({ lat, lng, maxDistance });
      const nearbyWorkers = await this._workerAgg.findNearbyWorkers(
        lat,
        lng,
        maxDistance,
      );
      console.log(nearbyWorkers);
      const serviceIds = nearbyWorkers.map((w) => w._id);

      if (serviceIds.length === 0) {
        return {
          status: STATUS_CODES.OK,
          success: true,
          message: 'No services found nearby',
          services: [],
        };
      }

      const services = await this._serviceRepo.findActiveServicesByIds(serviceIds);

      return {
        status: STATUS_CODES.OK,
        success: true,
        message: 'Nearby services found',
        services,
      };
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

  private rotateDays(days: any[], todayName: string) {
    const startIndex = days.findIndex((d) => d.day === todayName);
    if (startIndex === -1) return days;
    return [...days.slice(startIndex), ...days.slice(0, startIndex)];
  }

  private toHM(date: Date | string): string {
    const d = new Date(date);
    return d.toTimeString().substring(0, 5);
  }

  private timeToMinutes(time: string) {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }

  async getWorkerAvailablity(workerId: string): Promise<{
    status: number;
    success: boolean;
    message: string;
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
  }> {
    try {
      // 1) Working details
      let details = await this._workingDetails.findByWorkerId(workerId);
      if (!details) {
        return {
          status: 404,
          success: false,
          message: 'Working details not found',
        };
      }

      // 2) Apply week rotation if needed (prefer non-destructive rotation)
      const daysOfWeek = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ];
      const today = new Date();
      const todayName = daysOfWeek[today.getDay()];
      if (details.weekStartDay && todayName !== details.weekStartDay) {
        details = (await this._workingHelper.rotateDayShedule(
          String(details._id),
        )) as typeof details;
      }

      const rotatedDays = details.days ?? [];

      // 3) Batch fetch bookings in one range query for next 7 days
      const startBounds = dayBounds(today).start;
      const endBounds = new Date(startBounds);
      endBounds.setDate(endBounds.getDate() + 7); // exclusive upper bound

      // Ensure this returns: [{ date, startTime, endTime?, advancePaymentStatus }]
      const bookingsRange: Array<{
        date: Date;
        startTime: string;
        endTime?: string | null;
        advancePaymentStatus?: 'unpaid' | 'paid' | 'failed' | 'refunded';
      }> = await this._booking.findByWorkerAndRange(
        workerId,
        startBounds,
        endBounds,
      );

      // 4) Index bookings by local dateKey
      const bookingsByKey = new Map<
        string,
        Array<{
          startTime: string;
          endTime?: string | null;
          advancePaymentStatus?: 'unpaid' | 'paid' | 'failed' | 'refunded';
        }>
      >();

      for (const b of bookingsRange ?? []) {
        const dk = dateKey(b.date);
        if (!bookingsByKey.has(dk)) bookingsByKey.set(dk, []);
        bookingsByKey.get(dk)!.push({
          startTime: b.startTime,
          endTime: b.endTime ?? null,
          advancePaymentStatus: b.advancePaymentStatus,
        });
      }

      // 5) Pre-index holidays & custom slots for O(1) lookup
      const holidaysSet = new Set(
        (details.holidays ?? []).map((h) => dateKey(h.date)),
      );
      const customByKey = new Map<
        string,
        Array<{ startTime: string; endTime: string }>
      >();
      for (const cs of details.customSlots ?? []) {
        const dk = dateKey(cs.date);
        if (!customByKey.has(dk)) customByKey.set(dk, []);
        customByKey
          .get(dk)!
          .push({ startTime: cs.startTime, endTime: cs.endTime });
      }

      // 6) Build 7-day availability
      const results: Array<{
        date: string;
        day: string;
        enabled: boolean;
        availableTimes: Array<{
          start: string;
          end: string;
          status: LabeledStatus;
        }>;
      }> = [];

      for (let i = 0; i < 7; i++) {
        const target = new Date(startBounds);
        target.setDate(startBounds.getDate() + i);
        const dk = dateKey(target);

        // Find schedule for this day (safe modulo)
        const daySchedule = rotatedDays[i % 7];
        const isHoliday = holidaysSet.has(dk);

        // ---- Base availability: union(working hours, custom slots) ----
        let base: Interval[] = [];
        if (!isHoliday && daySchedule?.enabled) {
          // Working hours
          base.push({
            start: toMinutes(daySchedule.startTime),
            end: toMinutes(daySchedule.endTime),
          });

          // Custom slots for that day (additional availability)
          for (const cs of customByKey.get(dk) ?? []) {
            base.push({
              start: toMinutes(cs.startTime),
              end: toMinutes(cs.endTime),
            });
          }

          // Merge & guard invalid ranges
          base = mergeIntervals(base.filter((iv) => iv.end > iv.start));
        }

        // Breaks
        const breakCuts: Interval[] = (daySchedule?.breaks ?? [])
          .map((b) => ({
            start: toMinutes(b.breakStart),
            end: toMinutes(b.breakEnd),
          }))
          .filter((iv) => iv.end > iv.start);

        // Booked cuts (with 60-min buffer rule for advance-paid bookings with no endTime)
        const bookedCuts: Interval[] = (bookingsByKey.get(dk) ?? [])
          .map((b) => {
            const s = toMinutes(b.startTime);

            // Case 1: If endTime exists, use it as-is.
            if (b.endTime) {
              const e = toMinutes(b.endTime);
              return { start: s, end: e };
            }

            // Case 2: No endTime, advance paid -> block 60 min buffer.
            if (b.advancePaymentStatus === 'paid') {
              return { start: s, end: s + 60 };
            }

            // Case 3: No endTime, advance not paid -> ignore (no block).
            return null;
          })
          .filter((iv): iv is Interval => !!iv && iv.end > iv.start);

        // Available after subtracting breaks & booked
        let available = subtractIntervals(base, breakCuts);
        available = subtractIntervals(available, bookedCuts);

        // Build full labeled 00:00–24:00 timeline with priorities
        const labeled = buildLabeledTimeline(available, breakCuts, bookedCuts);

        // Enabled if not holiday, schedule enabled, and has some available segment
        const enabled = !isHoliday
          && !!daySchedule?.enabled
          && labeled.some((x) => x.status === 'available');

        results.push({
          date: dk,
          day:
            daySchedule?.day
            ?? target.toLocaleString('en-US', { weekday: 'long' }),
          enabled,
          availableTimes: labeled.map((seg) => ({
            start: fromMinutes(seg.start),
            end: fromMinutes(seg.end),
            status: seg.status,
          })),
        });
      }

      // 7) Return final payload
      return {
        status: 200,
        success: true,
        message: 'Availability fetched successfully',
        data: { dates: results },
      };
    } catch (err) {
      // log err as needed
      return {
        status: 500,
        success: false,
        message: 'Failed to fetch availability',
      };
    }
  }

  async getWorkerProfile(workerId: string): Promise<{
    success: boolean;
    message: string;
    data: IWorkerProfileResponse | null;
  }> {
    try {
      const worker = await this._workerRepo.findById(workerId);

      if (!worker) {
        return {
          success: false,
          message: 'Worker not found',
          data: null,
        };
      }

      const reviews = await this._reviewRepo.getRecentReviewsByWorker(workerId);

      const ratingSummary = await this._reviewRepo.getWorkerRatingSummary(workerId);

      const response: IWorkerProfileResponse = {
        ...worker.toObject(),
        avgRating: ratingSummary.avgRating,
        totalReviews: ratingSummary.totalReviews,
        recentReviews: reviews,
      };

      return {
        success: true,
        message: 'Worker profile fetched successfully',
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch worker profile',
        data: null,
      };
    }
  }
}
