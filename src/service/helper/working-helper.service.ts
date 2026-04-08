import { inject, injectable } from 'tsyringe';
import { addDays } from 'date-fns';
import { IWorkingHelper } from '../../interface/service/working-helper.service.interface';
import { TYPES } from '../../config/constants/types';
import { IWorkingDetailsRepository } from '../../interface/repository/working-details.interface';
import {
  IWorkingDetails,
  WeekDay,
} from '../../interface/model/working-details.interface';

@injectable()
export class WorkingHelper implements IWorkingHelper {
  constructor(
    @inject(TYPES.WorkingDetailsRepository)
    private _workingRepo: IWorkingDetailsRepository,
  ) {}

  async rotateDayShedule(workingId: string): Promise<IWorkingDetails | null> {
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
    const details = await this._workingRepo.findById(workingId);
    if (!details) {
      return null;
    }
    const getNextDayDate = (targetDayIndex: number, fromDate: Date) => {
      const diff = (targetDayIndex - fromDate.getDay() + 7) % 7;
      return addDays(fromDate, diff);
    };

    details.days = details.days.map((d) => {
      const dayIndex = daysOfWeek.indexOf(d.day);
      const date = getNextDayDate(dayIndex, today);

      const { startTime } = d;
      const { endTime } = d;

      return {
        ...d, date, startTime, endTime, enabled: d.enabled ?? false,
      };
    });
    details.weekStartDay = daysOfWeek[new Date().getDay()] as WeekDay;

    return await details.save();
  }
}
