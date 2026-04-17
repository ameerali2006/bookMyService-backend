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
exports.WorkerBookingController = void 0;
const tsyringe_1 = require("tsyringe");
const mongoose_1 = require("mongoose");
const types_1 = require("../../config/constants/types");
const service_approval_zod_1 = require("../validation/service-approval.zod");
const status_code_1 = require("../../config/constants/status-code");
const allBookingList_zod_1 = require("../validation/allBookingList.zod");
let WorkerBookingController = class WorkerBookingController {
    constructor(bookingService) {
        this.bookingService = bookingService;
    }
    approveService(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = service_approval_zod_1.ApprovalSchema.parse(req.body);
                console.log(data);
                const result = yield this.bookingService.approveService(data);
                console.log('dffdgfg');
                console.log(result);
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
    rejectService(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { bookingId, description } = req.body;
                const result = yield this.bookingService.rejectService(bookingId, description);
                res.status(result.success ? status_code_1.STATUS_CODES.OK : status_code_1.STATUS_CODES.BAD_REQUEST).json(result);
            }
            catch (error) {
                next(error);
            }
        });
    }
    getServiceRequests(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const workerId = req.user._id; // from auth middleware
                const filters = {
                    workerId,
                    search: ((_a = req.query.search) === null || _a === void 0 ? void 0 : _a.toString()) || '',
                    status: req.query.status || 'pending',
                    date: ((_b = req.query.date) === null || _b === void 0 ? void 0 : _b.toString()) || '',
                    page: Number(req.query.page) || 1,
                    limit: Number(req.query.limit) || 20,
                };
                const response = yield this.bookingService.getServiceRequests(Object.assign(Object.assign({}, filters), { advancePaymentStatus: 'paid' }));
                res.json(response);
            }
            catch (error) {
                next(error);
            }
        });
    }
    getServiceApprovals(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const workerId = req.user._id;
                const page = Number(req.query.page) || 1;
                const limit = Number(req.query.limit) || 10;
                const search = req.query.search;
                const status = req.query.status;
                const result = yield this.bookingService.getWorkerApprovedBookings({
                    workerId,
                    page,
                    limit,
                    search,
                    status,
                });
                console.log(result);
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
    getApprovalsDetails(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { bookingId } = req.params;
                const result = yield this.bookingService.getWorkerAprrovalpageDetails(bookingId);
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
    reachLocation(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { bookingId } = req.params;
                const result = yield this.bookingService.reachedCustomerLocation(bookingId);
                console.log(result);
                if (result.success) {
                    res.status(status_code_1.STATUS_CODES.OK).json(result);
                }
                else {
                    res.status(status_code_1.STATUS_CODES.BAD_REQUEST).json(result);
                }
            }
            catch (error) {
                console.log(error);
                next(error);
            }
        });
    }
    verifyWorker(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { bookingId, otp } = req.body;
                const response = yield this.bookingService.verifyWorker(bookingId, otp);
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
    workComplated(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { bookingId } = req.body;
                const response = yield this.bookingService.workerComplateWork(bookingId);
                res.status(response.status || status_code_1.STATUS_CODES.BAD_REQUEST).json(response);
            }
            catch (error) {
                next(error);
            }
        });
    }
    allBookings(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const workerId = req.user._id;
                const query = allBookingList_zod_1.WorkerBookingListRequestDto.parse(req.query);
                const data = yield this.bookingService.getWorkerBookings(workerId, query);
                if (data.success) {
                    res.status(status_code_1.STATUS_CODES.OK).json(data);
                }
                else {
                    res.status(status_code_1.STATUS_CODES.BAD_REQUEST).json(data);
                }
            }
            catch (error) {
                console.error(error);
                next(mongoose_1.Error);
            }
        });
    }
};
exports.WorkerBookingController = WorkerBookingController;
exports.WorkerBookingController = WorkerBookingController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(types_1.TYPES.WorkerBookingService)),
    __metadata("design:paramtypes", [Object])
], WorkerBookingController);
