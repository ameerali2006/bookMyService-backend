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
exports.BookingService = void 0;
const tsyringe_1 = require("tsyringe");
const types_1 = require("../../config/constants/types");
const message_1 = require("../../config/constants/message");
let BookingService = class BookingService {
    constructor(_bookingRepo, _workerRepo, _slotLockRepo, _emailService, notification) {
        this._bookingRepo = _bookingRepo;
        this._workerRepo = _workerRepo;
        this._slotLockRepo = _slotLockRepo;
        this._emailService = _emailService;
        this.notification = notification;
    }
    setBasicBookingDetails(userId, workerId, time, date, description) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!userId || !workerId) {
                    return {
                        success: false,
                        message: message_1.MESSAGES.USER_NOT_FOUND,
                        bookingId: null,
                    };
                }
                if (!time || !date || !description) {
                    return {
                        success: false,
                        message: message_1.MESSAGES.MISSING_REQUIRED_FIELDS_TIME_DATE_OR_DES,
                        bookingId: null,
                    };
                }
                if (isNaN(new Date(date).getTime())) {
                    return {
                        success: false,
                        message: message_1.MESSAGES.INVALID_DATE_FORMAT,
                        bookingId: null,
                    };
                }
                const workerData = yield this._workerRepo.findById(workerId);
                if (!workerData) {
                    return {
                        success: false,
                        message: message_1.MESSAGES.WORKER_IS_NOT_FOUND,
                        bookingId: null,
                    };
                }
                const bookingDate = new Date(date);
                const [h, m] = time.split(":").map(Number);
                bookingDate.setHours(h, m, 0, 0);
                const startTime = new Date(bookingDate);
                const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
                /* 🔐 TRY LOCK */
                const locked = yield this._slotLockRepo.acquireLock(workerId, date, startTime, endTime, userId);
                if (!locked) {
                    return {
                        success: false,
                        message: message_1.MESSAGES.SLOT_ALREADY_BOOKED_BY_ANOTHER_USER,
                        bookingId: null,
                    };
                }
                const newBooking = yield this._bookingRepo.create({
                    userId,
                    workerId,
                    serviceId: workerData.category,
                    date: bookingDate,
                    startTime: time,
                    description,
                    status: "pending",
                    advancePaymentStatus: "unpaid",
                });
                if (!newBooking) {
                    return {
                        success: false,
                        message: message_1.MESSAGES.FAILED_TO_CREATE_BOOKING,
                        bookingId: null,
                    };
                }
                return {
                    success: true,
                    message: message_1.MESSAGES.SLOT_LOCKED_FOR_10_MINUTES,
                    bookingId: newBooking._id.toString(),
                };
            }
            catch (error) {
                console.log(error);
                return {
                    success: false,
                    message: message_1.MESSAGES.INTERNAL_ERROR,
                    bookingId: null,
                };
            }
        });
    }
    getBookingDetails(bookingId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!bookingId) {
                    return {
                        success: false,
                        message: message_1.MESSAGES.BOOKING_DETAILS_NOT_FOUND,
                        details: null,
                    };
                }
                const booking = yield this._bookingRepo.findByIdWithDetails(bookingId);
                if (!booking) {
                    return {
                        success: false,
                        message: message_1.MESSAGES.BOOKING_DETAILS_NOT_FOUND,
                        details: null,
                    };
                }
                const worker = booking.workerId;
                const service = booking.serviceId;
                let time = `${Number(booking.startTime.split(":")[0]) % 12}:${booking.startTime.split(":")[1]} `;
                Number(booking.startTime.split(":")[0]) % 12 ==
                    Number(booking.startTime.split(":")[0])
                    ? (time += " AM")
                    : (time += " PM");
                const data = {
                    workerName: worker.name,
                    serviceName: service.category,
                    date: booking.date.toISOString().split("T")[0],
                    time,
                    description: booking.description,
                    advancePaymentStatus: booking.advancePaymentStatus,
                    advance: booking.advanceAmount,
                };
                return {
                    success: true,
                    message: message_1.MESSAGES.BOOKING_DETAILS_FOUND,
                    details: data,
                };
            }
            catch (error) {
                return {
                    success: false,
                    message: message_1.MESSAGES.INTERNAL_ERROR,
                    details: null,
                };
            }
        });
    }
    updateWorkerDetails(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { bookingId, workerId, endingTime, itemsRequired, additionalNotes, } = data;
                if (!bookingId || !workerId) {
                    return {
                        success: false,
                        message: message_1.MESSAGES.MISSING_BOOKINGID_OR_WORKERID,
                    };
                }
                // 🧠 Validate input
                if (!endingTime || !(itemsRequired === null || itemsRequired === void 0 ? void 0 : itemsRequired.length)) {
                    return {
                        success: false,
                        message: message_1.MESSAGES.ENDING_TIME_AND_REQUIRED_ITEMS_ARE_MANDA,
                    };
                }
                // 💾 Update the booking
                const updatedBooking = yield this._bookingRepo.updateById(bookingId, {
                    workerId,
                    endTime: endingTime,
                    additionalItems: itemsRequired,
                    description: additionalNotes,
                });
                if (!updatedBooking) {
                    return {
                        success: false,
                        message: message_1.MESSAGES.BOOKING_NOT_FOUND_OR_UNAUTHORIZED,
                    };
                }
                // 📨 Optional: Send confirmation email to the user
                const user = updatedBooking.userId;
                const worker = updatedBooking.workerId;
                // if (user?.email) {
                //     await this.sendBookingEmail({
                //     to: user.email,
                //     service: updatedBooking.serviceId,
                //     workerName: worker?.name || "Assigned Worker",
                //     });
                // }
                return {
                    success: true,
                    message: message_1.MESSAGES.WORKER_DETAILS_UPDATED_SUCCESSFULLY,
                    booking: updatedBooking,
                };
            }
            catch (error) {
                console.error("❌ Error updating worker details:", error);
                return {
                    success: false,
                    message: message_1.MESSAGES.INTERNAL_SERVER_ERROR_WHILE_UPDATING_DET,
                };
            }
        });
    }
    verifyPayment(bookingId, paymentType) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!bookingId || !paymentType) {
                    return {
                        success: false,
                        message: message_1.MESSAGES.MISSING_BOOKINGID_OR_PAYMENTTYPE,
                        data: null,
                    };
                }
                const booking = yield this._bookingRepo.findById(bookingId);
                if (!booking) {
                    return { success: false, message: message_1.MESSAGES.BOOKING_NOT_FOUND, data: null };
                }
                // -------------------------
                // ADVANCE PAYMENT CHECK
                // -------------------------
                if (paymentType === "advance") {
                    if (booking.advancePaymentStatus !== "paid") {
                        return {
                            success: false,
                            message: message_1.MESSAGES.ADVANCE_PAYMENT_NOT_COMPLETED,
                            data: null,
                        };
                    }
                    return {
                        success: true,
                        message: message_1.MESSAGES.ADVANCE_PAYMENT_VERIFIED,
                        data: {
                            bookingId,
                            amountPaid: booking.advanceAmount,
                            type: "advance",
                        },
                    };
                }
                // -------------------------
                // FINAL PAYMENT CHECK
                // -------------------------
                if (paymentType === "final") {
                    if (booking.finalPaymentStatus !== "paid") {
                        return {
                            success: false,
                            message: message_1.MESSAGES.FINAL_PAYMENT_NOT_COMPLETED,
                            data: null,
                        };
                    }
                    return {
                        success: true,
                        message: message_1.MESSAGES.FINAL_PAYMENT_VERIFIED,
                        data: {
                            bookingId,
                            amountPaid: booking.totalAmount,
                            type: "final",
                        },
                    };
                }
                return { success: false, message: message_1.MESSAGES.INVALID_PAYMENT_TYPE, data: null };
            }
            catch (err) {
                console.error("Error verifying payment:", err);
                return {
                    success: false,
                    message: message_1.MESSAGES.INTERNAL_SERVER_ERROR,
                    data: null,
                };
            }
        });
    }
    cancelBooking(bookingId, userId, reason) {
        return __awaiter(this, void 0, void 0, function* () {
            const booking = yield this._bookingRepo.findByIdPopulated(bookingId);
            if (!booking) {
                return {
                    success: false,
                    message: message_1.MESSAGES.BOOKING_NOT_FOUND,
                };
            }
            if (booking.workerResponse == "rejected") {
                return {
                    success: false,
                    message: message_1.MESSAGES.WORKER_ALREADY_REJECTED_THIS_BOOKING,
                };
            }
            if (!["pending", "confirmed"].includes(booking.status)) {
                return {
                    success: false,
                    message: message_1.MESSAGES.ONLY_STATUS_WITH_PENDING_AND_CONIFIRMED_,
                };
            }
            const updateBooking = yield this._bookingRepo.updateStatus(bookingId, "cancelled");
            if (!updateBooking) {
                return {
                    success: false,
                    message: message_1.MESSAGES.BOOKING_NOT_FOUND,
                };
            }
            yield this.notification.createNotification({
                title: 'booking canceled',
                message: message_1.MESSAGES.USER_CANCEL_THE_BOOKING,
                type: 'booking',
                workerId: booking.workerId._id.toString(),
                bookingId,
            });
            yield this._emailService.sendBookingCancelledEmail({
                email: booking.userId.email,
                userName: booking.userId.name,
                serviceName: booking.serviceId.category,
                bookingCode: booking._id.toString(),
                reason,
            });
            return {
                success: true,
                message: message_1.MESSAGES.BOOKING_CANCELLED,
                booking: updateBooking,
            };
        });
    }
};
exports.BookingService = BookingService;
exports.BookingService = BookingService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(types_1.TYPES.BookingRepository)),
    __param(1, (0, tsyringe_1.inject)(types_1.TYPES.WorkerRepository)),
    __param(2, (0, tsyringe_1.inject)(types_1.TYPES.SlotLockRepository)),
    __param(3, (0, tsyringe_1.inject)(types_1.TYPES.EmailService)),
    __param(4, (0, tsyringe_1.inject)(types_1.TYPES.NotificationService)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], BookingService);
