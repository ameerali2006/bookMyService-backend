export interface IWorkerRatingSummary {
  avgRating: number
  totalReviews: number
}
export interface IWorkerListItem {
  _id: string
  name: string
  experience: string
  description: string
  skills: string[]
  fees: number
  profileImage?: string
  zone: string
  distance: number

  avgRating: number
  totalReviews: number
}
export interface IReviewResponse {
  _id: string
  rating: number
  comment?: string
  createdAt: Date
  userName: string
}
export interface IWorkerProfileResponse extends IWorkerListItem {
  recentReviews: IReviewResponse[]
}
