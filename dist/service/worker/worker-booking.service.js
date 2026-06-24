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
exports.WorkerBookingService = void 0;
const tsyringe_1 = require("tsyringe");
const types_1 = require("../../config/constants/types");
const time_Intervals_1 = require("../../utils/time&Intervals");
const worker_mapper_1 = require("../../utils/mapper/worker-mapper");
const message_1 = require("../../config/constants/message");
const status_code_1 = require("../../config/constants/status-code");
let WorkerBookingService = class WorkerBookingService {
    constructor(bookingRepo, walletService, userRepo, emailService, workerHelper, _hash, notification) {
        this.bookingRepo = bookingRepo;
        this.walletService = walletService;
        this.userRepo = userRepo;
        this.emailService = emailService;
        this.workerHelper = workerHelper;
        this._hash = _hash;
        this.notification = notification;
    }
    approveService(data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { bookingId, durationHours, distance, additionalItems, additionalNotes, } = data;
                console.log(data);
                const booking = yield this.bookingRepo.findByIdPopulated(bookingId);
                if (!booking) {
                    return { success: false, message: message_1.MESSAGES.BOOKING_NOT_FOUND };
                }
                if (!booking.startTime) {
                    return {
                        success: false,
                        message: 'Start time missing. User has not selected service time yet.',
                    };
                }
                const endTime = (0, time_Intervals_1.addDurationToTime)(booking.startTime, durationHours);
                if (!(0, time_Intervals_1.isTimeGreater)(endTime, booking.startTime)) {
                    return {
                        success: false,
                        message: message_1.MESSAGES.END_TIME_MUST_BE_GREATER_THAN_START_TIME,
                    };
                }
                const workerBooking = yield this.bookingRepo.findByWorkerAndDate(booking.workerId._id.toString(), booking.date);
                console.log(booking);
                console.log(workerBooking);
                const conflict = workerBooking.some((b) => {
                    if (b.endTime) {
                        return (0, time_Intervals_1.doTimesOverlap)(b.startTime, b.endTime, booking.startTime, endTime);
                    }
                });
                console.log(conflict);
                if (conflict) {
                    return {
                        success: false,
                        message: message_1.MESSAGES.TIME_CONFLICT_WITH_ANOTHER_APPROVED_BOOK,
                    };
                }
                if (additionalItems === null || additionalItems === void 0 ? void 0 : additionalItems.length) {
                    for (const item of additionalItems) {
                        if (!item.name || typeof item.price !== 'number') {
                            return { success: false, message: message_1.MESSAGES.INVALID_ADDITIONAL_ITEM };
                        }
                    }
                }
                const perKmRate = 10;
                const platformFee = 20;
                const paymentBreakdown = [];
                paymentBreakdown.push({
                    title: 'Service Duration Charge',
                    rate: booking.workerId.fees,
                    rateLabel: `₹${booking.workerId.fees} per hour`,
                    quantity: durationHours,
                    total: durationHours * booking.workerId.fees,
                });
                paymentBreakdown.push({
                    title: 'Travel Cost',
                    rate: perKmRate,
                    rateLabel: `₹${perKmRate} per km`,
                    quantity: distance,
                    total: distance * perKmRate,
                });
                let additionalTotal = 0;
                if (additionalItems === null || additionalItems === void 0 ? void 0 : additionalItems.length) {
                    additionalItems.forEach((item) => {
                        additionalTotal += item.price;
                        paymentBreakdown.push({
                            title: item.name,
                            rate: item.price,
                            rateLabel: `₹${item.price} per item`,
                            quantity: 1,
                            total: item.price,
                        });
                    });
                }
                paymentBreakdown.push({
                    title: 'Platform Fee',
                    rate: platformFee,
                    rateLabel: 'Fixed Fee',
                    quantity: 1,
                    total: platformFee,
                });
                const totalAmount = paymentBreakdown.reduce((sum, item) => sum + item.total, 0);
                const remainingAmount = totalAmount - booking.advanceAmount;
                const description = `${(_a = booking.description) !== null && _a !== void 0 ? _a : ''}\nWorker Response: ${additionalNotes !== null && additionalNotes !== void 0 ? additionalNotes : ''}`;
                yield this.bookingRepo.updateById(bookingId, {
                    endTime,
                    additionalItems: additionalItems || [],
                    description,
                    workerResponse: 'accepted',
                    paymentBreakdown,
                    totalAmount,
                    remainingAmount,
                });
                yield this.notification.createNotification({
                    title: 'booking Approve',
                    message: message_1.MESSAGES.WORKER_APPROVED_YOUR_BOOKING,
                    type: 'booking',
                    userId: booking.userId._id.toString(),
                    bookingId: bookingId
                });
                return { success: true, message: message_1.MESSAGES.SERVICE_APPROVED_SUCCESSFULLY };
            }
            catch (error) {
                console.error(error);
                return { success: false, message: message_1.MESSAGES.INTERNAL_SERVER_ERROR };
            }
        });
    }
    rejectService(bookingId, description) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const booking = yield this.bookingRepo.findById(bookingId);
                if (!booking) {
                    throw new Error(message_1.MESSAGES.BOOKING_NOT_FOUND);
                }
                if (booking.workerResponse === 'rejected') {
                    throw new Error(message_1.MESSAGES.ALREADY_REJECTED);
                }
                let refundAmount = 0;
                const updateBooking = {
                    status: 'cancelled',
                    workerResponse: 'rejected',
                    description,
                };
                if (booking.advanceAmount > 0
                    && booking.advancePaymentStatus === 'paid') {
                    refundAmount = booking.advanceAmount;
                    const wallet = yield this.walletService.addBalance({
                        userId: booking.userId,
                        amount: refundAmount,
                        role: 'user',
                        description: `Refund for rejected service (${booking.serviceId})`,
                    });
                    if (!wallet)
                        return { success: false, message: message_1.MESSAGES.USER_WALLET_ERROR };
                    updateBooking.advancePaymentStatus = 'refunded';
                }
                const updatedBooking = yield this.bookingRepo.updateById(bookingId, updateBooking);
                if (!updatedBooking) {
                    return { success: false, message: message_1.MESSAGES.USER_BOOKING_UPDATION_FAILED };
                }
                const user = yield this.userRepo.findById(booking.userId);
                if (user && user.email) {
                    yield this.emailService.sendServiceRejectedEmail({
                        email: user.email,
                        userName: user.name,
                        serviceName: booking.serviceId.toString(),
                        reason: description,
                        refundAmount,
                    });
                }
                yield this.notification.createNotification({
                    title: 'booking rejected',
                    message: message_1.MESSAGES.WORKER_REJECTED_YOUR_BOOKING,
                    type: 'booking',
                    userId: booking.userId.toString(),
                    bookingId,
                });
                return {
                    success: true,
                    message: message_1.MESSAGES.SERVICE_REJECTED_SUCCESSFULLY,
                };
            }
            catch (error) {
                return {
                    success: false,
                    message: message_1.MESSAGES.SOMETHING_WENT_WRONG,
                };
            }
        });
    }
    getServiceRequests(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(filter);
                const { data: bookings, total } = yield this.bookingRepo.findServiceRequests(filter);
                console.log(bookings);
                const mapped = worker_mapper_1.WorkerMapper.mapServiceRequest(bookings);
                const finalMapped = yield Promise.all(mapped.map((req, index) => __awaiter(this, void 0, void 0, function* () {
                    var _a;
                    const b = bookings[index];
                    const nextAvailable = yield this.workerHelper.getWorkerAvailableTime(b.workerId._id.toString(), b.date, b.startTime);
                    return Object.assign(Object.assign({}, req), { availableTime: (_a = nextAvailable.availableTime) !== null && _a !== void 0 ? _a : '0.00' });
                })));
                console.log(finalMapped);
                return {
                    success: true,
                    message: message_1.MESSAGES.REQUESTS_FETCHED_SUCCESSFULLY,
                    data: {
                        data: finalMapped,
                        page: filter.page,
                        total,
                    },
                };
            }
            catch (error) {
                console.log(error);
                return {
                    success: false,
                    message: message_1.MESSAGES.INTERNAL_ERROR,
                };
            }
        });
    }
    getWorkerApprovedBookings(query) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { workerId, page = 1, limit = 10, search = '', status, } = query;
                console.log(query);
                if (!workerId) {
                    return {
                        success: false,
                        message: message_1.MESSAGES.WORKER_DATA_NOT_FONT,
                    };
                }
                status === 'approved' ? 'confirmed' : status;
                const { items, total } = yield this.bookingRepo.findWorkerApprovedBookings({
                    workerId,
                    limit,
                    page,
                    search,
                    status,
                });
                console.log({ items, total });
                if (!items) {
                    return {
                        success: false,
                        message: message_1.MESSAGES.DATA_NOT_FOUNT,
                    };
                }
                const normalizeDate = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
                const today = normalizeDate(new Date());
                const todayBookings = [];
                const upcomingBookings = [];
                for (const b of items) {
                    const bookingDate = normalizeDate(new Date(b.date));
                    const mapped = worker_mapper_1.WorkerMapper.ApprovedService(b);
                    if (bookingDate.getTime() === today.getTime()) {
                        todayBookings.push(mapped);
                    }
                    else if (bookingDate.getTime() > today.getTime()) {
                        upcomingBookings.push(mapped);
                    }
                }
                return {
                    success: true,
                    message: message_1.MESSAGES.DATA_FETCH_SUCCESSFULLY,
                    today: todayBookings,
                    upcoming: upcomingBookings,
                    pagination: {
                        page: query.page,
                        limit: query.limit,
                        total,
                        totalPages: Math.ceil(total / query.limit),
                    },
                };
            }
            catch (error) {
                console.log(error);
                return {
                    success: false,
                    message: message_1.MESSAGES.BAD_REQUEST,
                };
            }
        });
    }
    getWorkerAprrovalpageDetails(bookingId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!bookingId) {
                    return {
                        success: false,
                        message: message_1.MESSAGES.BOOKING_DATA_MISSING,
                    };
                }
                const booking = yield this.bookingRepo.findByIdPopulated(bookingId);
                if (!booking) {
                    return {
                        success: false,
                        message: message_1.MESSAGES.BOOKING_DATA_NOT_FOUNT,
                    };
                }
                const verification = Boolean(booking.otp);
                return {
                    success: true,
                    message: message_1.MESSAGES.DATA_FETCH_SUCCESS,
                    booking: Object.assign(Object.assign({}, booking.toObject()), { verification }),
                };
            }
            catch (error) {
                return {
                    success: false,
                    message: message_1.MESSAGES.INTERNAL_EROR,
                };
            }
        });
    }
    reachedCustomerLocation(bookingid) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (!bookingid) {
                    return {
                        success: false,
                        message: message_1.MESSAGES.BOOKING_DEATAILS_IS_NOT_FOUNT,
                    };
                }
                const otp = Math.floor(1000 + Math.random() * 9000).toString();
                const updateBooking = this.bookingRepo.updateById(bookingid, { otp });
                if (!updateBooking) {
                    return {
                        success: false,
                        message: message_1.MESSAGES.BOOKING_DETAILS_IS_NOT_FOUNT,
                    };
                }
                const booking = yield this.getWorkerAprrovalpageDetails(bookingid);
                if (!booking.success && !booking.booking) {
                    return {
                        success: false,
                        message: message_1.MESSAGES.BOOKING_DETAILS_IS_NOT_FOUNT,
                    };
                }
                yield this.notification.createNotification({
                    title: 'worker reached',
                    message: message_1.MESSAGES.WORKER_REACHED_TO_YOUR_LOCATION,
                    type: 'booking',
                    userId: (_a = booking.booking) === null || _a === void 0 ? void 0 : _a.userId._id.toString(),
                    bookingId: bookingid,
                });
                return {
                    success: true,
                    message: message_1.MESSAGES.SUCCESSFULLY_GENERATED_OTP,
                    booking: booking.booking,
                };
            }
            catch (error) {
                console.log(error);
                return {
                    success: false,
                    message: message_1.MESSAGES.INTERNAL_ERROR,
                };
            }
        });
    }
    verifyWorker(bookingId, otp) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!bookingId) {
                    return {
                        success: false,
                        message: message_1.MESSAGES.BOOKING_DETAIL_MISSING,
                    };
                }
                if (!otp) {
                    return {
                        success: true,
                        message: message_1.MESSAGES.VALIDATION_NOT_FOUNT,
                    };
                }
                const booking = yield this.bookingRepo.findById(bookingId);
                console.log(booking);
                if (!booking) {
                    return {
                        success: false,
                        message: message_1.MESSAGES.BOOKING_DETAIL_MISSING,
                    };
                }
                if (booking.otp != otp) {
                    return {
                        success: false,
                        message: message_1.MESSAGES.WORKER_VARIFICATION_FAILED,
                    };
                }
                const updatebooking = yield this.bookingRepo.updateStatusWithOTP(bookingId, 'in-progress');
                if (!updatebooking) {
                    return {
                        success: false,
                        message: message_1.MESSAGES.WORKER_VARIFICATION_FAILED,
                    };
                }
                yield this.notification.createNotification({
                    title: 'worker verified',
                    message: message_1.MESSAGES.WORKER_SUCCESSFULLY_VERIFIED,
                    type: 'booking',
                    userId: booking.userId.toString(),
                    bookingId,
                });
                return {
                    success: true,
                    message: message_1.MESSAGES.WORKER_SUCCESSFULLY_VERIFIED,
                };
            }
            catch (error) {
                console.error(error);
                return {
                    success: false,
                    message: message_1.MESSAGES.INTERNAL_ERROR,
                };
            }
        });
    }
    workerComplateWork(bookingId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!bookingId) {
                    return {
                        status: status_code_1.STATUS_CODES.BAD_REQUEST,
                        success: false,
                        message: message_1.MESSAGES.BOOKING_ID_IS_NOT_FOUNT,
                    };
                }
                const updateBooking = yield this.bookingRepo.updateStatus(bookingId, 'awaiting-final-payment');
                if (!updateBooking) {
                    return {
                        status: status_code_1.STATUS_CODES.BAD_REQUEST,
                        success: false,
                        message: message_1.MESSAGES.BOOKING_UPDATETION_FAILED,
                    };
                }
                const booking = yield this.bookingRepo.findByIdPopulated(bookingId);
                if (!booking) {
                    return {
                        status: status_code_1.STATUS_CODES.BAD_REQUEST,
                        success: false,
                        message: message_1.MESSAGES.BOOKING_IS_NOT_FOUNT,
                    };
                }
                yield this.notification.createNotification({
                    title: ' work complated',
                    message: message_1.MESSAGES.WORK_IS_COMPLATE,
                    type: 'booking',
                    userId: booking.userId._id.toString(),
                    bookingId,
                });
                return {
                    status: status_code_1.STATUS_CODES.OK,
                    success: true,
                    message: message_1.MESSAGES.SUCCESSFULLY_UPDATED,
                    booking: Object.assign(Object.assign({}, booking.toObject()), { verification: false }),
                };
            }
            catch (error) {
                return {
                    status: status_code_1.STATUS_CODES.NOT_FOUND,
                    success: false,
                    message: message_1.MESSAGES.BOOKING_IS_NOT_FOUNT,
                };
            }
        });
    }
    getWorkerBookings(workerId, query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { page, limit, search, workerResponses, statuses, from, to, } = query;
            const { items, total } = yield this.bookingRepo.allBookingList({
                workerId,
                page,
                limit,
                search,
                statuses: Array.isArray(statuses)
                    ? statuses
                    : statuses
                        ? [statuses]
                        : undefined,
                workerResponses,
                from: from ? new Date(from) : undefined,
                to: to ? new Date(to) : undefined,
            });
            return {
                success: true,
                message: message_1.MESSAGES.SUCCESSFULLY_FETCH_DATA,
                data: {
                    bookings: items.map(worker_mapper_1.WorkerMapper.toAllWorkerBookingDto),
                    total,
                    page,
                    limit,
                },
            };
        });
    }
};
exports.WorkerBookingService = WorkerBookingService;
exports.WorkerBookingService = WorkerBookingService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(types_1.TYPES.BookingRepository)),
    __param(1, (0, tsyringe_1.inject)(types_1.TYPES.WalletService)),
    __param(2, (0, tsyringe_1.inject)(types_1.TYPES.AuthUserRepository)),
    __param(3, (0, tsyringe_1.inject)(types_1.TYPES.EmailService)),
    __param(4, (0, tsyringe_1.inject)(types_1.TYPES.WorkerHelperService)),
    __param(5, (0, tsyringe_1.inject)(types_1.TYPES.PasswordService)),
    __param(6, (0, tsyringe_1.inject)(types_1.TYPES.NotificationService)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object])
], WorkerBookingService);
