import { inject, injectable } from 'tsyringe';
import { IBooking } from '../../interface/model/booking.model.interface';
import { IBookingRepository } from '../../interface/repository/booking.repository.interface';
import { IWalletRepository } from '../../interface/repository/wallet.repository.interface';
import { TYPES } from '../../config/constants/types';
import { IWorkerPayoutService } from '../../interface/service/worker/worker-payout.service.interface';
import { IWalletService } from '../../interface/service/wallet.service.interface';

@injectable()
export class WorkerPayoutService implements IWorkerPayoutService {
  constructor(
    @inject(TYPES.BookingRepository)
    private bookingRepo: IBookingRepository,

     @inject(TYPES.WalletService)
    private walletService: IWalletService,

  ) {}

  private calculateWorkerAmount(booking: IBooking): number {
    const commissionRate = 0.1;

    const base = booking.totalAmount || 0;

    const additional = booking.additionalItems?.reduce((sum, item) => sum + item.price, 0) || 0;

    const total = base + additional;

    return total - total * commissionRate;
  }

  async processPayouts(): Promise<void> {
    const bookings = await this.bookingRepo.findUnsettledCompleted();

    const workerMap = new Map<string, number>();

    for (const booking of bookings) {
      const amount = this.calculateWorkerAmount(booking);
      const workerId = booking.workerId.toString();

      workerMap.set(workerId, (workerMap.get(workerId) || 0) + amount);
    }

    for (const [workerId, amount] of workerMap) {
      await this.walletService.addBalance({
        userId: workerId,
        role: 'worker',
        amount,
        description: 'Booking payout (cron)',
      });
    }
    await this.bookingRepo.markAsSettled(
      bookings.map((b) => b._id.toString()),
    );
  }
}
