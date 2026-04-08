import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { ITokenController } from '../interface/controller/token.controller.interface';
import { CustomRequest } from '../middleware/auth.middleware';
import { clearAuthCookies, updateCookieWithAccessToken } from '../utils/cookie-helper';
import { STATUS_CODES } from '../config/constants/status-code';
import { MESSAGES } from '../config/constants/message';
import { TYPES } from '../config/constants/types';
import { ITokenservice } from '../interface/service/token.service.interface';

@injectable()
export class TokenController implements ITokenController {
  constructor(
        @inject(TYPES.TokenService) private _tokenService:ITokenservice,
  ) {}

  async handleTokenRefresh(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = (req as CustomRequest).user.refresh_token;
      const newTokens = await this._tokenService.refreshToken(refreshToken);
      const accessTokenName = 'access_token';
      updateCookieWithAccessToken(
        res,
        newTokens.accessToken,
        accessTokenName,
      );
      res.status(STATUS_CODES.OK).json({
        success: true,
        message: MESSAGES.UPDATE_SUCCESS,
      });
    } catch (error) {
      clearAuthCookies(
        res,
        'access_token',
        'refresh_token',
      );
      res.status(STATUS_CODES.UNAUTHORIZED).json({
        message: MESSAGES.INVALID_TOKEN,
      });
    }
  }
}
