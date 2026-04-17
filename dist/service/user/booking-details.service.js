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
exports.BookingDetailsService = void 0;
const tsyringe_1 = require("tsyringe");
const types_1 = require("../../config/constants/types");
const user_mapper_1 = require("../../utils/mapper/user-mapper");
let BookingDetailsService = class BookingDetailsService {
    constructor(bookingRepo) {
        this.bookingRepo = bookingRepo;
    }
    ongoingBookings(userId, limit, skip, search) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const statuses = ['pending', 'confirmed', 'in-progress', 'awaiting-final-payment', 'completed'];
                const workerResponses = ['pending', 'accepted'];
                const { bookings, total } = yield this.bookingRepo.findBookingListByUserId(userId, statuses, workerResponses, limit, skip, search);
                console.log(bookings);
                if (!bookings) {
                    return {
                        success: false,
                        message: 'No bookings found',
                    };
                }
                const formatted = user_mapper_1.UserMapper.ongoingBooking(bookings);
                return {
                    success: true,
                    message: 'Ongoing bookings fetched successfully',
                    data: {
                        data: formatted,
                        total,
                    },
                };
            }
            catch (error) {
                return {
                    success: false,
                    message: 'internal Error',
                };
            }
        });
    }
    bookingDetailData(bookingId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!bookingId) {
                    return { success: false, message: 'bookiing detail is missing' };
                }
                const bookingData = yield this.bookingRepo.findByIdPopulated(bookingId);
                if (!bookingData) {
                    return { success: false, message: 'booking not fount' };
                }
                const dtoData = user_mapper_1.UserMapper.bookingDetail(bookingData);
                return { success: true, message: 'successfully fetched data', booking: dtoData };
            }
            catch (error) {
                console.log(error);
                return {
                    success: false,
                    message: 'internal Error',
                };
            }
        });
    }
    updatePaymentStatus(bookingId, addressId, paymentType) {
        return __awaiter(this, void 0, void 0, function* () {
            const updateData = {
                address: addressId,
            };
            if (paymentType === 'advance') {
                updateData.advancePaymentStatus = 'paid';
                updateData.status = 'confirmed';
            }
            if (paymentType === 'final') {
                updateData.finalPaymentStatus = 'paid';
                updateData.status = 'completed';
            }
            return yield this.bookingRepo.updateById(bookingId, updateData);
        });
    }
};
exports.BookingDetailsService = BookingDetailsService;
exports.BookingDetailsService = BookingDetailsService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(types_1.TYPES.BookingRepository)),
    __metadata("design:paramtypes", [Object])
], BookingDetailsService);
