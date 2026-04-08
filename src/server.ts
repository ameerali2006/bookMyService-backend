import 'reflect-metadata';
import { connectDB } from './config/db';
import { connectRedis } from './config/redis';
import { ENV } from './config/env/env';
import { socketServer } from './config/socketServer';
import { initWorkerPayoutJob } from './jobs/worker-payout';

const port = ENV.PORT || 5000;

const startServer = async (): Promise<void> => {
  try {
    await connectDB();
    await connectRedis();

    socketServer.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
      initWorkerPayoutJob();
    });
  } catch (error) {
    console.error('❌ Server startup error:', error);
  }
};

startServer();
