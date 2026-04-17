"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkingDetails = exports.WeekDay = void 0;
const mongoose_1 = require("mongoose");
var WeekDay;
(function (WeekDay) {
    WeekDay["MONDAY"] = "Monday";
    WeekDay["TUESDAY"] = "Tuesday";
    WeekDay["WEDNESDAY"] = "Wednesday";
    WeekDay["THURSDAY"] = "Thursday";
    WeekDay["FRIDAY"] = "Friday";
    WeekDay["SATURDAY"] = "Saturday";
    WeekDay["SUNDAY"] = "Sunday";
})(WeekDay || (exports.WeekDay = WeekDay = {}));
const BreakSchema = new mongoose_1.Schema({
    label: { type: String, required: true },
    breakStart: { type: String, required: true },
    breakEnd: { type: String, required: true },
}, { _id: false });
const DayScheduleSchema = new mongoose_1.Schema({
    day: { type: String, required: true },
    enabled: { type: Boolean, default: true },
    date: { type: Date },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    breaks: { type: [BreakSchema], default: [] },
}, { _id: false });
const HolidaySchema = new mongoose_1.Schema({
    date: { type: Date, required: true },
    reason: { type: String },
}, { _id: false });
const CustomSlotSchema = new mongoose_1.Schema({
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
}, { _id: false });
const WorkingDetailsSchema = new mongoose_1.Schema({
    workerId: {
        type: mongoose_1.Schema.Types.ObjectId, ref: 'Worker', required: true, unique: true,
    },
    status: { type: String, enum: ['active', 'inactive', 'paused'], default: 'active' },
    maxAppointmentsPerDay: { type: Number, default: null },
    breakEnforced: { type: Boolean, default: true },
    weekStartDay: { type: String, enum: Object.values(WeekDay), default: WeekDay.MONDAY },
    defaultSlotDuration: { type: Number, default: 60 },
    autoAcceptBookings: { type: Boolean, default: false },
    notes: { type: String },
    days: { type: [DayScheduleSchema], required: true },
    holidays: { type: [HolidaySchema], default: [] },
    customSlots: { type: [CustomSlotSchema], default: [] },
}, { timestamps: true });
exports.WorkingDetails = (0, mongoose_1.model)('WorkingDetails', WorkingDetailsSchema);
