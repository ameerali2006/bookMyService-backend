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
exports.WorkerHelperService = void 0;
const tsyringe_1 = require("tsyringe");
const types_1 = require("../../config/constants/types");
const custom_error_1 = require("../../utils/custom-error");
const message_1 = require("../../config/constants/message");
const status_code_1 = require("../../config/constants/status-code");
const time_Intervals_1 = require("../../utils/time&Intervals");
let WorkerHelperService = class WorkerHelperService {
    constructor(_serviceRepo, workingRepo, bookingRepo, workerRepo) {
        this._serviceRepo = _serviceRepo;
        this.workingRepo = workingRepo;
        this.bookingRepo = bookingRepo;
        this.workerRepo = workerRepo;
    }
    getServiceNames() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield this._serviceRepo.findActiveServices();
                if (!data) {
                    return null;
                }
                const finalData = data.map((dat, i) => ({
                    value: String(dat._id),
                    label: dat.category.charAt(0).toUpperCase() + dat.category.slice(1),
                }));
                return finalData;
            }
            catch (error) {
                console.error('Login error:', error);
                if (error instanceof custom_error_1.CustomError) {
                    throw error;
                }
                throw new custom_error_1.CustomError(message_1.MESSAGES.UNAUTHORIZED_ACCESS, status_code_1.STATUS_CODES.INTERNAL_SERVER_ERROR);
            }
        });
    }
    getWorkerAvailableTime(workerId, date, startTime) {
        return __awaiter(this, void 0, void 0, function* () {
            const working = yield this.workingRepo.findByWorkerId(workerId);
            if (!working)
                return { success: false };
            const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
            const schedule = working.days.find((d) => d.day === dayName && d.enabled);
            if (!schedule)
                return { success: true, availableTime: '0.00' };
            const startMin = (0, time_Intervals_1.toMinutes)(startTime);
            const endMin = (0, time_Intervals_1.toMinutes)(schedule.endTime);
            // Convert breaks into time blocks
            const breakBlocks = schedule.breaks.map((b) => ({
                start: (0, time_Intervals_1.toMinutes)(b.breakStart),
                end: (0, time_Intervals_1.toMinutes)(b.breakEnd),
            }));
            // Convert bookings into time blocks
            const bookings = yield this.bookingRepo.findByWorkerAndDate(workerId, date);
            const bookingBlocks = bookings
                .filter((b) => b.startTime && b.endTime)
                .map((b) => ({
                start: (0, time_Intervals_1.toMinutes)(b.startTime),
                end: (0, time_Intervals_1.toMinutes)(b.endTime),
            }));
            // Merge & sort all unavailable blocks
            const blocks = [...breakBlocks, ...bookingBlocks].sort((a, b) => a.start - b.start);
            // Find the closest upcoming block after startTime
            const nextBlock = blocks.find((b) => b.start > startMin);
            const nextStart = nextBlock ? nextBlock.start : endMin;
            const diff = nextStart - startMin;
            const availableMinutes = diff > 0 ? diff : 0;
            return {
                success: true,
                availableTime: (0, time_Intervals_1.fromMinutes)(availableMinutes), // returns 1.30 for 1 hr 30 mins
            };
        });
    }
    getDashboard(workerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const worker = yield this.workerRepo.findById(workerId);
            if (!worker) {
                return { success: false, message: 'worker not fount' };
            }
            const dashboardData = yield this.bookingRepo.getWorkerDashboardStats(workerId);
            const efficiency = dashboardData.totalJobs
                ? Math.round((dashboardData.completedJobs / dashboardData.totalJobs) * 100)
                : 0;
            const satisfaction = Math.round((dashboardData.avgRating / 5) * 100);
            return {
                success: true,
                message: 'dashboardfetch successfully',
                data: {
                    workerStatus: worker.isVerified,
                    stats: {
                        totalJobs: dashboardData.totalJobs,
                        monthlyEarnings: dashboardData.monthlyEarnings,
                        upcomingJobs: dashboardData.upcomingJobs,
                        averageRating: Number(dashboardData.avgRating.toFixed(1)),
                        totalReviews: dashboardData.totalReviews,
                        todayJobs: dashboardData.todaySchedule.length,
                        efficiency,
                        satisfaction,
                    },
                    todaySchedule: dashboardData.todaySchedule.map((job) => {
                        var _a, _b;
                        return ({
                            bookingId: job._id,
                            time: job.startTime,
                            service: (_a = job.serviceId) === null || _a === void 0 ? void 0 : _a.category,
                            clientName: (_b = job.userId) === null || _b === void 0 ? void 0 : _b.name,
                            status: job.status,
                        });
                    }),
                },
            };
        });
    }
};
exports.WorkerHelperService = WorkerHelperService;
exports.WorkerHelperService = WorkerHelperService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(types_1.TYPES.ServiceRepository)),
    __param(1, (0, tsyringe_1.inject)(types_1.TYPES.WorkingDetailsRepository)),
    __param(2, (0, tsyringe_1.inject)(types_1.TYPES.BookingRepository)),
    __param(3, (0, tsyringe_1.inject)(types_1.TYPES.WorkerRepository)),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], WorkerHelperService);
