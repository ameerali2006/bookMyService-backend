import { createClient } from 'redis';
import { ENV } from './env/env';

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on('error', (err) => {
  console.log(err)
  console.error('❌ Redis Client Error:', err);
});

const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log('✅ Redis connected');
  } catch (error) {
    console.error('❌ Failed to connect to Redis:', error);
  }
};

export { connectRedis, redisClient };
