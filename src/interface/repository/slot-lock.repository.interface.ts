export interface ISlotLockRepository {
  acquireLock(

    workerId: string,
    date:Date,
    startTime: Date,
    endTime: Date,
    userId: string
  ): Promise<boolean>;

  releaseLock(workerId: string, startTime: Date): Promise<void>;
}
