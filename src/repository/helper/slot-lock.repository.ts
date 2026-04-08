import mongoose from 'mongoose';
import { injectable } from 'tsyringe';
import { SlotLockModel } from '../../model/slot-lock.model';
import { ISlotLockRepository } from '../../interface/repository/slot-lock.repository.interface';
import { normalizeDay } from '../../utils/time&Intervals';

@injectable()
export class SlotLockRepository implements ISlotLockRepository {
  async acquireLock(
    workerId: string,
    date:Date,
    startTime: Date,
    endTime: Date,
    userId: string,
  ): Promise<boolean> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const bookingDay = normalizeDay(date);
      const conflict = await SlotLockModel.findOne({
        workerId,
        date: bookingDay,
        startTime: { $lt: endTime },
        endTime: { $gt: startTime },
      }).session(session);

      if (conflict) {
        await session.abortTransaction();
        return false;
      }

      /* 🔐 LOCK SLOT */
      await SlotLockModel.create([{
        workerId,
        date: bookingDay,
        startTime,
        endTime,
        lockedBy: userId,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      }], { session });

      await session.commitTransaction();
      return true;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  async releaseLock(workerId: string, startTime: Date): Promise<void> {
    await SlotLockModel.deleteOne({ workerId, startTime });
  }
}
