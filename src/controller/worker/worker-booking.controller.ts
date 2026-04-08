import { inject, injectable } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { Error } from 'mongoose';
import { IWorkerBookingController } from '../../interface/controller/worker-booking.controller.interface';
import { TYPES } from '../../config/constants/types';
import { IWorkerBookingService } from '../../interface/service/worker/worker-booking.service.interface';
import { ApprovalSchema } from '../validation/service-approval.zod';
import { MESSAGES } from '../../config/constants/message';
import { STATUS_CODES } from '../../config/constants/status-code';
import { CustomRequest } from '../../middleware/auth.middleware';
import { WorkerBookingListRequestDto } from '../validation/allBookingList.zod';

@injectable()
export class WorkerBookingController implements IWorkerBookingController {
  constructor(
    @inject(TYPES.WorkerBookingService) private bookingService:IWorkerBookingService,
  ) {}

  async approveService(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = ApprovalSchema.parse(req.body);
      console.log(data);
      const result = await this.bookingService.approveService(data);
      console.log('dffdgfg');

      console.log(result);

      if (result.success) {
        res.status(STATUS_CODES.OK).json(result);
      } else {
        res.status(STATUS_CODES.BAD_REQUEST).json(result);
      }
    } catch (error) {
      next(error);
    }
  }

  async rejectService(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { bookingId, description } = req.body;

      const result = await this.bookingService.rejectService(
        bookingId,
        description,
      );

      res.status(result.success ? STATUS_CODES.OK : STATUS_CODES.BAD_REQUEST).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getServiceRequests(req: Request, res: Response, next: NextFunction) :Promise<void> {
    try {
      const workerId = (req as CustomRequest).user._id; // from auth middleware

      const filters = {
        workerId,
        search: req.query.search?.toString() || '',
        status: (req.query.status as 'pending'|'accepted'|'rejected') || 'pending',
        date: req.query.date?.toString() || '',
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 20,
      };

      const response = await this.bookingService.getServiceRequests({ ...filters, advancePaymentStatus: 'paid' });

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  async getServiceApprovals(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const workerId = (req as CustomRequest).user._id;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const search = req.query.search as string | undefined;
      const status = req.query.status as any;

      const result = await this.bookingService.getWorkerApprovedBookings({
        workerId,
        page,
        limit,
        search,
        status,
      });
      console.log(result);

      if (result.success) {
        res.status(STATUS_CODES.OK).json(result);
      } else {
        res.status(STATUS_CODES.BAD_REQUEST).json(result);
      }
    } catch (error) {
      next(error);
    }
  }

  async getApprovalsDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { bookingId } = req.params;
      const result = await this.bookingService.getWorkerAprrovalpageDetails(bookingId);
      if (result.success) {
        res.status(STATUS_CODES.OK).json(result);
      } else {
        res.status(STATUS_CODES.BAD_REQUEST).json(result);
      }
    } catch (error) {
      next(error);
    }
  }

  async reachLocation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { bookingId } = req.params;
      const result = await this.bookingService.reachedCustomerLocation(bookingId);
      console.log(result);
      if (result.success) {
        res.status(STATUS_CODES.OK).json(result);
      } else {
        res.status(STATUS_CODES.BAD_REQUEST).json(result);
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async verifyWorker(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { bookingId, otp } = req.body;
      const response = await this.bookingService.verifyWorker(bookingId, otp);
      if (response.success) {
        res.status(STATUS_CODES.OK).json(response);
      } else {
        res.status(STATUS_CODES.BAD_REQUEST).json(response);
      }
    } catch (error) {
      next(error);
    }
  }

  async workComplated(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { bookingId } = req.body;
      const response = await this.bookingService.workerComplateWork(bookingId);
      res.status(response.status || STATUS_CODES.BAD_REQUEST).json(response);
    } catch (error) {
      next(error);
    }
  }

  async allBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const workerId = (req as CustomRequest).user._id;

      const query = WorkerBookingListRequestDto.parse(req.query);

      const data = await this.bookingService.getWorkerBookings(
        workerId,
        query,
      );
      if (data.success) {
        res.status(STATUS_CODES.OK).json(data);
      } else {
        res.status(STATUS_CODES.BAD_REQUEST).json(data);
      }
    } catch (error) {
      console.error(error);
      next(Error);
    }
  }
}
