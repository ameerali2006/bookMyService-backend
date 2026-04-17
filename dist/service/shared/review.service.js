"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewService = void 0;
const tsyringe_1 = require("tsyringe");
const types_1 = require("../../config/constants/types");
let ReviewService = class ReviewService {
    constructor(reviewRepo, bookingRepo, notification) {
        this.reviewRepo = reviewRepo;
        this.bookingRepo = bookingRepo;
        this.notification = notification;
    }
    addReview(comment, rating, bookingId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // 1. check booking exists
                const booking = yield this.bookingRepo.findById(bookingId);
                if (!booking) {
                    return {
                        success: false,
                        message: 'Booking not found',
                    };
                }
                // 2. check ownership
                if (booking.userId.toString() !== userId) {
                    return {
                        success: false,
                        message: 'Unauthorized',
                    };
                }
                // 3. check completed
                if (booking.status !== 'completed') {
                    return {
                        success: false,
                        message: 'You can only review completed bookings',
                    };
                }
                // 4. check already reviewed
                const existingReview = yield this.reviewRepo.findByBookingId(bookingId);
                if (existingReview) {
                    return {
                        success: false,
                        message: 'Review already submitted',
                    };
                }
                // 5. create review
                const review = yield this.reviewRepo.create({
                    bookingId,
                    userId,
                    workerId: booking.workerId,
                    comment,
                    rating,
                });
                if (!review) {
                    return {
                        success: false,
                        message: 'Review already submitted',
                    };
                }
                // optional: update booking flag
                yield this.bookingRepo.updateById(bookingId, {
                    reviewId: review._id,
                });
                yield this.notification.createNotification({
                    title: 'new Review Add',
                    message: `user give ${rating} star for your work`,
                    type: 'booking',
                    workerId: booking.workerId.toString(),
                });
                return {
                    success: true,
                    message: 'Review added successfully',
                    review: {
                        comment: review.comment,
                        rating: review.rating,
                        createdAt: review.createdAt.toISOString(),
                    },
                };
            }
            catch (error) {
                console.error(error);
                return {
                    success: false,
                    message: 'Failed to add review',
                };
            }
        });
    }
    getAllReviews(_a) {
        return __awaiter(this, arguments, void 0, function* ({ search, sort, page, limit, }) {
            try {
                const skip = (page - 1) * limit;
                const allowedSorts = ['latest', 'oldest', 'rating_high', 'rating_low'];
                const safeSort = allowedSorts.includes(sort) ? sort : 'latest';
                const { data, total } = yield this.reviewRepo.getAllReviews({
                    search,
                    sort: safeSort,
                    skip,
                    limit,
                });
                return {
                    success: true,
                    message: 'Reviews fetched successfully',
                    reviews: data,
                    total,
                };
            }
            catch (error) {
                console.error('Service Error:', error);
                throw error; // let controller handle response
            }
        });
    }
};
exports.ReviewService = ReviewService;
exports.ReviewService = ReviewService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(types_1.TYPES.ReviewRepository)),
    __param(1, (0, tsyringe_1.inject)(types_1.TYPES.BookingRepository)),
    __param(2, (0, tsyringe_1.inject)(types_1.TYPES.NotificationService)),
    __metadata("design:paramtypes", [Object, Object, Object])
], ReviewService);
