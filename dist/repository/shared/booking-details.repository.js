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
exports.BookingRepository = void 0;
// src/repository/implementation/booking.repository.ts
const tsyringe_1 = require("tsyringe");
const mongoose_1 = require("mongoose");
const base_repository_1 = require("./base.repository");
const booking_model_1 = require("../../model/booking.model");
let BookingRepository = class BookingRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(booking_model_1.Booking);
    }
    createBooking(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield booking_model_1.Booking.create(data);
        });
    }
    findByIdPopulated(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield booking_model_1.Booking.findById(id)
                .populate('userId', 'name email phone ')
                .populate('workerId', 'name email phone category fees')
                .populate('serviceId', 'category price')
                .populate('address')
                .populate('reviewId')
                .exec();
            return result;
        });
    }
    findByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield booking_model_1.Booking.find({ userId })
                .sort({ createdAt: -1 })
                .populate('workerId', 'name category')
                .populate('serviceId', 'category price')
                .populate('address')
                .exec();
            return result;
        });
    }
    findByWorkerId(workerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield booking_model_1.Booking.find({ workerId })
                .sort({ createdAt: -1 })
                .populate('userId', 'name email phone')
                .populate('serviceId', 'category price')
                .populate('address')
                .exec();
            return result;
        });
    }
    updateStatus(id, status) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield booking_model_1.Booking.findByIdAndUpdate(id, { status }, { new: true });
        });
    }
    updateWorkerResponse(id, response) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield booking_model_1.Booking.findByIdAndUpdate(id, { workerResponse: response }, { new: true });
        });
    }
    updateStatusWithOTP(id, status) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield booking_model_1.Booking.findByIdAndUpdate(id, { status, $unset: { otp: '' } }, { new: true });
        });
    }
    updatePaymentStatus(id, paymentStatus, paymentId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield booking_model_1.Booking.findByIdAndUpdate(id, { paymentStatus, paymentId }, { new: true });
        });
    }
    addRating(id, score, review) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield booking_model_1.Booking.findByIdAndUpdate(id, { rating: { score, review }, status: 'completed' }, { new: true });
        });
    }
    cancelBooking(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield booking_model_1.Booking.findByIdAndUpdate(id, { status: 'cancelled' }, { new: true });
        });
    }
    findByWorkerAndDate(workerId, date) {
        return __awaiter(this, void 0, void 0, function* () {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            return yield booking_model_1.Booking.find({
                workerId,
                date: { $gte: startOfDay, $lte: endOfDay },
                status: { $ne: 'cancelled' },
            })
                .select('startTime endTime date status')
                .lean();
        });
    }
    findBookingWithinTimeRange(workerId, date, startTime, endTime) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield booking_model_1.Booking.findOne({
                workerId,
                date: {
                    $eq: new Date(new Date(date).toDateString()),
                },
                startTime: { $lt: endTime },
                endTime: { $gt: startTime },
                status: { $nin: ['cancelled', 'completed'] },
            });
        });
    }
    findByIdWithDetails(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield booking_model_1.Booking.findById(id)
                .populate('workerId', 'name')
                .populate('serviceId', 'category')
                .populate('userId', 'name');
        });
    }
    findByWorkerAndRange(workerId, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function* () {
            return booking_model_1.Booking.find({
                workerId,
                date: { $gte: startDate, $lt: endDate },
                status: { $ne: 'cancelled' },
            }, {
                date: 1,
                startTime: 1,
                endTime: 1,
                advancePaymentStatus: 1,
                _id: 0,
            })
                .sort({ date: 1, startTime: 1 })
                .lean();
        });
    }
    updateAdvancePaymentStatus(bookingId, paymentIntentId, status, addressId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield booking_model_1.Booking.findByIdAndUpdate(bookingId, {
                advancePaymentId: paymentIntentId,
                advancePaymentStatus: status === 'succeeded' ? 'paid' : status,
                status: status === 'succeeded' ? 'confirmed' : 'pending',
                address: addressId,
                totalAmount: 100
            });
        });
    }
    updateFinalPaymentStatus(bookingId, paymentIntentId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield booking_model_1.Booking.findByIdAndUpdate(bookingId, {
                finalPaymentId: paymentIntentId,
                finalPaymentStatus: status === 'succeeded' ? 'paid' : status,
                status: status === 'succeeded' ? 'completed' : 'awaiting-final-payment',
                remainingAmount: status === 'succeeded' ? 0 : undefined,
            });
        });
    }
    findPendingAdvanceBookings(workerId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield booking_model_1.Booking.find({
                workerId,
                advancePaymentStatus: 'succeeded',
                workerResponse: 'pending',
            }).populate('userId serviceId workerId');
        });
    }
    findUnsettledCompleted() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield booking_model_1.Booking.find({
                status: 'completed',
                finalPaymentStatus: 'paid',
                $or: [{ isSettled: false }, { isSettled: { $exists: false } }],
            });
        });
    }
    markAsSettled(ids) {
        return __awaiter(this, void 0, void 0, function* () {
            const objectIds = ids.map((id) => new mongoose_1.Types.ObjectId(id));
            yield booking_model_1.Booking.updateMany({ _id: { $in: objectIds } }, {
                $set: {
                    isSettled: true,
                    updatedAt: new Date(),
                },
            });
        });
    }
    findServiceRequests(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            const { workerId, search, status, page, limit, } = filters;
            // ✅ Start of today (00:00)
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const query = {
                workerId,
                date: { $gte: todayStart }, // ✅ only upcoming from today
            };
            if (status)
                query.workerResponse = status;
            if (search) {
                query.$or = [{ 'userId.name': { $regex: search, $options: 'i' } }];
            }
            const skip = (page - 1) * limit;
            const booking = yield booking_model_1.Booking.find(query)
                .populate('userId', 'name phone')
                .populate('serviceId', 'category')
                .populate('workerId', 'name')
                .populate('address')
                .sort({ date: 1 }) // ✅ nearest upcoming first
                .skip(skip)
                .limit(limit)
                .lean()
                .exec();
            const total = yield booking_model_1.Booking.countDocuments(query);
            return { data: booking, total };
        });
    }
    findBookingListByUserId(userId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, status = [], workerResponse = [], limit, skip, search) {
            const query = {};
            query.userId = userId;
            if (status.length > 0) {
                query.status = { $in: status };
            }
            if (workerResponse.length) {
                query.workerResponse = { $in: workerResponse };
            }
            if (search && search.trim() !== '') {
                query.$or = [
                    { 'serviceId.category': { $regex: search, $options: 'i' } },
                    { 'workerId.name': { $regex: search, $options: 'i' } },
                ];
            }
            console.log(query);
            const total = yield booking_model_1.Booking.countDocuments(query);
            const bookings = yield booking_model_1.Booking.find(query)
                .populate('workerId')
                .populate('serviceId')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 })
                .lean();
            console.log({ bookings, total });
            return { bookings, total };
        });
    }
    findWorkerApprovedBookings(_a) {
        return __awaiter(this, arguments, void 0, function* ({ workerId, page, limit, search, status, }) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const query = {
                workerId,
                workerResponse: 'accepted',
                status: status || {
                    $in: ['confirmed', 'in-progress', 'awaiting-final-payment'],
                },
                date: { $gte: today }, // 🔥 KEY FIX
            };
            if (search) {
                query.$or = [{ bookingId: { $regex: search, $options: 'i' } }];
            }
            const skip = (page - 1) * limit;
            const [items, total] = yield Promise.all([
                booking_model_1.Booking.find(query)
                    .populate('userId', 'name')
                    .populate('serviceId', 'name')
                    .sort({ date: 1, startTime: 1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                booking_model_1.Booking.countDocuments(query),
            ]);
            return { items, total };
        });
    }
    getAllBookings(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { search, status, page = 1, limit = 10, } = params;
            const query = {};
            if (status && status !== 'all') {
                query.status = status;
            }
            if (search) {
                query.$or = [
                    { _id: search }, // booking id search
                    { 'userId.name': { $regex: search, $options: 'i' } },
                    { 'workerId.name': { $regex: search, $options: 'i' } },
                    { 'serviceId.category': { $regex: search, $options: 'i' } },
                ];
            }
            const skip = (page - 1) * limit;
            const [data, total] = yield Promise.all([
                booking_model_1.Booking.find(query)
                    .populate('userId')
                    .populate('workerId')
                    .populate('serviceId')
                    .populate('address')
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                booking_model_1.Booking.countDocuments(query),
            ]);
            return {
                data,
                total,
                page,
                limit,
            };
        });
    }
    allBookingList(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { workerId, page, limit, search, statuses, workerResponses, from, to, } = params;
            const query = {
                workerId,
            };
            if (search && search.trim() !== '') {
                query.$or = [
                    { 'userId.name': { $regex: search, $options: 'i' } },
                    { 'serviceId.category': { $regex: search, $options: 'i' } },
                    { 'address.city': { $regex: search, $options: 'i' } },
                    { 'address.street': { $regex: search, $options: 'i' } },
                    { 'address.buildingName': { $regex: search, $options: 'i' } },
                    { 'address.area': { $regex: search, $options: 'i' } },
                ];
            }
            if (statuses && statuses.length > 0) {
                query.status = { $in: statuses };
            }
            if (workerResponses && workerResponses.length > 0) {
                query.workerResponse = { $in: workerResponses };
            }
            if (from || to) {
                query.date = {};
                if (from) {
                    const start = new Date(from);
                    start.setHours(0, 0, 0, 0);
                    query.date.$gte = start;
                }
                if (to) {
                    const end = new Date(to);
                    end.setHours(23, 59, 59, 999);
                    query.date.$lte = end;
                }
            }
            const skip = (page - 1) * limit;
            console.log(query);
            const [items, total] = yield Promise.all([
                booking_model_1.Booking.find(query)
                    .populate('userId', 'name phone')
                    .populate('serviceId', 'category')
                    .populate('address')
                    .sort({ date: 1, startTime: 1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                booking_model_1.Booking.countDocuments(query),
            ]);
            console.log(items);
            return { items, total };
        });
    }
    getWorkerDashboardStats(workerId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const workerObjectId = new mongoose_1.Types.ObjectId(workerId);
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const todayEnd = new Date();
            todayEnd.setHours(23, 59, 59, 999);
            const monthStart = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);
            // 1️⃣ Total Jobs
            const totalJobs = yield booking_model_1.Booking.countDocuments({ workerId });
            // 2️⃣ Completed Jobs
            const completedJobs = yield booking_model_1.Booking.countDocuments({
                workerId,
                status: 'completed',
            });
            // 3️⃣ Monthly Earnings
            const monthlyEarningsAgg = yield booking_model_1.Booking.aggregate([
                {
                    $match: {
                        workerId: workerObjectId,
                        status: 'completed',
                        date: { $gte: monthStart },
                    },
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$totalAmount' },
                    },
                },
            ]);
            const monthlyEarnings = ((_a = monthlyEarningsAgg[0]) === null || _a === void 0 ? void 0 : _a.total) || 0;
            // 4️⃣ Upcoming Jobs
            const upcomingJobs = yield booking_model_1.Booking.countDocuments({
                workerId,
                status: { $in: ['confirmed', 'in-progress'] },
                date: { $gte: todayStart },
            });
            // 5️⃣ Rating Aggregation
            const ratingAgg = yield booking_model_1.Booking.aggregate([
                {
                    $match: {
                        workerId: workerObjectId,
                        'rating.score': { $exists: true },
                    },
                },
                {
                    $group: {
                        _id: null,
                        avgRating: { $avg: '$rating.score' },
                        totalReviews: { $sum: 1 },
                    },
                },
            ]);
            const avgRating = ((_b = ratingAgg[0]) === null || _b === void 0 ? void 0 : _b.avgRating) || 0;
            const totalReviews = ((_c = ratingAgg[0]) === null || _c === void 0 ? void 0 : _c.totalReviews) || 0;
            // 6️⃣ Today Schedule
            const todaySchedule = yield booking_model_1.Booking.find({
                workerId,
                date: { $gte: todayStart, $lte: todayEnd },
            })
                .populate('workerId')
                .populate('userId')
                .populate('serviceId')
                .populate('address')
                .lean();
            return {
                totalJobs,
                completedJobs,
                monthlyEarnings,
                upcomingJobs,
                avgRating,
                totalReviews,
                todaySchedule,
            };
        });
    }
    getDashboardRawData() {
        return __awaiter(this, void 0, void 0, function* () {
            const now = new Date();
            const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            return booking_model_1.Booking.aggregate([
                {
                    $facet: {
                        // 📊 Booking Stats
                        bookingStats: [
                            {
                                $group: {
                                    _id: null,
                                    totalBookings: { $sum: 1 },
                                    completedBookings: {
                                        $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
                                    },
                                    cancelledBookings: {
                                        $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] },
                                    },
                                },
                            },
                        ],
                        // 💰 Revenue
                        totalRevenue: [
                            {
                                $match: {
                                    status: 'completed',
                                    finalPaymentStatus: 'paid',
                                },
                            },
                            {
                                $group: {
                                    _id: null,
                                    revenue: { $sum: '$totalAmount' },
                                },
                            },
                        ],
                        // 📈 Monthly Revenue Chart (Last 6 Months)
                        revenueChart: [
                            {
                                $match: {
                                    status: 'completed',
                                    finalPaymentStatus: 'paid',
                                },
                            },
                            {
                                $group: {
                                    _id: {
                                        year: { $year: '$createdAt' },
                                        month: { $month: '$createdAt' },
                                    },
                                    revenue: { $sum: '$totalAmount' },
                                },
                            },
                            { $sort: { '_id.year': 1, '_id.month': 1 } },
                        ],
                        // 🥧 Service Distribution
                        serviceDistribution: [
                            {
                                $lookup: {
                                    from: 'services',
                                    localField: 'serviceId',
                                    foreignField: '_id',
                                    as: 'service',
                                },
                            },
                            { $unwind: '$service' },
                            {
                                $group: {
                                    _id: '$service.category',
                                    count: { $sum: 1 },
                                },
                            },
                            {
                                $project: {
                                    _id: 0,
                                    service: '$_id',
                                    count: 1,
                                },
                            },
                        ],
                        // 📅 Current Month
                        currentMonth: [
                            {
                                $match: { createdAt: { $gte: startOfCurrentMonth } },
                            },
                            { $count: 'count' },
                        ],
                        // 📅 Last Month
                        lastMonth: [
                            {
                                $match: {
                                    createdAt: {
                                        $gte: startOfLastMonth,
                                        $lt: startOfCurrentMonth,
                                    },
                                },
                            },
                            { $count: 'count' },
                        ],
                    },
                },
            ]);
        });
    }
};
exports.BookingRepository = BookingRepository;
exports.BookingRepository = BookingRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], BookingRepository);
