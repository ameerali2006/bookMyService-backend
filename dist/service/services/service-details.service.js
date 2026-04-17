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
exports.ServiceDetails = void 0;
const tsyringe_1 = require("tsyringe");
const types_1 = require("../../config/constants/types");
const status_code_1 = require("../../config/constants/status-code");
const custom_error_1 = require("../../utils/custom-error");
const message_1 = require("../../config/constants/message");
const time_Intervals_1 = require("../../utils/time&Intervals");
let ServiceDetails = class ServiceDetails {
    constructor(_workerAgg, _serviceRepo, _workingDetails, _booking, _workingHelper, _reviewRepo, _workerRepo) {
        this._workerAgg = _workerAgg;
        this._serviceRepo = _serviceRepo;
        this._workingDetails = _workingDetails;
        this._booking = _booking;
        this._workingHelper = _workingHelper;
        this._reviewRepo = _reviewRepo;
        this._workerRepo = _workerRepo;
    }
    getNearByWorkers(serviceId, lat, lng, search, sort, page, pageSize) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!lat || !lng || !serviceId) {
                    throw new Error('Latitude, longitude and serviceId are required');
                }
                console.log({
                    serviceId,
                    lat,
                    lng,
                    search,
                    sort,
                    page,
                    pageSize,
                });
                const data = yield this._workerAgg.findNearbyWorkersByServiceId(serviceId, lat, lng, search, sort, page, pageSize);
                console.log(data);
                if (!data) {
                    return { success: false, message: 'Worker not Found', data: null };
                }
                return { success: true, message: 'Data fetched Successfully', data };
            }
            catch (error) {
                console.error(error);
                return { success: false, message: 'Worker not Found', data: null };
            }
        });
    }
    getServices(lat, lng, maxDistance) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!lat || !lng) {
                    return {
                        status: status_code_1.STATUS_CODES.BAD_REQUEST,
                        success: false,
                        message: 'Latitude and longitude are required',
                    };
                }
                console.log({ lat, lng, maxDistance });
                const nearbyWorkers = yield this._workerAgg.findNearbyWorkers(lat, lng, maxDistance);
                console.log(nearbyWorkers);
                const serviceIds = nearbyWorkers.map((w) => w._id);
                if (serviceIds.length === 0) {
                    return {
                        status: status_code_1.STATUS_CODES.OK,
                        success: true,
                        message: 'No services found nearby',
                        services: [],
                    };
                }
                const services = yield this._serviceRepo.findActiveServicesByIds(serviceIds);
                return {
                    status: status_code_1.STATUS_CODES.OK,
                    success: true,
                    message: 'Nearby services found',
                    services,
                };
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
    rotateDays(days, todayName) {
        const startIndex = days.findIndex((d) => d.day === todayName);
        if (startIndex === -1)
            return days;
        return [...days.slice(startIndex), ...days.slice(0, startIndex)];
    }
    toHM(date) {
        const d = new Date(date);
        return d.toTimeString().substring(0, 5);
    }
    timeToMinutes(time) {
        const [h, m] = time.split(':').map(Number);
        return h * 60 + m;
    }
    getWorkerAvailablity(workerId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            try {
                // 1) Working details
                let details = yield this._workingDetails.findByWorkerId(workerId);
                if (!details) {
                    return {
                        status: 404,
                        success: false,
                        message: 'Working details not found',
                    };
                }
                // 2) Apply week rotation if needed (prefer non-destructive rotation)
                const daysOfWeek = [
                    'Sunday',
                    'Monday',
                    'Tuesday',
                    'Wednesday',
                    'Thursday',
                    'Friday',
                    'Saturday',
                ];
                const today = new Date();
                const todayName = daysOfWeek[today.getDay()];
                if (details.weekStartDay && todayName !== details.weekStartDay) {
                    details = (yield this._workingHelper.rotateDayShedule(String(details._id)));
                }
                const rotatedDays = (_a = details.days) !== null && _a !== void 0 ? _a : [];
                // 3) Batch fetch bookings in one range query for next 7 days
                const startBounds = (0, time_Intervals_1.dayBounds)(today).start;
                const endBounds = new Date(startBounds);
                endBounds.setDate(endBounds.getDate() + 7); // exclusive upper bound
                // Ensure this returns: [{ date, startTime, endTime?, advancePaymentStatus }]
                const bookingsRange = yield this._booking.findByWorkerAndRange(workerId, startBounds, endBounds);
                // 4) Index bookings by local dateKey
                const bookingsByKey = new Map();
                for (const b of bookingsRange !== null && bookingsRange !== void 0 ? bookingsRange : []) {
                    const dk = (0, time_Intervals_1.dateKey)(b.date);
                    if (!bookingsByKey.has(dk))
                        bookingsByKey.set(dk, []);
                    bookingsByKey.get(dk).push({
                        startTime: b.startTime,
                        endTime: (_b = b.endTime) !== null && _b !== void 0 ? _b : null,
                        advancePaymentStatus: b.advancePaymentStatus,
                    });
                }
                // 5) Pre-index holidays & custom slots for O(1) lookup
                const holidaysSet = new Set(((_c = details.holidays) !== null && _c !== void 0 ? _c : []).map((h) => (0, time_Intervals_1.dateKey)(h.date)));
                const customByKey = new Map();
                for (const cs of (_d = details.customSlots) !== null && _d !== void 0 ? _d : []) {
                    const dk = (0, time_Intervals_1.dateKey)(cs.date);
                    if (!customByKey.has(dk))
                        customByKey.set(dk, []);
                    customByKey
                        .get(dk)
                        .push({ startTime: cs.startTime, endTime: cs.endTime });
                }
                // 6) Build 7-day availability
                const results = [];
                for (let i = 0; i < 7; i++) {
                    const target = new Date(startBounds);
                    target.setDate(startBounds.getDate() + i);
                    const dk = (0, time_Intervals_1.dateKey)(target);
                    // Find schedule for this day (safe modulo)
                    const daySchedule = rotatedDays[i % 7];
                    const isHoliday = holidaysSet.has(dk);
                    // ---- Base availability: union(working hours, custom slots) ----
                    let base = [];
                    if (!isHoliday && (daySchedule === null || daySchedule === void 0 ? void 0 : daySchedule.enabled)) {
                        // Working hours
                        base.push({
                            start: (0, time_Intervals_1.toMinutes)(daySchedule.startTime),
                            end: (0, time_Intervals_1.toMinutes)(daySchedule.endTime),
                        });
                        // Custom slots for that day (additional availability)
                        for (const cs of (_e = customByKey.get(dk)) !== null && _e !== void 0 ? _e : []) {
                            base.push({
                                start: (0, time_Intervals_1.toMinutes)(cs.startTime),
                                end: (0, time_Intervals_1.toMinutes)(cs.endTime),
                            });
                        }
                        // Merge & guard invalid ranges
                        base = (0, time_Intervals_1.mergeIntervals)(base.filter((iv) => iv.end > iv.start));
                    }
                    // Breaks
                    const breakCuts = ((_f = daySchedule === null || daySchedule === void 0 ? void 0 : daySchedule.breaks) !== null && _f !== void 0 ? _f : [])
                        .map((b) => ({
                        start: (0, time_Intervals_1.toMinutes)(b.breakStart),
                        end: (0, time_Intervals_1.toMinutes)(b.breakEnd),
                    }))
                        .filter((iv) => iv.end > iv.start);
                    // Booked cuts (with 60-min buffer rule for advance-paid bookings with no endTime)
                    const bookedCuts = ((_g = bookingsByKey.get(dk)) !== null && _g !== void 0 ? _g : [])
                        .map((b) => {
                        const s = (0, time_Intervals_1.toMinutes)(b.startTime);
                        // Case 1: If endTime exists, use it as-is.
                        if (b.endTime) {
                            const e = (0, time_Intervals_1.toMinutes)(b.endTime);
                            return { start: s, end: e };
                        }
                        // Case 2: No endTime, advance paid -> block 60 min buffer.
                        if (b.advancePaymentStatus === 'paid') {
                            return { start: s, end: s + 60 };
                        }
                        // Case 3: No endTime, advance not paid -> ignore (no block).
                        return null;
                    })
                        .filter((iv) => !!iv && iv.end > iv.start);
                    // Available after subtracting breaks & booked
                    let available = (0, time_Intervals_1.subtractIntervals)(base, breakCuts);
                    available = (0, time_Intervals_1.subtractIntervals)(available, bookedCuts);
                    // Build full labeled 00:00–24:00 timeline with priorities
                    const labeled = (0, time_Intervals_1.buildLabeledTimeline)(available, breakCuts, bookedCuts);
                    // Enabled if not holiday, schedule enabled, and has some available segment
                    const enabled = !isHoliday
                        && !!(daySchedule === null || daySchedule === void 0 ? void 0 : daySchedule.enabled)
                        && labeled.some((x) => x.status === 'available');
                    results.push({
                        date: dk,
                        day: (_h = daySchedule === null || daySchedule === void 0 ? void 0 : daySchedule.day) !== null && _h !== void 0 ? _h : target.toLocaleString('en-US', { weekday: 'long' }),
                        enabled,
                        availableTimes: labeled.map((seg) => ({
                            start: (0, time_Intervals_1.fromMinutes)(seg.start),
                            end: (0, time_Intervals_1.fromMinutes)(seg.end),
                            status: seg.status,
                        })),
                    });
                }
                // 7) Return final payload
                return {
                    status: 200,
                    success: true,
                    message: 'Availability fetched successfully',
                    data: { dates: results },
                };
            }
            catch (err) {
                // log err as needed
                return {
                    status: 500,
                    success: false,
                    message: 'Failed to fetch availability',
                };
            }
        });
    }
    getWorkerProfile(workerId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const worker = yield this._workerRepo.findById(workerId);
                if (!worker) {
                    return {
                        success: false,
                        message: 'Worker not found',
                        data: null,
                    };
                }
                const reviews = yield this._reviewRepo.getRecentReviewsByWorker(workerId);
                const ratingSummary = yield this._reviewRepo.getWorkerRatingSummary(workerId);
                const response = Object.assign(Object.assign({}, worker.toObject()), { avgRating: ratingSummary.avgRating, totalReviews: ratingSummary.totalReviews, recentReviews: reviews });
                return {
                    success: true,
                    message: 'Worker profile fetched successfully',
                    data: response,
                };
            }
            catch (error) {
                return {
                    success: false,
                    message: 'Failed to fetch worker profile',
                    data: null,
                };
            }
        });
    }
};
exports.ServiceDetails = ServiceDetails;
exports.ServiceDetails = ServiceDetails = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(types_1.TYPES.WorkerAggregation)),
    __param(1, (0, tsyringe_1.inject)(types_1.TYPES.ServiceRepository)),
    __param(2, (0, tsyringe_1.inject)(types_1.TYPES.WorkingDetailsRepository)),
    __param(3, (0, tsyringe_1.inject)(types_1.TYPES.BookingRepository)),
    __param(4, (0, tsyringe_1.inject)(types_1.TYPES.WorkingHelper)),
    __param(5, (0, tsyringe_1.inject)(types_1.TYPES.ReviewRepository)),
    __param(6, (0, tsyringe_1.inject)(types_1.TYPES.WorkerRepository)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object])
], ServiceDetails);
