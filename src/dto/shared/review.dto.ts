export interface responseReview {
  _id: string;
  bookingId: string;
  workerName?: string;
  userName?: string;
  rating: number;
  comment: string;
  isVisible?: boolean;
  createdAt: string;
}
