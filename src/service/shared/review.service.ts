import { MESSAGES } from '../../config/constants/message';
import { inject, injectable } from 'tsyringe';
import { IReviewService } from '../../interface/service/review.service.Interface';
import { TYPES } from '../../config/constants/types';
import { IReviewRepository } from '../../interface/repository/review.repository.interface';
import { IBookingRepository } from '../../interface/repository/booking.repository.interface';
import { INotificationService } from '../../interface/service/notification.service.interface';
import { responseReview } from '../../dto/shared/review.dto';

export type ReviewSortType =
  | 'latest'
  | 'oldest'
  | 'rating_high'
  | 'rating_low';
@injectable()
export class ReviewService implements IReviewService {
  constructor(
    @inject(TYPES.ReviewRepository) private reviewRepo: IReviewRepository,
    @inject(TYPES.BookingRepository) private bookingRepo: IBookingRepository,
    @inject(TYPES.NotificationService)
    private notification: INotificationService,
  ) {}

  async addReview(
    comment: string,
    rating: number,
    bookingId: string,
    userId: string,
  ): Promise<{
    success: boolean;
    message: string;
    review?: { comment: string; rating: number; createdAt: string };
  }> {
    try {
      // 1. check booking exists
      const booking = await this.bookingRepo.findById(bookingId);

      if (!booking) {
        return {
          success: false,
          message: MESSAGES.BOOKING_NOT_FOUND,
        };
      }

      // 2. check ownership
      if (booking.userId.toString() !== userId) {
        return {
          success: false,
          message: MESSAGES.UNAUTHORIZED,
        };
      }

      // 3. check completed
      if (booking.status !== 'completed') {
        return {
          success: false,
          message: MESSAGES.YOU_CAN_ONLY_REVIEW_COMPLETED_BOOKINGS,
        };
      }

      // 4. check already reviewed
      const existingReview = await this.reviewRepo.findByBookingId(bookingId);

      if (existingReview) {
        return {
          success: false,
          message: MESSAGES.REVIEW_ALREADY_SUBMITTED,
        };
      }

      // 5. create review
      const review = await this.reviewRepo.create({
        bookingId,
        userId,
        workerId: booking.workerId,
        comment,
        rating,
      });
      if (!review) {
        return {
          success: false,
          message: MESSAGES.REVIEW_ALREADY_SUBMITTED,
        };
      }

      // optional: update booking flag
      await this.bookingRepo.updateById(bookingId, {
        reviewId: review._id,
      });
      await this.notification.createNotification({
        title: 'new Review Add',
        message: MESSAGES.USER_GIVE_RATING_STAR_FOR_YOUR_WORK,
        type: 'booking',
        workerId: booking.workerId.toString(),
        bookingId:bookingId
      });

      return {
        success: true,
        message: MESSAGES.REVIEW_ADDED_SUCCESSFULLY,
        review: {
          comment: review.comment,
          rating: review.rating,
          createdAt: review.createdAt.toISOString(),
        },
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: MESSAGES.FAILED_TO_ADD_REVIEW,
      };
    }
  }

  async getAllReviews({
    search,
    sort,
    page,
    limit,
  }: {
    search: string;
    sort: string;
    page: number;
    limit: number;
  }): Promise<{
    success: boolean;
    message: string;
    reviews: responseReview[];
    total: number;
  }> {
    try {
      const skip = (page - 1) * limit;

      const allowedSorts = ['latest', 'oldest', 'rating_high', 'rating_low'];
      const safeSort = allowedSorts.includes(sort) ? sort : 'latest';

      const { data, total } = await this.reviewRepo.getAllReviews({
        search,
        sort: safeSort as ReviewSortType,
        skip,
        limit,
      });

      return {
        success: true,
        message: MESSAGES.REVIEWS_FETCHED_SUCCESSFULLY,
        reviews: data,
        total,
      };
    } catch (error) {
      console.error('Service Error:', error);
      throw error; // let controller handle response
    }
  }
}
