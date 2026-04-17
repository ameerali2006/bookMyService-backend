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
exports.WorkingDetailsRepository = void 0;
const tsyringe_1 = require("tsyringe");
const base_repository_1 = require("./base.repository");
const working_details_model_1 = require("../../model/working-details.model");
let WorkingDetailsRepository = class WorkingDetailsRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(working_details_model_1.WorkingDetails);
    }
    findByWorkerId(workerId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.findOne({ workerId });
        });
    }
    upsertByWorkerId(workerId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield working_details_model_1.WorkingDetails.findOneAndUpdate({ workerId }, { $set: data }, { new: true, upsert: true }));
        });
    }
    updateDaySchedule(workerId, day, daySchedule) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield working_details_model_1.WorkingDetails.findOneAndUpdate({ workerId, 'days.day': day }, { $set: { 'days.$': daySchedule } }, { new: true });
        });
    }
    addHoliday(workerId, holiday) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield working_details_model_1.WorkingDetails.findOneAndUpdate({ workerId }, { $push: { holidays: holiday } }, { new: true });
        });
    }
    removeHoliday(workerId, date) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield working_details_model_1.WorkingDetails.findOneAndUpdate({ workerId }, { $pull: { holidays: { date } } }, { new: true });
        });
    }
    addCustomSlot(workerId, slot) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield working_details_model_1.WorkingDetails.findOneAndUpdate({ workerId }, { $push: { customSlots: slot } }, { new: true });
        });
    }
    removeCustomSlot(workerId, date, startTime) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield working_details_model_1.WorkingDetails.findOneAndUpdate({ workerId }, { $pull: { customSlots: { date, startTime } } }, { new: true });
        });
    }
    addBreak(workerId, day, breakItem) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield working_details_model_1.WorkingDetails.findOneAndUpdate({ workerId, 'days.day': day }, { $push: { 'days.$.breaks': breakItem } }, { new: true });
        });
    }
    removeBreak(workerId, day, label) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield working_details_model_1.WorkingDetails.findOneAndUpdate({ workerId, 'days.day': day }, { $pull: { 'days.$.breaks': { label } } }, { new: true });
        });
    }
    updateStatus(workerId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield working_details_model_1.WorkingDetails.findOneAndUpdate({ workerId }, { $set: { status } }, { new: true });
        });
    }
    clearOverrides(workerId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield working_details_model_1.WorkingDetails.findOneAndUpdate({ workerId }, { $set: { holidays: [], customSlots: [] } }, { new: true });
        });
    }
    updateCalendar(workerId, holidays, customSlots) {
        return __awaiter(this, void 0, void 0, function* () {
            const updateData = {};
            if (holidays)
                updateData.holidays = holidays;
            if (customSlots)
                updateData.customSlots = customSlots;
            console.log('from update ', updateData);
            return yield working_details_model_1.WorkingDetails.findOneAndUpdate({ workerId }, { $set: updateData }, { new: true });
        });
    }
};
exports.WorkingDetailsRepository = WorkingDetailsRepository;
exports.WorkingDetailsRepository = WorkingDetailsRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], WorkingDetailsRepository);
