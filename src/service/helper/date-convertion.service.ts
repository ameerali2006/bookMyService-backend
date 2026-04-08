import { toZonedTime, format } from 'date-fns-tz';
import { injectable } from 'tsyringe';
import { IDateConversionService } from '../../interface/service/date-convertion.service.interface';

@injectable()
export class DateConversionService implements IDateConversionService {
  private readonly IST_TIMEZONE = 'Asia/Kolkata';

  utcToIST(date: Date): Date {
    console.log(`utcToISt:Input:${date}`);
    console.log(`utcToISt:output:${toZonedTime(date, this.IST_TIMEZONE)}`);
    return toZonedTime(date, this.IST_TIMEZONE);
  }

  istToUTC(date: Date): Date {
    const offsetMs = 5.5 * 60 * 60 * 1000;
    console.log(`istToUTC:Input:${date}`);
    console.log(`istToUTC:output:${new Date(date.getTime() - offsetMs)}`);
    return new Date(date.getTime() - offsetMs);
  }

  formatISTTime(date: Date): string {
    const istDate = toZonedTime(date, this.IST_TIMEZONE);
    return istDate.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }

  formatIST(date: Date, pattern = 'yyyy-MM-dd HH:mm:ssXXX'): string {
    const istDate = toZonedTime(date, this.IST_TIMEZONE);
    return format(istDate, pattern, { timeZone: this.IST_TIMEZONE });
  }
}
