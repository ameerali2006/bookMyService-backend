import { JwtPayload } from 'jsonwebtoken';
import { inject, injectable } from 'tsyringe';
import { ITokenservice } from '../../interface/service/token.service.interface';
import { refreshTokenResponse } from '../../dto/shared/helpers.dto';
import { IJwtService } from '../../interface/helpers/jwt-service.service.interface';
import { IRedisTokenService } from '../../interface/service/redis.service.interface';
import { TYPES } from '../../config/constants/types';
import { IRefreshTokenRepository } from '../../interface/repository/refresh-token.repository.interface';
import { CustomError } from '../../utils/custom-error';
import { STATUS_CODES } from '../../config/constants/status-code';
import { MESSAGES } from '../../config/constants/message';

@injectable()
export class TokenService implements ITokenservice {
  constructor(
        @inject(TYPES.RedisTokenService) private _redisTokenRepo:IRedisTokenService,
        @inject(TYPES.JwtService) private _jwtService:IJwtService,
        @inject(TYPES.RefreshTokenRepository)private _refreshTokenRepository: IRefreshTokenRepository,

  ) {}

  async blacklistToken(token: string): Promise<void> {
    try {
      console.log('Token received in blacklistToken:', token, typeof token);
      const decode:string|JwtPayload|null = await this._jwtService.verifyToken(token, 'access');
      if (!decode || typeof decode === 'string' || !decode.exp) {
        throw new Error('Invalid Token: Missing expiration time');
      }
      const expiresIn = decode.exp - Math.floor(Date.now() / 100);
      if (expiresIn > 0) {
        await this._redisTokenRepo.blackListToken(token, expiresIn);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await this._refreshTokenRepository.revokeRefreshToken(token);
  }

  async refreshToken(refreshToken: string):Promise<refreshTokenResponse> {
    const payload = await this._jwtService.verifyToken(refreshToken, 'refresh');
    console.log('refresh tocken request ', payload);
    if (!payload) {
      throw new CustomError(
        MESSAGES.INVALID_TOKEN,
        STATUS_CODES.BAD_REQUEST,
      );
    }
    return {
      role: (payload as JwtPayload).role,
      accessToken: this._jwtService.generateAccessToken((payload as JwtPayload)._id, (payload as JwtPayload).role),
    };
  }
}
