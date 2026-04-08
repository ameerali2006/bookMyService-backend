import { model, Schema } from 'mongoose';
import {
  IBreak,
  ICustomSlot,
  IDaySchedule,
  IHoliday,
  IWorkingDetails,
} from '../interface/model/working-details.interface';

export enum WeekDay {
  MONDAY = 'Monday',
  TUESDAY = 'Tuesday',
  WEDNESDAY = 'Wednesday',
  THURSDAY = 'Thursday',
  FRIDAY = 'Friday',
  SATURDAY = 'Saturday',
  SUNDAY = 'Sunday',
}

const BreakSchema = new Schema<IBreak>(
  {
    label: { type: String, required: true },
    breakStart: { type: String, required: true },
    breakEnd: { type: String, required: true },
  },
  { _id: false },
);

const DayScheduleSchema = new Schema<IDaySchedule>(
  {
    day: { type: String, required: true },
    enabled: { type: Boolean, default: true },
    date: { type: Date },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    breaks: { type: [BreakSchema], default: [] },
  },
  { _id: false },
);

const HolidaySchema = new Schema<IHoliday>(
  {
    date: { type: Date, required: true },
    reason: { type: String },
  },
  { _id: false },
);

const CustomSlotSchema = new Schema<ICustomSlot>(
  {
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },
  { _id: false },
);

const WorkingDetailsSchema = new Schema<IWorkingDetails>(
  {
    workerId: {
      type: Schema.Types.ObjectId, ref: 'Worker', required: true, unique: true,
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
  },
  { timestamps: true },
);

export const WorkingDetails = model<IWorkingDetails>(
  'WorkingDetails',
  WorkingDetailsSchema,
);
