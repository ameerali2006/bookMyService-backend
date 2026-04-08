import cron from 'node-cron';
import { container } from 'tsyringe';
import { WorkerPayoutService } from '../service/worker/worker-payout.service';
import { ENV } from '../config/env/env';

export const initWorkerPayoutJob = () => {
  const payoutService = container.resolve(WorkerPayoutService);

  let isRunning = false;

  const schedule = ENV.CRON_JOB_DURATION;

  cron.schedule(
    schedule,
    async () => {
      if (isRunning) {
        console.log('Payout job already running, skipping...');
        return;
      }

      isRunning = true;

      console.log('Running worker payout job...');

      try {
        await payoutService.processPayouts();
        console.log('Payout job completed');
      } catch (error) {
        console.error('Payout job failed:', error);
      } finally {
        isRunning = false;
      }
    },
    {
      timezone: 'Asia/Kolkata',
    },
  );
};
