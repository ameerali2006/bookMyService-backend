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
exports.UserController = void 0;
const tsyringe_1 = require("tsyringe");
const types_1 = require("../../config/constants/types");
const status_code_1 = require("../../config/constants/status-code");
const custom_error_1 = require("../../utils/custom-error");
const message_1 = require("../../config/constants/message");
const update_user_profile_details_1 = require("../validation/update-user-profile-details");
const add_address_zod_1 = require("../validation/add-address.zod");
const change_password_zod_1 = require("../validation/change-password.zod");
let UserController = class UserController {
    constructor(_profileManage, _changePassword, _bookingDetailsService, _walletService, _transactionServcie) {
        this._profileManage = _profileManage;
        this._changePassword = _changePassword;
        this._bookingDetailsService = _bookingDetailsService;
        this._walletService = _walletService;
        this._transactionServcie = _transactionServcie;
    }
    userProfileDetails(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(req.user);
                const userId = req.user._id;
                const data = yield this._profileManage.getUserProfileDetails(userId);
                res.status(status_code_1.STATUS_CODES.OK).json(data);
            }
            catch (error) {
                next(error);
            }
        });
    }
    updateProfileDetails(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(req.body);
                const parsedData = update_user_profile_details_1.updateUserProfileSchema.safeParse(req.body);
                if (!parsedData.success) {
                    const errors = parsedData.error.format();
                    res.status(status_code_1.STATUS_CODES.BAD_REQUEST).json({
                        success: false,
                        message: 'Validation failed',
                        errors,
                    });
                    throw new custom_error_1.CustomError(message_1.MESSAGES.VALIDATION_ERROR, status_code_1.STATUS_CODES.CONFLICT);
                }
                const user = parsedData.data;
                const userId = req.user._id;
                const updatedData = yield this._profileManage.updateUserProfileDetails(user, userId);
                if (!updatedData) {
                    throw new custom_error_1.CustomError(message_1.MESSAGES.BAD_REQUEST, status_code_1.STATUS_CODES.BAD_REQUEST);
                }
                res.status(status_code_1.STATUS_CODES.OK).json(updatedData);
            }
            catch (error) {
                next(error);
            }
        });
    }
    getUserAddresses(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user._id;
                console.log(userId);
                const data = yield this._profileManage.getUserAddress(userId);
                console.log(data);
                res.status(status_code_1.STATUS_CODES.OK).json(data);
            }
            catch (error) {
                next(error);
            }
        });
    }
    addUserAddress(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user._id;
                const address = add_address_zod_1.addressSchema.parse(req.body);
                const data = yield this._profileManage.addUserAddress(userId, address);
                if (!data.success) {
                    res.status(status_code_1.STATUS_CODES.BAD_REQUEST).json(data);
                }
                else {
                    res.status(status_code_1.STATUS_CODES.OK).json(data);
                }
            }
            catch (error) {
                next(error);
            }
        });
    }
    setPrimaryAddress(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user._id;
                console.log(req);
                const { toSetId } = req.body;
                console.log(`${userId}+${toSetId}`);
                const respose = yield this._profileManage.setPrimaryAddress(userId, toSetId);
                if (!respose.success) {
                    res.status(status_code_1.STATUS_CODES.BAD_REQUEST).json(respose);
                }
                else {
                    res.status(status_code_1.STATUS_CODES.OK).json(respose);
                }
            }
            catch (error) {
                next(error);
            }
        });
    }
    changePassword(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const parsed = change_password_zod_1.changePasswordSchema.parse(req.body);
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            const result = yield this._changePassword.changePassword('user', userId, parsed);
            if (result.success) {
                res.status(status_code_1.STATUS_CODES.OK).json(result);
            }
            else {
                res.status(status_code_1.STATUS_CODES.CONFLICT).json(result);
            }
        });
    }
    ongoingBookings(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const limit = Number(req.query.limit) || 10;
                const page = Number(req.query.page) || 1;
                const search = req.query.search || '';
                const userId = req.user._id;
                const skip = (page - 1) * limit;
                // ---- SERVICE CALL ----
                const response = yield this._bookingDetailsService.ongoingBookings(userId, limit, skip, search);
                if (response.success) {
                    res.status(status_code_1.STATUS_CODES.OK).json(response);
                }
                else {
                    res.status(status_code_1.STATUS_CODES.BAD_REQUEST).json(response);
                }
            }
            catch (error) {
                next(error);
            }
        });
    }
    bookingDetailData(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { bookingId } = req.params;
                if (!bookingId) {
                    res
                        .status(status_code_1.STATUS_CODES.BAD_REQUEST)
                        .json({ success: false, message: 'ubooking details missing' });
                }
                const response = yield this._bookingDetailsService.bookingDetailData(bookingId);
                console.log(response);
                if (response.success) {
                    res.status(status_code_1.STATUS_CODES.OK).json(response);
                }
                else {
                    res.status(status_code_1.STATUS_CODES.BAD_REQUEST).json(response);
                }
            }
            catch (error) {
                next(error);
            }
        });
    }
    getWalletData(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = req.user._id;
            const { role } = req.user;
            console.log(userId, role);
            const wallet = yield this._walletService.getWalletData(userId, role);
            console.log(wallet);
            res.status(200).json(wallet);
        });
    }
    getTransactions(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = req.user._id;
            const { role } = req.user;
            const query = {
                page: Number(req.query.page) || 1,
                limit: Number(req.query.limit) || 10,
                type: typeof req.query.type === 'string' ? req.query.type : undefined,
                status: typeof req.query.status === 'string' ? req.query.status : undefined,
                sortBy: typeof req.query.sortBy === 'string' ? req.query.sortBy : 'createdAt',
                sortOrder: req.query.sortOrder === 'asc' || req.query.sortOrder === 'desc'
                    ? req.query.sortOrder
                    : 'desc',
                startDate: typeof req.query.startDate === 'string'
                    ? req.query.startDate
                    : undefined,
                endDate: typeof req.query.endDate === 'string' ? req.query.endDate : undefined,
            };
            console.log(userId, role);
            const result = yield this._transactionServcie.getTransactionData(userId, role, query);
            res.status(status_code_1.STATUS_CODES.OK).json(result);
        });
    }
    walletPayment(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user._id;
                const { bookingId, addressId, paymentType } = req.body;
                if (!bookingId || !paymentType || !addressId) {
                    res.status(status_code_1.STATUS_CODES.BAD_REQUEST).json({
                        success: false,
                        message: 'bookingId, addressId and paymentType are required',
                    });
                    return;
                }
                const booking = yield this._bookingDetailsService.bookingDetailData(bookingId);
                if (!booking.success || !booking.booking) {
                    res.status(status_code_1.STATUS_CODES.BAD_REQUEST).json({
                        success: false,
                        message: 'Booking not found',
                    });
                    return;
                }
                const bookingData = booking.booking;
                const amount = paymentType === 'advance'
                    ? bookingData.advanceAmount
                    : bookingData.remainingAmount;
                if (paymentType === 'advance'
                    && bookingData.advancePaymentStatus === 'paid') {
                    res.status(status_code_1.STATUS_CODES.BAD_REQUEST).json({
                        success: false,
                        message: 'Advance already paid',
                    });
                    return;
                }
                if (paymentType === 'final'
                    && bookingData.finalPaymentStatus === 'paid') {
                    res.status(status_code_1.STATUS_CODES.BAD_REQUEST).json({
                        success: false,
                        message: 'Final payment already completed',
                    });
                    return;
                }
                // 💰 wallet debit
                const walletResult = yield this._walletService.debitBalance({
                    userId,
                    role: 'user',
                    amount,
                    type: 'ADJUSTMENT',
                    description: `${paymentType} payment for booking ${bookingId}`,
                });
                if (!walletResult.success) {
                    res.status(status_code_1.STATUS_CODES.BAD_REQUEST).json(walletResult);
                    return;
                }
                // 🧾 Update booking payment status
                yield this._bookingDetailsService.updatePaymentStatus(bookingId, addressId, paymentType);
                res.status(status_code_1.STATUS_CODES.OK).json({
                    success: true,
                    message: 'Wallet payment successful',
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
};
exports.UserController = UserController;
exports.UserController = UserController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(types_1.TYPES.ProfileManagement)),
    __param(1, (0, tsyringe_1.inject)(types_1.TYPES.ChangePasswordService)),
    __param(2, (0, tsyringe_1.inject)(types_1.TYPES.BookingDetailsService)),
    __param(3, (0, tsyringe_1.inject)(types_1.TYPES.WalletService)),
    __param(4, (0, tsyringe_1.inject)(types_1.TYPES.TransactionService)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], UserController);
