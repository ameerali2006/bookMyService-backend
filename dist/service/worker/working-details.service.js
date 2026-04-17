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
exports.WorkingDetailsManagement = void 0;
const tsyringe_1 = require("tsyringe");
const date_fns_1 = require("date-fns");
const types_1 = require("../../config/constants/types");
const message_1 = require("../../config/constants/message");
const custom_error_1 = require("../../utils/custom-error");
const status_code_1 = require("../../config/constants/status-code");
const worker_mapper_1 = require("../../utils/mapper/worker-mapper");
let WorkingDetailsManagement = class WorkingDetailsManagement {
    constructor(_workingRepo, _workerRepo, _dateService, _workingHelper) {
        this._workingRepo = _workingRepo;
        this._workerRepo = _workerRepo;
        this._dateService = _dateService;
        this._workingHelper = _workingHelper;
    }
    getWorkingDetails(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const worker = yield this._workerRepo.findByEmail(email);
            if (!worker)
                throw new Error("Worker not found");
            let details = yield this._workingRepo.findByWorkerId(worker._id.toString());
            const daysOfWeek = [
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
            ];
            // --- Helper to format Date to IST ---
            if (!details) {
                // create default 9–5 days
                const today = new Date().getDay();
                const dayOrder = [
                    ...daysOfWeek.slice(today),
                    ...daysOfWeek.slice(0, today),
                ];
                const defaultDays = dayOrder.map((day, i) => {
                    const date = (0, date_fns_1.addDays)(new Date(), i);
                    const startTime = "09:00";
                    const endTime = "17:00";
                    return {
                        day,
                        date,
                        enabled: false,
                        startTime,
                        endTime,
                        breaks: [],
                    };
                });
                details = yield this._workingRepo.create({
                    workerId: worker._id,
                    status: "active",
                    days: defaultDays,
                    weekStartDay: dayOrder[0],
                    breakEnforced: true,
                    defaultSlotDuration: 60,
                    autoAcceptBookings: false,
                    notes: "",
                    holidays: [],
                    customSlots: [],
                });
            }
            else if (daysOfWeek[new Date().getDay()] !== details.weekStartDay) {
                details = (yield this._workingHelper.rotateDayShedule(String(details._id)));
            }
            console.log("before convertion", details);
            // --- Convert all times to IST (return clean JSON) ---
            const plainDetails = details.toObject ? details.toObject() : Object.assign({}, details);
            const convertedDays = plainDetails.days.map((d) => (Object.assign(Object.assign({}, d), { startTime: d.startTime, endTime: d.endTime, breaks: (d.breaks || []).map((b) => (Object.assign(Object.assign({}, b), { breakStart: b.breakStart, breakEnd: b.breakEnd }))) })));
            console.log("converted data", ...convertedDays);
            const result = Object.assign(Object.assign({}, plainDetails), { days: convertedDays });
            console.log("final response:", result);
            return result;
        });
    }
    updateWorkingDetails(email, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const worker = yield this._workerRepo.findByEmail(email);
                if (!worker) {
                    return { success: false, message: message_1.MESSAGES.USER_NOT_FOUND, data: null };
                }
                const normalizedPayload = Object.assign(Object.assign({}, payload), { startTime: payload.startTime, endTime: payload.endTime, breaks: ((_a = payload.breaks) === null || _a === void 0 ? void 0 : _a.map((b) => (Object.assign(Object.assign({}, b), { breakStart: b.breakStart, breakEnd: b.breakEnd })))) || [] });
                const details = yield this._workingRepo.upsertByWorkerId(worker._id.toString(), normalizedPayload);
                if (!details) {
                    return {
                        success: false,
                        message: message_1.MESSAGES.RESOURCE_NOT_FOUND,
                        data: null,
                    };
                }
                return {
                    success: true,
                    message: message_1.MESSAGES.DATA_SENT_SUCCESS,
                    data: details,
                };
            }
            catch (_error) {
                throw new custom_error_1.CustomError(message_1.MESSAGES.BAD_REQUEST, status_code_1.STATUS_CODES.BAD_REQUEST);
            }
        });
    }
    getProfileDetails(workerId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!workerId) {
                    return {
                        success: false,
                        message: "Worker is Not Found",
                        worker: null,
                    };
                }
                const workerData = yield this._workerRepo.findByIdAndPopulate(workerId, [
                    { path: "category", select: "category" },
                ]);
                if (!workerData) {
                    return {
                        success: false,
                        message: "Worker is Not Found",
                        worker: null,
                    };
                }
                const worker = worker_mapper_1.WorkerMapper.mapWorkerToProfileDTO(workerData);
                return { success: true, message: "fetch data successfully", worker };
            }
            catch (_error) {
                throw new custom_error_1.CustomError(message_1.MESSAGES.BAD_REQUEST, status_code_1.STATUS_CODES.BAD_REQUEST);
            }
        });
    }
    updateWorkerProfile(workerId, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(updateData);
                const worker = yield this._workerRepo.findById(workerId);
                if (!worker) {
                    return {
                        success: false,
                        message: message_1.MESSAGES.USER_NOT_FOUND,
                        worker: null,
                    };
                }
                const updatedWorker = yield this._workerRepo.updateById(workerId, updateData);
                console.log(updatedWorker);
                if (!updatedWorker) {
                    return {
                        success: false,
                        message: "Failed to update worker profile",
                        worker: null,
                    };
                }
                const workerDTO = worker_mapper_1.WorkerMapper.mapWorkerToProfileDTO(updatedWorker);
                return {
                    success: true,
                    message: "Worker profile updated successfully",
                    worker: workerDTO,
                };
            }
            catch (_error) {
                throw new custom_error_1.CustomError(message_1.MESSAGES.BAD_REQUEST, status_code_1.STATUS_CODES.BAD_REQUEST);
            }
        });
    }
    getCalenderDetails(workerId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!workerId) {
                    return {
                        success: false,
                        message: message_1.MESSAGES.USER_NOT_FOUND,
                        customSlots: null,
                        holidays: null,
                    };
                }
                const workingDetails = yield this._workingRepo.findByWorkerId(workerId);
                if (!workingDetails) {
                    return {
                        success: false,
                        message: message_1.MESSAGES.USER_NOT_FOUND,
                        customSlots: null,
                        holidays: null,
                    };
                }
                const { holidays } = workingDetails;
                const { customSlots } = workingDetails;
                return {
                    success: true,
                    message: message_1.MESSAGES.DATA_SENT_SUCCESS,
                    customSlots,
                    holidays,
                };
            }
            catch (_error) {
                throw new custom_error_1.CustomError(message_1.MESSAGES.BAD_REQUEST, status_code_1.STATUS_CODES.BAD_REQUEST);
            }
        });
    }
    updateCalenderDetails(workerId, customSlots, holidays) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!workerId) {
                    return {
                        success: false,
                        message: message_1.MESSAGES.USER_NOT_FOUND,
                        customSlots: null,
                        holidays: null,
                    };
                }
                if (!customSlots || !holidays) {
                    return {
                        success: false,
                        message: "Data not found",
                        customSlots: null,
                        holidays: null,
                    };
                }
                const updated = yield this._workingRepo.updateCalendar(workerId, holidays, customSlots);
                if (!updated) {
                    return {
                        success: false,
                        message: message_1.MESSAGES.ACTION_FAILED,
                        customSlots: null,
                        holidays: null,
                    };
                }
                return {
                    success: true,
                    message: message_1.MESSAGES.UPDATE_SUCCESS,
                    customSlots: updated.customSlots,
                    holidays: updated.holidays,
                };
            }
            catch (_error) {
                throw new custom_error_1.CustomError(message_1.MESSAGES.BAD_REQUEST, status_code_1.STATUS_CODES.BAD_REQUEST);
            }
        });
    }
};
exports.WorkingDetailsManagement = WorkingDetailsManagement;
exports.WorkingDetailsManagement = WorkingDetailsManagement = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(types_1.TYPES.WorkingDetailsRepository)),
    __param(1, (0, tsyringe_1.inject)(types_1.TYPES.WorkerRepository)),
    __param(2, (0, tsyringe_1.inject)(types_1.TYPES.DateConversionService)),
    __param(3, (0, tsyringe_1.inject)(types_1.TYPES.WorkingHelper)),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], WorkingDetailsManagement);
