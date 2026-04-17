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
exports.ManagementAdminService = void 0;
const tsyringe_1 = require("tsyringe");
const types_1 = require("../../config/constants/types");
const admin_mapper_1 = require("../../utils/mapper/admin-mapper");
const custom_error_1 = require("../../utils/custom-error");
const message_1 = require("../../config/constants/message");
const status_code_1 = require("../../config/constants/status-code");
let ManagementAdminService = class ManagementAdminService {
    constructor(_userRepo, _workerRepo, _serviceRepo, _bookingRepo) {
        this._userRepo = _userRepo;
        this._workerRepo = _workerRepo;
        this._serviceRepo = _serviceRepo;
        this._bookingRepo = _bookingRepo;
    }
    getAllUsers(role, page, limit, search, sortBy, sortOrder) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const filter = {};
                if (search) {
                    filter.$or = [
                        { name: { $regex: search, $options: 'i' } },
                        { email: { $regex: search, $options: 'i' } },
                        { phone: { $regex: search, $options: 'i' } },
                    ];
                }
                const skip = (page - 1) * limit;
                const sort = {
                    [sortBy]: sortOrder === 'asc' ? 1 : -1,
                };
                const { items, total } = role === 'user'
                    ? yield this._userRepo.findAll(filter, skip, limit, sort)
                    : yield this._workerRepo.findAll(filter, skip, limit, sort);
                let userDataDto;
                if (role === 'user') {
                    userDataDto = admin_mapper_1.AdminMapper.resUserDetails(items);
                }
                else {
                    userDataDto = admin_mapper_1.AdminMapper.resWorkersDetails(items);
                }
                return {
                    users: userDataDto,
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalItems: total,
                };
            }
            catch (error) {
                console.log(error);
                throw error instanceof custom_error_1.CustomError
                    ? error
                    : new custom_error_1.CustomError(message_1.MESSAGES.USER_NOT_FOUND || 'Failed to fetch users', status_code_1.STATUS_CODES.INTERNAL_SERVER_ERROR);
            }
        });
    }
    updateStatus(userId, status, role) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!userId) {
                    throw new custom_error_1.CustomError(message_1.MESSAGES.INVALID_CREDENTIALS || 'User ID is required', status_code_1.STATUS_CODES.BAD_REQUEST);
                }
                if (typeof status !== 'boolean') {
                    throw new custom_error_1.CustomError(message_1.MESSAGES.INVALID_CREDENTIALS || 'isActive must be a boolean', status_code_1.STATUS_CODES.BAD_REQUEST);
                }
                const updated = role == 'user'
                    ? yield this._userRepo.updateById(userId, { isBlocked: status })
                    : yield this._workerRepo.updateById(userId, { isBlocked: status });
                if (!updated) {
                    throw new custom_error_1.CustomError(message_1.MESSAGES.USER_NOT_FOUND || 'User not found', status_code_1.STATUS_CODES.NOT_FOUND);
                }
                return updated;
            }
            catch (error) {
                throw error instanceof custom_error_1.CustomError
                    ? error
                    : new custom_error_1.CustomError('Failed to update user status', status_code_1.STATUS_CODES.INTERNAL_SERVER_ERROR);
            }
        });
    }
    getUnverifiedWorkers(page, pageSize, status) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const query = {};
                if (status) {
                    query.isVerified = status;
                }
                const { data, total } = yield this._workerRepo.findWithPopulate(query, [{ path: 'category', select: 'category' }], (page - 1) * pageSize, pageSize);
                console.log({
                    workers: data,
                    total,
                    currentPage: page,
                    totalPages: Math.ceil(total / pageSize),
                });
                return {
                    workers: data,
                    total,
                    currentPage: page,
                    totalPages: Math.ceil(total / pageSize),
                };
            }
            catch (error) {
                console.error(error);
                throw error instanceof custom_error_1.CustomError
                    ? error
                    : new custom_error_1.CustomError('data error', status_code_1.STATUS_CODES.BAD_REQUEST);
            }
        });
    }
    verifyWorker(userId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!userId) {
                    throw new custom_error_1.CustomError(message_1.MESSAGES.USER_NOT_FOUND || 'User ID not found', status_code_1.STATUS_CODES.BAD_REQUEST);
                }
                const verifiedWorker = yield this._workerRepo.updateById(userId, {
                    isVerified: status,
                });
                console.log(verifiedWorker);
                if (!verifiedWorker) {
                    throw new custom_error_1.CustomError(message_1.MESSAGES.USER_NOT_FOUND || 'User ID not found', status_code_1.STATUS_CODES.BAD_REQUEST);
                }
                return { status: verifiedWorker.isVerified };
            }
            catch (error) {
                throw error instanceof custom_error_1.CustomError
                    ? error
                    : new custom_error_1.CustomError('Failed to verify worker status', status_code_1.STATUS_CODES.INTERNAL_SERVER_ERROR);
            }
        });
    }
    getAllServices(search, sort, page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const query = {};
                if (search) {
                    query.category = { $regex: search, $options: 'i' };
                }
                let sortOption = { createdAt: -1 };
                if (sort == 'lowPrice')
                    sortOption = { price: 1 };
                if (sort == 'highPrice')
                    sortOption = { price: -1 };
                const pageNumber = parseInt(String(page), 10) || 1;
                const pageSize = parseInt(String(limit), 10) || 6;
                const skip = (pageNumber - 1) * pageSize;
                const { items, total } = yield this._serviceRepo.findAll(query, skip, limit, Object.assign({}, sortOption));
                const services = admin_mapper_1.AdminMapper.resServiceDetails(items);
                console.log(services);
                return {
                    services,
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalItems: total,
                };
            }
            catch (error) {
                console.log(error);
                throw error instanceof custom_error_1.CustomError
                    ? error
                    : new custom_error_1.CustomError(message_1.MESSAGES.USER_NOT_FOUND || 'Failed to fetch users', status_code_1.STATUS_CODES.INTERNAL_SERVER_ERROR);
            }
        });
    }
    serviceRegister(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const existing = yield this._serviceRepo.findOne({
                    category: data.category,
                });
                if (existing) {
                    return { message: 'Service already exists' };
                }
                const newService = yield this._serviceRepo.create(data);
                const mappedData = admin_mapper_1.AdminMapper.resServiceDetails([newService]);
                return {
                    data: mappedData[0],
                    message: 'Service created successfully',
                };
            }
            catch (error) {
                console.log(error);
                throw error instanceof custom_error_1.CustomError
                    ? error
                    : new custom_error_1.CustomError(message_1.MESSAGES.USER_NOT_FOUND || 'Failed to fetch users', status_code_1.STATUS_CODES.INTERNAL_SERVER_ERROR);
            }
        });
    }
    updateServiceStatus(serviceId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!serviceId) {
                    throw new custom_error_1.CustomError(message_1.MESSAGES.INVALID_CREDENTIALS || 'User ID is required', status_code_1.STATUS_CODES.BAD_REQUEST);
                }
                const updated = yield this._serviceRepo.updateById(serviceId, {
                    status,
                });
                console.log(updated);
                if (!updated) {
                    throw new custom_error_1.CustomError(message_1.MESSAGES.ACCOUNT_NOT_VERIFIED || 'Service not found', status_code_1.STATUS_CODES.NOT_FOUND);
                }
                return { success: true, status: updated.status };
            }
            catch (error) {
                console.log(error);
                throw error instanceof custom_error_1.CustomError
                    ? error
                    : new custom_error_1.CustomError(message_1.MESSAGES.USER_NOT_FOUND || 'Failed to fetch users', status_code_1.STATUS_CODES.INTERNAL_SERVER_ERROR);
            }
        });
    }
    getAllBookings(search, status, limit, page) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const safePage = Math.max(1, Number(page) || 1);
                const safeLimit = Math.min(50, Number(limit) || 10);
                const safeStatus = status === 'all' ? undefined : status;
                const { data, total } = yield this._bookingRepo.getAllBookings({
                    search,
                    status: safeStatus,
                    page: safePage,
                    limit: safeLimit,
                });
                // 3️⃣ Map to DTO (decoupling DB model from API)
                const mappedBookings = data.map((booking) => ({
                    id: booking._id.toString(),
                    customerName: booking.userId.name,
                    workerName: booking.workerId.name,
                    serviceName: booking.serviceId.category,
                    date: booking.date,
                    startTime: booking.startTime,
                    endTime: booking === null || booking === void 0 ? void 0 : booking.endTime,
                    status: booking.status,
                    createdAt: booking.createdAt,
                }));
                return {
                    success: true,
                    message: 'Bookings fetched successfully',
                    bookings: mappedBookings,
                    total,
                    page: safePage,
                    limit: safeLimit,
                };
            }
            catch (error) {
                return {
                    success: false,
                    message: 'Failed to fetch bookings',
                    total: 0,
                    page,
                    limit,
                };
            }
        });
    }
    getBookingDetail(bookingId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!bookingId) {
                    return {
                        success: false,
                        message: 'data not fount',
                    };
                }
                const getData = yield this._bookingRepo.findByIdPopulated(bookingId);
                if (!getData) {
                    return {
                        success: false,
                        message: 'data not fount',
                    };
                }
                const booking = admin_mapper_1.AdminMapper.resBookingDetails(getData);
                return {
                    success: true,
                    message: 'success fully fetched Data',
                    booking,
                };
            }
            catch (error) {
                return {
                    success: false,
                    message: 'internal error',
                };
            }
        });
    }
    calculateGrowth(current, previous) {
        if (!previous)
            return current ? 100 : 0;
        return Number((((current - previous) / previous) * 100).toFixed(2));
    }
    getDashboard() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f;
            const raw = yield this._bookingRepo.getDashboardRawData();
            const data = raw[0];
            const totalBookings = ((_a = data.bookingStats[0]) === null || _a === void 0 ? void 0 : _a.totalBookings) || 0;
            const completedBookings = ((_b = data.bookingStats[0]) === null || _b === void 0 ? void 0 : _b.completedBookings) || 0;
            const cancelledBookings = ((_c = data.bookingStats[0]) === null || _c === void 0 ? void 0 : _c.cancelledBookings) || 0;
            const totalRevenue = ((_d = data.totalRevenue[0]) === null || _d === void 0 ? void 0 : _d.revenue) || 0;
            const currentMonth = ((_e = data.currentMonth[0]) === null || _e === void 0 ? void 0 : _e.count) || 0;
            const lastMonth = ((_f = data.lastMonth[0]) === null || _f === void 0 ? void 0 : _f.count) || 0;
            const bookingGrowth = this.calculateGrowth(currentMonth, lastMonth);
            return {
                success: true,
                message: 'fetch success fully',
                data: {
                    stats: {
                        totalBookings,
                        completedBookings,
                        cancelledBookings,
                        totalRevenue,
                        activeServices: yield this._serviceRepo.countDocuments({ status: 'active' }),
                        approvedWorkers: yield this._workerRepo.countDocuments({ isVerified: 'approved' }),
                        totalUsers: yield this._userRepo.countDocuments(),
                        bookingGrowth,
                        revenueGrowth: 0, // can calculate similar to booking
                    },
                    revenueChart: data.revenueChart.map((item) => ({
                        month: `${item._id.month}/${item._id.year}`,
                        revenue: item.revenue,
                    })),
                    serviceDistribution: data.serviceDistribution,
                },
            };
        });
    }
};
exports.ManagementAdminService = ManagementAdminService;
exports.ManagementAdminService = ManagementAdminService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(types_1.TYPES.AuthUserRepository)),
    __param(1, (0, tsyringe_1.inject)(types_1.TYPES.WorkerRepository)),
    __param(2, (0, tsyringe_1.inject)(types_1.TYPES.ServiceRepository)),
    __param(3, (0, tsyringe_1.inject)(types_1.TYPES.BookingRepository)),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], ManagementAdminService);
