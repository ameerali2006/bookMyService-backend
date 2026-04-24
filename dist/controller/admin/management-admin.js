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
exports.ManagementAdmin = void 0;
const tsyringe_1 = require("tsyringe");
const status_code_1 = require("../../config/constants/status-code");
const types_1 = require("../../config/constants/types");
const custom_error_1 = require("../../utils/custom-error");
const service_create_1 = require("../validation/service-create");
let ManagementAdmin = class ManagementAdmin {
    constructor(_adminManagement, _walletService, _transactionService) {
        this._adminManagement = _adminManagement;
        this._walletService = _walletService;
        this._transactionService = _transactionService;
    }
    getAllUsers(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const search = req.query.search || '';
                const sortBy = req.query.sortBy || 'createdAt';
                const sortOrder = req.query.sortOrder === 'asc' ? 'asc' : 'desc';
                const data = yield this._adminManagement.getAllUsers('user', page, limit, search, sortBy, sortOrder);
                console.log(data);
                res.status(status_code_1.STATUS_CODES.OK).json(Object.assign({ success: true }, data));
            }
            catch (error) {
                res
                    .status(status_code_1.STATUS_CODES.INTERNAL_SERVER_ERROR)
                    .json({ message: 'Failed to get users', error });
                next(error);
            }
        });
    }
    updateUserStatus(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(req.params, req.body);
                const { userId } = req.params;
                const status = req.body.isActive;
                console.log(userId, status);
                const updated = yield this._adminManagement.updateStatus(userId, status, 'user');
                if (!updated) {
                    res.status(status_code_1.STATUS_CODES.BAD_REQUEST || 400).json({
                        success: false,
                        message: 'User updation failed',
                    });
                }
                res.status(status_code_1.STATUS_CODES.OK || 200).json({
                    success: true,
                    message: `User ${(updated === null || updated === void 0 ? void 0 : updated.isBlocked) ? 'activated' : 'blocked'} successfully`,
                });
            }
            catch (error) {
                const statusCode = error instanceof custom_error_1.CustomError
                    ? error.statusCode
                    : status_code_1.STATUS_CODES.INTERNAL_SERVER_ERROR;
                const message = error instanceof Error ? error.message : 'Failed to update user status';
                res.status(statusCode).json({
                    success: false,
                    message,
                });
                next(error);
            }
        });
    }
    getAllWorkers(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const search = req.query.search || '';
                const sortBy = req.query.sortBy || 'createdAt';
                const sortOrder = req.query.sortOrder === 'asc' ? 'asc' : 'desc';
                const data = yield this._adminManagement.getAllUsers('worker', page, limit, search, sortBy, sortOrder);
                console.log(data);
                res.status(status_code_1.STATUS_CODES.OK).json(Object.assign({ success: true }, data));
            }
            catch (error) {
                res
                    .status(status_code_1.STATUS_CODES.INTERNAL_SERVER_ERROR)
                    .json({ message: 'Failed to get users', error });
                next(error);
            }
        });
    }
    updateWorkerStatus(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(req.params, req.body);
                const { userId } = req.params;
                const status = req.body.isActive;
                console.log(userId, status);
                const updated = yield this._adminManagement.updateStatus(userId, status, 'worker');
                if (!updated) {
                    res.status(status_code_1.STATUS_CODES.BAD_REQUEST || 400).json({
                        success: false,
                        message: 'User updation failed',
                    });
                }
                res.status(status_code_1.STATUS_CODES.OK || 200).json({
                    success: true,
                    message: `User ${(updated === null || updated === void 0 ? void 0 : updated.isBlocked) ? 'activated' : 'blocked'} successfully`,
                });
            }
            catch (error) {
                const statusCode = error instanceof custom_error_1.CustomError
                    ? error.statusCode
                    : status_code_1.STATUS_CODES.INTERNAL_SERVER_ERROR;
                const message = error instanceof Error ? error.message : 'Failed to update user status';
                res.status(statusCode).json({
                    success: false,
                    message,
                });
                next(error);
            }
        });
    }
    unVerifiedWorkers(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('unverified controller');
                const { page = 1, pageSize = 10 } = req.query;
                const data = yield this._adminManagement.getUnverifiedWorkers(Number(page), Number(pageSize), 'pending');
                res.status(status_code_1.STATUS_CODES.OK).json(Object.assign({ success: true }, data));
            }
            catch (error) {
                throw error instanceof custom_error_1.CustomError
                    ? error
                    : new custom_error_1.CustomError('Failed to unverified workers', status_code_1.STATUS_CODES.INTERNAL_SERVER_ERROR);
            }
        });
    }
    verifyWorker(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(req.params);
                const { workerId } = req.params;
                const { status } = req.body;
                console.log({ workerId });
                if (!['approved', 'rejected'].includes(status)) {
                    res
                        .status(status_code_1.STATUS_CODES.BAD_REQUEST)
                        .json({ success: false, message: 'Invalid status' });
                }
                console.log('kjhdk');
                const worker = yield this._adminManagement.verifyWorker(workerId, status);
                res.json({ success: true, status: worker.status });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getAllServices(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { search = '', sort = 'latest', page = '1', limit = '6', } = req.query;
                const data = yield this._adminManagement.getAllServices(String(search), sort, Number(page), Number(limit));
                res.status(status_code_1.STATUS_CODES.OK).json(Object.assign({ success: true }, data));
            }
            catch (error) {
                next(error);
            }
        });
    }
    serviceRegister(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = req.body;
                const validatedData = service_create_1.serviceRegistrationSchema.parse(data);
                const result = yield this._adminManagement.serviceRegister(validatedData);
                console.log(result);
                if (result.success) {
                    res.status(status_code_1.STATUS_CODES.OK).json(result);
                }
                else {
                    res.status(status_code_1.STATUS_CODES.NOT_FOUND).json(result);
                }
            }
            catch (error) {
                console.error(error);
                next(error);
            }
        });
    }
    updateServiceStatus(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(req.params, req.body);
                const serviceId = req.params.id;
                const status = req.body.status;
                console.log(serviceId, status);
                const updated = yield this._adminManagement.updateServiceStatus(serviceId, status);
                if (!updated) {
                    res.status(status_code_1.STATUS_CODES.BAD_REQUEST || 400).json({
                        success: false,
                        message: 'User updation failed',
                    });
                }
                res.status(status_code_1.STATUS_CODES.OK || 200).json({
                    success: true,
                    status: updated.status,
                    message: `User ${(updated === null || updated === void 0 ? void 0 : updated.status) ? 'inactive' : 'active'} successfully`,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getBookings(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { search = '', status = 'all', limit = '10', page = '1', } = req.query;
                const result = yield this._adminManagement.getAllBookings(search, status, Number(limit), Number(page));
                if (result.success) {
                    res.status(status_code_1.STATUS_CODES.OK).json(result);
                }
                else {
                    res.status(status_code_1.STATUS_CODES.BAD_REQUEST).json(result);
                }
            }
            catch (error) {
                next(error);
            }
        });
    }
    getBookingDetailPage(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const bookingId = req.params.bookingId;
                const result = yield this._adminManagement.getBookingDetail(bookingId);
                if (result.success) {
                    res.status(status_code_1.STATUS_CODES.OK).json(result);
                }
                else {
                    res.status(status_code_1.STATUS_CODES.BAD_REQUEST).json(result);
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
            try {
                console.log(req.user);
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
            }
            catch (error) {
                console.log(error);
                next(error);
            }
        });
    }
    getDashboard(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const dashboard = yield this._adminManagement.getDashboard();
                res.status(status_code_1.STATUS_CODES.OK).json({
                    success: true,
                    data: dashboard,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
};
exports.ManagementAdmin = ManagementAdmin;
exports.ManagementAdmin = ManagementAdmin = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(types_1.TYPES.ManagementAdminService)),
    __param(1, (0, tsyringe_1.inject)(types_1.TYPES.WalletService)),
    __param(2, (0, tsyringe_1.inject)(types_1.TYPES.TransactionService)),
    __metadata("design:paramtypes", [Object, Object, Object])
], ManagementAdmin);
