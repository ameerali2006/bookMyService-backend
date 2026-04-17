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
exports.WorkingDetailsController = void 0;
const tsyringe_1 = require("tsyringe");
const types_1 = require("../../config/constants/types");
const status_code_1 = require("../../config/constants/status-code");
const message_1 = require("../../config/constants/message");
const update_worker_profile_1 = require("../validation/update-worker-profile");
const change_password_zod_1 = require("../validation/change-password.zod");
let WorkingDetailsController = class WorkingDetailsController {
    constructor(_workingManage, _changePassword, _walletService, _transactionService) {
        this._workingManage = _workingManage;
        this._changePassword = _changePassword;
        this._walletService = _walletService;
        this._transactionService = _transactionService;
    }
    getWorkingDetails(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const email = req.query.email;
                console.log(email);
                const details = yield this._workingManage.getWorkingDetails(email);
                if (details) {
                    res.status(status_code_1.STATUS_CODES.OK).json({
                        success: true,
                        message: message_1.MESSAGES.DATA_SENT_SUCCESS,
                        data: details,
                    });
                }
                else {
                    res
                        .status(status_code_1.STATUS_CODES.BAD_REQUEST)
                        .json({ success: false, message: message_1.MESSAGES.FORBIDDEN, data: null });
                }
            }
            catch (error) {
                next(error);
            }
        });
    }
    updateWorkingDetails(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const email = req.body.email;
                const { payload } = req.body;
                console.log(email);
                const details = yield this._workingManage.updateWorkingDetails(email, payload);
                if (details.success) {
                    res.status(status_code_1.STATUS_CODES.OK).json({
                        success: true,
                        message: message_1.MESSAGES.DATA_SENT_SUCCESS,
                        data: details.data,
                    });
                }
                else {
                    res
                        .status(status_code_1.STATUS_CODES.BAD_REQUEST)
                        .json({ success: false, message: message_1.MESSAGES.FORBIDDEN, data: null });
                }
            }
            catch (error) {
                next(error);
            }
        });
    }
    getProfileDetails(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const workerId = req.user._id;
                const response = yield this._workingManage.getProfileDetails(workerId);
                console.log(response);
                if (response.success) {
                    res.status(status_code_1.STATUS_CODES.OK).json(response);
                }
                else {
                    res.status(status_code_1.STATUS_CODES.CONFLICT).json(response);
                }
            }
            catch (error) {
                next(error);
            }
        });
    }
    updateProfileDetails(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const workerId = req.user._id;
                if (!workerId) {
                    res.status(status_code_1.STATUS_CODES.UNAUTHORIZED).json({
                        success: false,
                        message: message_1.MESSAGES.VALIDATION_ERROR,
                    });
                }
                const parsed = update_worker_profile_1.workerProfileUpdateSchema.safeParse(req.body);
                if (!parsed.success) {
                    const errors = parsed.error.format();
                    res.status(status_code_1.STATUS_CODES.BAD_REQUEST).json({
                        success: false,
                        message: 'Validation failed',
                        errors,
                    });
                }
                console.log(parsed.data);
                const response = yield this._workingManage.updateWorkerProfile(workerId, parsed.data);
                console.log(response);
                if (response.success) {
                    res.status(status_code_1.STATUS_CODES.OK).json(response);
                }
                else {
                    res.status(status_code_1.STATUS_CODES.CONFLICT).json(response);
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
            try {
                const parsed = change_password_zod_1.changePasswordSchema.parse(req.body);
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
                const result = yield this._changePassword.changePassword('worker', userId, parsed);
                if (result.success) {
                    res.status(status_code_1.STATUS_CODES.OK).json(result);
                }
                else {
                    res.status(status_code_1.STATUS_CODES.CONFLICT).json(result);
                }
            }
            catch (error) {
                next(error);
            }
        });
    }
    getCalenderDetails(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const workerId = req.user._id;
                const response = yield this._workingManage.getCalenderDetails(workerId);
                if (response.success) {
                    res.status(status_code_1.STATUS_CODES.OK).json(response);
                }
                else {
                    res.status(status_code_1.STATUS_CODES.CONFLICT).json(response);
                }
            }
            catch (error) {
                next(error);
            }
        });
    }
    updateCalenderDetails(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const workerId = req.user._id;
                console.log(req.body);
                const { holidays, customSlots } = req.body;
                const result = yield this._workingManage.updateCalenderDetails(workerId, customSlots, holidays);
                if (result.success) {
                    res.status(status_code_1.STATUS_CODES.OK).json(result);
                }
                else {
                    res.status(status_code_1.STATUS_CODES.CONFLICT).json(result);
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
            const result = yield this._transactionService.getTransactionData(userId, role, query);
            res.status(status_code_1.STATUS_CODES.OK).json(result);
        });
    }
};
exports.WorkingDetailsController = WorkingDetailsController;
exports.WorkingDetailsController = WorkingDetailsController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(types_1.TYPES.WorkingDetailsManagement)),
    __param(1, (0, tsyringe_1.inject)(types_1.TYPES.ChangePasswordService)),
    __param(2, (0, tsyringe_1.inject)(types_1.TYPES.WalletService)),
    __param(3, (0, tsyringe_1.inject)(types_1.TYPES.TransactionService)),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], WorkingDetailsController);
