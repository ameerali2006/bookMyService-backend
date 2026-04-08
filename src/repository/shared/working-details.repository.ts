import { injectable } from 'tsyringe';
import { BaseRepository } from './base.repository';
import {
  ICustomSlot, IHoliday, IWorkingDetails, IWorkingDetailsDocument,
} from '../../interface/model/working-details.interface';
import { IWorkingDetailsRepository } from '../../interface/repository/working-details.interface';
import { WorkingDetails } from '../../model/working-details.model';

@injectable()
export class WorkingDetailsRepository
  extends BaseRepository<IWorkingDetailsDocument>
  implements IWorkingDetailsRepository {
  constructor() {
    super(WorkingDetails);
  }

  async findByWorkerId(workerId: string): Promise<IWorkingDetails | null> {
    return this.findOne({ workerId });
  }

  async upsertByWorkerId(
    workerId: string,
    data: Partial<IWorkingDetails>,
  ): Promise<IWorkingDetails> {
    return (await WorkingDetails.findOneAndUpdate(
      { workerId },
      { $set: data },
      { new: true, upsert: true },
    )) as IWorkingDetails;
  }

  async updateDaySchedule(
    workerId: string,
    day: string,
    daySchedule: Partial<IWorkingDetails['days'][0]>,
  ): Promise<IWorkingDetails | null> {
    return await WorkingDetails.findOneAndUpdate(
      { workerId, 'days.day': day },
      { $set: { 'days.$': daySchedule } },
      { new: true },
    );
  }

  async addHoliday(
    workerId: string,
    holiday: { date: Date; reason?: string },
  ): Promise<IWorkingDetails | null> {
    return await WorkingDetails.findOneAndUpdate(
      { workerId },
      { $push: { holidays: holiday } },
      { new: true },
    );
  }

  async removeHoliday(
    workerId: string,
    date: Date,
  ): Promise<IWorkingDetails | null> {
    return await WorkingDetails.findOneAndUpdate(
      { workerId },
      { $pull: { holidays: { date } } },
      { new: true },
    );
  }

  async addCustomSlot(
    workerId: string,
    slot: { date: Date; startTime: Date; endTime: Date },
  ): Promise<IWorkingDetails | null> {
    return await WorkingDetails.findOneAndUpdate(
      { workerId },
      { $push: { customSlots: slot } },
      { new: true },
    );
  }

  async removeCustomSlot(
    workerId: string,
    date: Date,
    startTime: Date,
  ): Promise<IWorkingDetails | null> {
    return await WorkingDetails.findOneAndUpdate(
      { workerId },
      { $pull: { customSlots: { date, startTime } } },
      { new: true },
    );
  }

  async addBreak(
    workerId: string,
    day: string,
    breakItem: { label: string; breakStart: Date; breakEnd: Date },
  ): Promise<IWorkingDetails | null> {
    return await WorkingDetails.findOneAndUpdate(
      { workerId, 'days.day': day },
      { $push: { 'days.$.breaks': breakItem } },
      { new: true },
    );
  }

  async removeBreak(
    workerId: string,
    day: string,
    label: string,
  ): Promise<IWorkingDetails | null> {
    return await WorkingDetails.findOneAndUpdate(
      { workerId, 'days.day': day },
      { $pull: { 'days.$.breaks': { label } } },
      { new: true },
    );
  }

  async updateStatus(
    workerId: string,
    status: 'active' | 'inactive' | 'paused',
  ): Promise<IWorkingDetails | null> {
    return await WorkingDetails.findOneAndUpdate(
      { workerId },
      { $set: { status } },
      { new: true },
    );
  }

  async clearOverrides(workerId: string): Promise<IWorkingDetails | null> {
    return await WorkingDetails.findOneAndUpdate(
      { workerId },
      { $set: { holidays: [], customSlots: [] } },
      { new: true },
    );
  }

  async updateCalendar(
    workerId: string,
    holidays?: IHoliday[],
    customSlots?: ICustomSlot[],
  ): Promise<IWorkingDetails | null> {
    const updateData: { holidays?: IHoliday[], customSlots?: ICustomSlot[]} = {};
    if (holidays) updateData.holidays = holidays;
    if (customSlots) updateData.customSlots = customSlots;
    console.log('from update ', updateData);

    return await WorkingDetails.findOneAndUpdate(
      { workerId },
      { $set: updateData },
      { new: true },
    );
  }
}
