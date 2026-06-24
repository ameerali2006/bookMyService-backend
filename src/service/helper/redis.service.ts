import { MESSAGES } from '../../config/constants/message';
import { injectable } from 'tsyringe';
import { redisClient } from '../../config/redis';

import { CustomError } from '../../utils/custom-error';
import { IRedisTokenService } from '../../interface/service/redis.service.interface';

@injectable()
export class RedisTokenService implements IRedisTokenService {
  async blackListToken(token: string, expiresIn: number): Promise<void> {
    if (typeof token !== 'string') {
      console.error('Invalid token type:', typeof token, token);
      throw new Error(MESSAGES.TOKEN_MUST_BE_A_STRING);
    }

    await redisClient.set(token, 'blacklisted', { EX: expiresIn });
  }

  async isTokenBlackListed(token: string): Promise<boolean> {
    const result = await redisClient.get(token);
    return result === 'blacklisted';
  }

  // Reset token
  async storeResetToken(userId: string, token: string): Promise<void> {
    const key = `reset_token:${userId}`;
    try {
      const res = await redisClient.setEx(key, 300, token);
      console.log('Reset token stored in Redis.', res);
    } catch (err) {
      console.error('Redis setEx failed:', err);
      throw new CustomError(MESSAGES.FAILED_TO_STORE_TOKEN_IN_REDIS, 500); // real reason
    }
  }

  async verifyResetToken(userId: string, token: string): Promise<boolean> {
    const key = `reset_token:${userId}`;
    const storedToken = await redisClient.get(key);
    console.log('🔍 Stored token from Redis:', storedToken);
    console.log('🔐 Token from URL:', token);
    return storedToken === token;
  }

  async deleteResetToken(userId: string) {
    const key = `reset_token:${userId}`;
    await redisClient.del(key);
  }
}
