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
let BookingService = class BookingService {
    constructor(_bookingRepo, _workerRepo, _slotLockRepo) {
        this._bookingRepo = _bookingRepo;
        this._workerRepo = _workerRepo;
        this._slotLockRepo = _slotLockRepo;
    }
    setBasicBookingDetails(userId, workerId, time, date, description) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!userId || !workerId) {
                    return {
                        success: false,
                        message: 'User not Found',
                        bookingId: null,
                    };
                }
                if (!time || !date || !description) {
                    return {
                        success: false,
                        message: 'Missing required fields (time, date, or description)',
                        bookingId: null,
                    };
                }
                if (isNaN(new Date(date).getTime())) {
                    return {
                        success: false,
                        message: 'Invalid date format',
                        bookingId: null,
                    };
                }
                const workerData = yield this._workerRepo.findById(workerId);
                if (!workerData) {
                    return {
                        success: false,
                        message: 'worker is not found',
                        bookingId: null,
                    };
                }
                const bookingDate = new Date(date);
                const [h, m] = time.split(':').map(Number);
                bookingDate.setHours(h, m, 0, 0);
                const startTime = new Date(bookingDate);
                const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
                /* 🔐 TRY LOCK */
                const locked = yield this._slotLockRepo.acquireLock(workerId, date, startTime, endTime, userId);
                if (!locked) {
                    return {
                        success: false,
                        message: 'Slot already booked by another user',
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
                    status: 'pending',
                    advancePaymentStatus: 'unpaid',
                });
                if (!newBooking) {
                    return {
                        success: false,
                        message: 'Failed to create booking',
                        bookingId: null,
                    };
                }
                return {
                    success: true,
                    message: 'Slot locked for 10 minutes',
                    bookingId: newBooking._id.toString(),
                };
            }
            catch (error) {
                console.log(error);
                return {
                    success: false,
                    message: 'internal Error',
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
                        message: 'booking details not found',
                        details: null,
                    };
                }
                const booking = yield this._bookingRepo.findByIdWithDetails(bookingId);
                if (!booking) {
                    return {
                        success: false,
                        message: 'booking details not found',
                        details: null,
                    };
                }
                const worker = booking.workerId;
                const service = booking.serviceId;
                let time = `${Number(booking.startTime.split(':')[0]) % 12}:${booking.startTime.split(':')[1]} `;
                Number(booking.startTime.split(':')[0]) % 12
                    == Number(booking.startTime.split(':')[0])
                    ? (time += ' AM')
                    : (time += ' PM');
                const data = {
                    workerName: worker.name,
                    serviceName: service.category,
                    date: booking.date.toISOString().split('T')[0],
                    time,
                    description: booking.description,
                    advancePaymentStatus: booking.advancePaymentStatus,
                    advance: booking.advanceAmount,
                };
                return {
                    success: true,
                    message: 'booking details  found',
                    details: data,
                };
            }
            catch (error) {
                return {
                    success: false,
                    message: 'internal error',
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
                        message: 'Missing bookingId or workerId',
                    };
                }
                // 🧠 Validate input
                if (!endingTime || !(itemsRequired === null || itemsRequired === void 0 ? void 0 : itemsRequired.length)) {
                    return {
                        success: false,
                        message: 'Ending time and required items are mandatory',
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
                        message: 'Booking not found or unauthorized',
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
                    message: 'Worker details updated successfully',
                    booking: updatedBooking,
                };
            }
            catch (error) {
                console.error('❌ Error updating worker details:', error);
                return {
                    success: false,
                    message: 'Internal server error while updating details',
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
                        message: 'Missing bookingId or paymentType',
                        data: null,
                    };
                }
                const booking = yield this._bookingRepo.findById(bookingId);
                if (!booking) {
                    return { success: false, message: 'Booking not found', data: null };
                }
                // -------------------------
                // ADVANCE PAYMENT CHECK
                // -------------------------
                if (paymentType === 'advance') {
                    if (booking.advancePaymentStatus !== 'paid') {
                        return {
                            success: false,
                            message: 'Advance payment not completed',
                            data: null,
                        };
                    }
                    return {
                        success: true,
                        message: 'Advance payment verified',
                        data: {
                            bookingId,
                            amountPaid: booking.advanceAmount,
                            type: 'advance',
                        },
                    };
                }
                // -------------------------
                // FINAL PAYMENT CHECK
                // -------------------------
                if (paymentType === 'final') {
                    if (booking.finalPaymentStatus !== 'paid') {
                        return {
                            success: false,
                            message: 'Final payment not completed',
                            data: null,
                        };
                    }
                    return {
                        success: true,
                        message: 'Final payment verified',
                        data: {
                            bookingId,
                            amountPaid: booking.totalAmount,
                            type: 'final',
                        },
                    };
                }
                return { success: false, message: 'Invalid payment type', data: null };
            }
            catch (err) {
                console.error('Error verifying payment:', err);
                return {
                    success: false,
                    message: 'Internal server error',
                    data: null,
                };
            }
        });
    }
};
exports.BookingService = BookingService;
exports.BookingService = BookingService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(types_1.TYPES.BookingRepository)),
    __param(1, (0, tsyringe_1.inject)(types_1.TYPES.WorkerRepository)),
    __param(2, (0, tsyringe_1.inject)(types_1.TYPES.SlotLockRepository)),
    __metadata("design:paramtypes", [Object, Object, Object])
], BookingService);
