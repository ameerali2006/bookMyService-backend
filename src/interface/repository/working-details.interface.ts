import { FilterQuery } from 'mongoose';
import { ICustomSlot, IHoliday, IWorkingDetails } from '../model/working-details.interface';
import { IBaseRepository } from './base.repository.interface';

export interface IWorkingDetailsRepository extends IBaseRepository<IWorkingDetails> {

  findByWorkerId(workerId: string): Promise<IWorkingDetails | null>;
  upsertByWorkerId(
    workerId: string,
    data: Partial<IWorkingDetails>
  ): Promise<IWorkingDetails>;
  updateDaySchedule(
    workerId: string,
    day: string,
    daySchedule: Partial<IWorkingDetails['days'][0]>
  ): Promise<IWorkingDetails | null>;
  addHoliday(
    workerId: string,
    holiday: { date: Date; reason?: string }
  ): Promise<IWorkingDetails | null>;
  removeHoliday(
    workerId: string,
    date: Date
  ): Promise<IWorkingDetails | null>;
  addCustomSlot(
    workerId: string,
    slot: { date: Date; startTime: Date; endTime: Date }
  ): Promise<IWorkingDetails | null>;
  removeCustomSlot(
    workerId: string,
    date: Date,
    startTime: Date
  ): Promise<IWorkingDetails | null>;
  addBreak(
    workerId: string,
    day: string,
    breakItem: { label: string; breakStart: Date; breakEnd: Date }
  ): Promise<IWorkingDetails | null>;
  removeBreak(
    workerId: string,
    day: string,
    label: string
  ): Promise<IWorkingDetails | null>;
  updateStatus(
    workerId: string,
    status: 'active' | 'inactive' | 'paused'
  ): Promise<IWorkingDetails | null>;
  clearOverrides(workerId: string): Promise<IWorkingDetails | null>;
  updateCalendar(
      workerId: string,
      holidays?: IHoliday[],
      customSlots?: ICustomSlot[]
    ): Promise<IWorkingDetails | null>
}
