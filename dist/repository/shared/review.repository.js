"use strict";
// repository/review.repository.ts
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
exports.ReviewRepository = void 0;
const mongoose_1 = require("mongoose");
const base_repository_1 = require("./base.repository");
const review_model_1 = require("../../model/review.model");
class ReviewRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(review_model_1.Review);
    }
    findByBookingId(bookingId) {
        return __awaiter(this, void 0, void 0, function* () {
            return review_model_1.Review.findOne({
                bookingId: new mongoose_1.Types.ObjectId(bookingId),
            });
        });
    }
    findByWorkerId(workerId, page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const skip = (page - 1) * limit;
            return review_model_1.Review.find({
                workerId: new mongoose_1.Types.ObjectId(workerId),
                isVisible: true,
            })
                .populate('userId', 'name profileImage')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);
        });
    }
    getWorkerRatingStats(workerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield review_model_1.Review.aggregate([
                {
                    $match: {
                        workerId: new mongoose_1.Types.ObjectId(workerId),
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
        });
    }
    getRecentReviewsByWorker(workerId) {
        return __awaiter(this, void 0, void 0, function* () {
            return review_model_1.Review.aggregate([
                {
                    $match: {
                        workerId: new mongoose_1.Types.ObjectId(workerId),
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
        });
    }
    getWorkerRatingSummary(workerId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const result = yield review_model_1.Review.aggregate([
                {
                    $match: {
                        workerId: new mongoose_1.Types.ObjectId(workerId),
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
                avgRating: ((_a = result[0]) === null || _a === void 0 ? void 0 : _a.avgRating) || 0,
                totalReviews: ((_b = result[0]) === null || _b === void 0 ? void 0 : _b.totalReviews) || 0,
            };
        });
    }
    getAllReviews(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { search, sort, skip, limit, } = query;
            // ✅ Typed filter
            const filter = {};
            if (search) {
                filter.$or = [
                    { comment: { $regex: search, $options: 'i' } },
                ];
            }
            const sortOption = this.buildSort(sort);
            const [reviews, total] = yield Promise.all([
                review_model_1.Review.find(filter)
                    .populate('userId', 'name')
                    .populate('workerId', 'name')
                    .sort(sortOption)
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                review_model_1.Review.countDocuments(filter),
            ]);
            const mapped = reviews.map((review) => ({
                _id: review._id.toString(),
                bookingId: review.bookingId.toString(),
                workerName: typeof review.workerId === 'object' && review.workerId !== null
                    ? review.workerId.name
                    : undefined,
                userName: typeof review.userId === 'object' && review.userId !== null
                    ? review.userId.name
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
        });
    }
    // ✅ Separate method (clean + reusable)
    buildSort(sort) {
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
exports.ReviewRepository = ReviewRepository;
