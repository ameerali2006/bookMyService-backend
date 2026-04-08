import { Request, Response, NextFunction } from 'express';
import { inject, injectable } from 'tsyringe';
import { StringExpression } from 'mongoose';
import { IBookingController } from '../interface/controller/booking-controller.controller.interface';
import { CustomRequest } from '../middleware/auth.middleware';
import { TYPES } from '../config/constants/types';
import { IBookingService } from '../interface/service/services/booking-service.sevice.interface';
import { STATUS_CODES } from '../config/constants/status-code';

@injectable()
export class BookingController implements IBookingController {
  constructor(
        @inject(TYPES.BookingService) private _bookingService:IBookingService,

  ) {}

  async setBasicBookingDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as CustomRequest).user._id;
      console.log(req.body);
      const {
        date, time, description, workerId,
      } = req.body;
      const response = await this._bookingService.setBasicBookingDetails(userId, workerId, time, date, description);
      if (response.message == 'Slot already booked by another user') {
        res.status(STATUS_CODES.OK).json(response);
      } else
        if (!response.success) {
          res.status(STATUS_CODES.BAD_REQUEST).json(response);
        } else {
          res.status(STATUS_CODES.OK).json(response);
        }
    } catch (error) {
      next(error);
    }
  }

  async getBookingDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { bookingId } = req.query;
      console.log(req.query);
      const response = await this._bookingService.getBookingDetails(bookingId as string);
      if (!response.success) {
        res.status(STATUS_CODES.BAD_REQUEST).json(response);
      } else {
        res.status(STATUS_CODES.OK).json(response);
      }
    } catch (error) {
      next(error);
    }
  }

  async verifyPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { bookingId, paymentType } = req.query;

      const response = await this._bookingService.verifyPayment(
        bookingId as string,
        paymentType as 'advance' | 'final',
      );

      if (!response.success) {
        res.status(STATUS_CODES.BAD_REQUEST).json(response);
      } else {
        res.status(STATUS_CODES.OK).json(response);
      }
    } catch (error) {
      next(error);
    }
  }
}
