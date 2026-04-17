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
exports.WorkingHelper = void 0;
const tsyringe_1 = require("tsyringe");
const date_fns_1 = require("date-fns");
const types_1 = require("../../config/constants/types");
let WorkingHelper = class WorkingHelper {
    constructor(_workingRepo) {
        this._workingRepo = _workingRepo;
    }
    rotateDayShedule(workingId) {
        return __awaiter(this, void 0, void 0, function* () {
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
            const details = yield this._workingRepo.findById(workingId);
            if (!details) {
                return null;
            }
            const getNextDayDate = (targetDayIndex, fromDate) => {
                const diff = (targetDayIndex - fromDate.getDay() + 7) % 7;
                return (0, date_fns_1.addDays)(fromDate, diff);
            };
            details.days = details.days.map((d) => {
                var _a;
                const dayIndex = daysOfWeek.indexOf(d.day);
                const date = getNextDayDate(dayIndex, today);
                const { startTime } = d;
                const { endTime } = d;
                return Object.assign(Object.assign({}, d), { date, startTime, endTime, enabled: (_a = d.enabled) !== null && _a !== void 0 ? _a : false });
            });
            details.weekStartDay = daysOfWeek[new Date().getDay()];
            return yield details.save();
        });
    }
};
exports.WorkingHelper = WorkingHelper;
exports.WorkingHelper = WorkingHelper = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(types_1.TYPES.WorkingDetailsRepository)),
    __metadata("design:paramtypes", [Object])
], WorkingHelper);
