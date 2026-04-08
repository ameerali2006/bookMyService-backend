import { Request, Response, NextFunction } from 'express';
import { inject, injectable } from 'tsyringe';
import { IWorkingDetailsController } from '../../interface/controller/working-details.controller.interface';
import { TYPES } from '../../config/constants/types';
import { STATUS_CODES } from '../../config/constants/status-code';
import { MESSAGES } from '../../config/constants/message';
import { CustomError } from '../../utils/custom-error';
import {
  IWorkingDetailsManagement,
  updateWorker,
} from '../../interface/service/worker/workingDetails.service.interface';
import { CustomRequest } from '../../middleware/auth.middleware';
import { workerProfileUpdateSchema } from '../validation/update-worker-profile';
import { changePasswordSchema } from '../validation/change-password.zod';
import { IChangePasswordService } from '../../interface/service/change-password.service.interface';
import { IWalletService } from '../../interface/service/wallet.service.interface';
import { ITransactionService } from '../../interface/service/transaction.service.interface';
import { WalletTransactionQuery } from '../../dto/shared/wallet.dto';

@injectable()
export class WorkingDetailsController implements IWorkingDetailsController {
  constructor(
    @inject(TYPES.WorkingDetailsManagement)
    private _workingManage: IWorkingDetailsManagement,
    @inject(TYPES.ChangePasswordService)
    private _changePassword: IChangePasswordService,
    @inject(TYPES.WalletService) private _walletService: IWalletService,
    @inject(TYPES.TransactionService)
    private _transactionService: ITransactionService,
  ) {}

  async getWorkingDetails(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const email = req.query.email as string;
      console.log(email);
      const details = await this._workingManage.getWorkingDetails(email);
      if (details) {
        res.status(STATUS_CODES.OK).json({
          success: true,
          message: MESSAGES.DATA_SENT_SUCCESS,
          data: details,
        });
      } else {
        res
          .status(STATUS_CODES.BAD_REQUEST)
          .json({ success: false, message: MESSAGES.FORBIDDEN, data: null });
      }
    } catch (error) {
      next(error);
    }
  }

  async updateWorkingDetails(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const email = req.body.email as string;
      const { payload } = req.body;
      console.log(email);
      const details = await this._workingManage.updateWorkingDetails(
        email,
        payload,
      );
      if (details.success) {
        res.status(STATUS_CODES.OK).json({
          success: true,
          message: MESSAGES.DATA_SENT_SUCCESS,
          data: details.data,
        });
      } else {
        res
          .status(STATUS_CODES.BAD_REQUEST)
          .json({ success: false, message: MESSAGES.FORBIDDEN, data: null });
      }
    } catch (error) {
      next(error);
    }
  }

  async getProfileDetails(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const workerId = (req as CustomRequest).user._id;

      const response = await this._workingManage.getProfileDetails(workerId);
      console.log(response);
      if (response.success) {
        res.status(STATUS_CODES.OK).json(response);
      } else {
        res.status(STATUS_CODES.CONFLICT).json(response);
      }
    } catch (error) {
      next(error);
    }
  }

  async updateProfileDetails(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const workerId = (req as CustomRequest).user._id;

      if (!workerId) {
        res.status(STATUS_CODES.UNAUTHORIZED).json({
          success: false,
          message: MESSAGES.VALIDATION_ERROR,
        });
      }

      const parsed = workerProfileUpdateSchema.safeParse(req.body);

      if (!parsed.success) {
        const errors = parsed.error.format();
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: 'Validation failed',
          errors,
        });
      }
      console.log(parsed.data);
      const response = await this._workingManage.updateWorkerProfile(
        workerId,
        parsed.data as updateWorker,
      );
      console.log(response);
      if (response.success) {
        res.status(STATUS_CODES.OK).json(response);
      } else {
        res.status(STATUS_CODES.CONFLICT).json(response);
      }
    } catch (error) {
      next(error);
    }
  }

  async changePassword(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const parsed = changePasswordSchema.parse(req.body);
      const userId = (req as CustomRequest).user?._id;
      const result = await this._changePassword.changePassword(
        'worker',
        userId,
        parsed,
      );
      if (result.success) {
        res.status(STATUS_CODES.OK).json(result);
      } else {
        res.status(STATUS_CODES.CONFLICT).json(result);
      }
    } catch (error) {
      next(error);
    }
  }

  async getCalenderDetails(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const workerId = (req as CustomRequest).user._id;
      const response = await this._workingManage.getCalenderDetails(workerId);
      if (response.success) {
        res.status(STATUS_CODES.OK).json(response);
      } else {
        res.status(STATUS_CODES.CONFLICT).json(response);
      }
    } catch (error) {
      next(error);
    }
  }

  async updateCalenderDetails(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const workerId = (req as CustomRequest).user._id;
      console.log(req.body);
      const { holidays, customSlots } = req.body;
      const result = await this._workingManage.updateCalenderDetails(
        workerId,
        customSlots,
        holidays,
      );
      if (result.success) {
        res.status(STATUS_CODES.OK).json(result);
      } else {
        res.status(STATUS_CODES.CONFLICT).json(result);
      }
    } catch (error) {
      next(error);
    }
  }

  async getWalletData(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const userId = (req as CustomRequest).user._id;
    const { role } = (req as CustomRequest).user;
    console.log(userId, role);
    const wallet = await this._walletService.getWalletData(userId, role);
    console.log(wallet);

    res.status(200).json(wallet);
  }

  async getTransactions(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const userId = (req as CustomRequest).user._id;
    const { role } = (req as CustomRequest).user;
    const query: WalletTransactionQuery = {
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10,

      type: typeof req.query.type === 'string' ? req.query.type : undefined,
      status:
        typeof req.query.status === 'string' ? req.query.status : undefined,

      sortBy:
        typeof req.query.sortBy === 'string' ? req.query.sortBy : 'createdAt',
      sortOrder:
        req.query.sortOrder === 'asc' || req.query.sortOrder === 'desc'
          ? req.query.sortOrder
          : 'desc',

      startDate:
        typeof req.query.startDate === 'string'
          ? req.query.startDate
          : undefined,
      endDate:
        typeof req.query.endDate === 'string' ? req.query.endDate : undefined,
    };
    console.log(userId, role);
    const result = await this._transactionService.getTransactionData(
      userId,
      role,
      query,
    );

    res.status(STATUS_CODES.OK).json(result);
  }
}
