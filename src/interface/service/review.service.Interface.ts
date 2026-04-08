import { responseReview } from '../../dto/shared/review.dto';

export interface IReviewService {
  addReview(
    comment: string,
    rating: number,
    bookingId: string,
    userId: string,
  ): Promise<{
    success: boolean;
    message: string;
    review?: { comment: string; rating: number; createdAt: string };
  }>;
  getAllReviews({
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
    }>
}
