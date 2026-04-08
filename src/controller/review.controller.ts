import { inject, injectable } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { IReviewController } from '../interface/controller/review.controller.interface';
import { STATUS_CODES } from '../config/constants/status-code';
import { CustomRequest } from '../middleware/auth.middleware';
import { TYPES } from '../config/constants/types';
import { IReviewService } from '../interface/service/review.service.Interface';

@injectable()
export class ReviewController implements IReviewController {
  constructor(
    @inject(TYPES.ReviewService) private reviewService: IReviewService,
  ) {}

  async addReview(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { bookingId, comment, rating } = req.body;
      console.log({ bookingId, comment, rating });

      const userId = (req as CustomRequest).user._id;
      if (!bookingId || !rating || String(comment).trim() == '') {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: 'BookingId and rating are required',
        });
        return;
      }

      if (rating < 1 || rating > 5) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: 'Rating must be between 1 and 5',
        });
        return;
      }

      const result = await this.reviewService.addReview(
        comment,
        rating,
        bookingId,
        userId,
      );
      console.log(result);

      res.status(STATUS_CODES.OK).json(result);
    } catch (error) {
      console.error(error);
      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ success: false, message: 'server interfnal Error' });
    }
  }

  async allReviewManagement(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const {
        search = '',
        sort = 'latest',
        page = '1',
        limit = '10',
      } = req.query;

      const result = await this.reviewService.getAllReviews({
        search: String(search),
        sort: String(sort),
        page: Number(page),
        limit: Number(limit),
      });

      res.status(STATUS_CODES.OK).json(result);
    } catch (error) {
      console.error(error);
      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
}
