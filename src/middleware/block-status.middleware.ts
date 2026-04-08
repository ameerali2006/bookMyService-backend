import { inject, injectable } from 'tsyringe';
import { NextFunction, Response } from 'express';
import { TYPES } from '../config/constants/types';
import { ITokenservice } from '../interface/service/token.service.interface';
import { IUserRepository } from '../interface/repository/user.repository.interface';
import { IWorkerRepository } from '../interface/repository/worker.repository.interface';
import { CustomError } from '../utils/custom-error';
import { MESSAGES } from '../config/constants/message';
import { STATUS_CODES } from '../config/constants/status-code';
import { CustomRequest } from './auth.middleware';
import { clearAuthCookies } from '../utils/cookie-helper';

@injectable()
export class BlockStatusMiddleware {
  constructor(
        @inject(TYPES.TokenService) private _tokenService:ITokenservice,
        @inject(TYPES.AuthUserRepository) private _userRepo:IUserRepository,
        @inject(TYPES.WorkerRepository) private _workerRepo:IWorkerRepository,

  ) {}

  private async getUserStatus(userId: string, role: string) {
    const repo = {
      user: this._userRepo,
      worker: this._workerRepo,

    }[role] || null;

    if (!repo) {
      throw new CustomError(
        MESSAGES.BAD_REQUEST,
        STATUS_CODES.BAD_REQUEST,
      );
    }

    const user = await repo.findOne({ userId });
    return user?.isBlocked;
  }

  checkStatus = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      if (!req.user) {
        return res.status(STATUS_CODES.UNAUTHORIZED).json({
          status: 'error',
          message: 'Unauthorized: No user found in request',
        });
      }

      const {
        userId, role, access_token, refresh_token,
      } = req.user;
      if (!['user', 'worker'].includes(role)) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.INVALID_CREDENTIALS,
        });
      }

      const status = await this.getUserStatus(userId, role);
      if (status == null) {
        console.log('ividdennu preshnam');
        return res.status(STATUS_CODES.NOT_FOUND).json({
          success: false,
          message: MESSAGES.USER_NOT_FOUND,
        });
      }

      if (status) {
        await Promise.all([
          this._tokenService.blacklistToken(access_token),
          this._tokenService.revokeRefreshToken(refresh_token),
        ]);
        clearAuthCookies(
          res,
          'access_token',
          'refresh_token',
        );

        return res.status(STATUS_CODES.FORBIDDEN).json({
          success: false,
          message: 'Access denied: Your account has been blocked',
        });
      }

      next();
    } catch (error) {
      console.error('Block Status Middleware Error:', error);
      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Internal server error while checking blocked status',
      });
    }
  };
}
