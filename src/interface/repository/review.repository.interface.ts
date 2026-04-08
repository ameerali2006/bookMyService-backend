// interface/repository/review.repository.interface.ts

import { responseReview } from '../../dto/shared/review.dto';
import { IReviewResponse } from '../../dto/user/worker-listing-home.dto';
import { IReview } from '../model/review.model.interface';
import { IBaseRepository } from './base.repository.interface';

export interface IReviewRepository extends IBaseRepository<IReview> {
  findByBookingId(bookingId: string): Promise<IReview | null>;
  findByWorkerId(
    workerId: string,
    page: number,
    limit: number,
  ): Promise<IReview[]>;

  getWorkerRatingStats(workerId: string): Promise<{
    averageRating: number;
    totalReviews: number;
  }>;
  getRecentReviewsByWorker(workerId: string): Promise<IReviewResponse[]>;
  getWorkerRatingSummary(
    workerId: string,
  ): Promise<{ avgRating: number; totalReviews: number }>;
  getAllReviews(query: {
    search: string;
    sort: 'latest' | 'oldest' | 'rating_high' | 'rating_low';
    skip: number;
    limit: number;
  }): Promise<{ data: responseReview[]; total: number }>;
}
