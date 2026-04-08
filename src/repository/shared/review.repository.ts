// repository/review.repository.ts

import { FilterQuery, Types, SortOrder } from 'mongoose';

import { IReview } from '../../interface/model/review.model.interface';
import { IReviewRepository } from '../../interface/repository/review.repository.interface';
import { BaseRepository } from './base.repository';
import { Review } from '../../model/review.model';
import { IReviewResponse } from '../../dto/user/worker-listing-home.dto';
import { responseReview } from '../../dto/shared/review.dto';

export type ReviewSortType =
  | 'latest'
  | 'oldest'
  | 'rating_high'
  | 'rating_low';

export interface GetAllReviewsRepoQuery {
  search: string;
  sort: ReviewSortType;
  skip: number;
  limit: number;
}

export interface GetAllReviewsRepoResponse {
  data: responseReview[];
  total: number;
}
export class ReviewRepository
  extends BaseRepository<IReview>
  implements IReviewRepository {
  constructor() {
    super(Review);
  }

  async findByBookingId(bookingId: string): Promise<IReview | null> {
    return Review.findOne({
      bookingId: new Types.ObjectId(bookingId),
    });
  }

  async findByWorkerId(
    workerId: string,
    page: number,
    limit: number,
  ): Promise<IReview[]> {
    const skip = (page - 1) * limit;

    return Review.find({
      workerId: new Types.ObjectId(workerId),
      isVisible: true,
    })
      .populate('userId', 'name profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  }

  async getWorkerRatingStats(workerId: string): Promise<{
    averageRating: number;
    totalReviews: number;
  }> {
    const result = await Review.aggregate([
      {
        $match: {
          workerId: new Types.ObjectId(workerId),
          isVisible: true,
        },
      },
      {
        $group: {
          _id: '$workerId',
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    if (!result.length) {
      return {
        averageRating: 0,
        totalReviews: 0,
      };
    }

    return {
      averageRating: Number(result[0].averageRating.toFixed(1)),
      totalReviews: result[0].totalReviews,
    };
  }

  async getRecentReviewsByWorker(workerId: string): Promise<IReviewResponse[]> {
    return Review.aggregate([
      {
        $match: {
          workerId: new Types.ObjectId(workerId),
          isVisible: true,
        },
      },

      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },

      { $unwind: '$user' },

      {
        $project: {
          rating: 1,
          comment: 1,
          createdAt: 1,
          userName: '$user.name',
        },
      },

      { $sort: { createdAt: -1 } },

      { $limit: 5 },
    ]);
  }

  async getWorkerRatingSummary(workerId: string) :Promise<{avgRating:number, totalReviews:number}> {
    const result = await Review.aggregate([
      {
        $match: {
          workerId: new Types.ObjectId(workerId),
          isVisible: true,
        },
      },

      {
        $group: {
          _id: '$workerId',
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    return {
      avgRating: result[0]?.avgRating || 0,
      totalReviews: result[0]?.totalReviews || 0,
    };
  }

  async getAllReviews(
    query: GetAllReviewsRepoQuery,
  ): Promise<GetAllReviewsRepoResponse> {
    const {
      search, sort, skip, limit,
    } = query;

    // ✅ Typed filter
    const filter: FilterQuery<typeof Review.schema.obj> = {};

    if (search) {
      filter.$or = [
        { comment: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOption: Record<string, SortOrder> = this.buildSort(sort);

    const [reviews, total] = await Promise.all([
      Review.find(filter)
        .populate('userId', 'name')
        .populate('workerId', 'name')
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean(),

      Review.countDocuments(filter),
    ]);

    const mapped: responseReview[] = reviews.map((review) => ({
      _id: review._id.toString(),
      bookingId: review.bookingId.toString(),
      workerName:
        typeof review.workerId === 'object' && review.workerId !== null
          ? (review.workerId as { name?: string }).name
          : undefined,
      userName:
        typeof review.userId === 'object' && review.userId !== null
          ? (review.userId as { name?: string }).name
          : undefined,
      rating: review.rating,
      comment: review.comment,
      isVisible: review.isVisible,
      createdAt: review.createdAt.toISOString(),
    }));

    return {
      data: mapped,
      total,
    };
  }

  // ✅ Separate method (clean + reusable)
  private buildSort(sort: ReviewSortType): Record<string, SortOrder> {
    switch (sort) {
      case 'latest':
        return { createdAt: -1 };
      case 'oldest':
        return { createdAt: 1 };
      case 'rating_high':
        return { rating: -1 };
      case 'rating_low':
        return { rating: 1 };
      default:
        return { createdAt: -1 };
    }
  }
}
