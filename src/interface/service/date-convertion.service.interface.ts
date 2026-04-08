export interface IDateConversionService {
  utcToIST(date: Date): Date;
  istToUTC(date: Date): Date;
  formatISTTime(date: Date): string;
  formatIST(date: Date, pattern?: string): string;
}
