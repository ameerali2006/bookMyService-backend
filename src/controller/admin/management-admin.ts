import { Request, Response, NextFunction } from 'express';
import { inject, injectable } from 'tsyringe';
import { LoginDto } from '../../dto/shared/login.dto';
import { IAdminManagementController } from '../../interface/controller/management-admin.controller.interface';
import { STATUS_CODES } from '../../config/constants/status-code';
import { MESSAGES } from '../../config/constants/message';
import { TYPES } from '../../config/constants/types';
import { IManagementAdminService } from '../../interface/service/management-admin.service.interface';
import { CustomError } from '../../utils/custom-error';
import { serviceRegistrationSchema } from '../validation/service-create';
import { CustomRequest } from '../../middleware/auth.middleware';
import { ITransactionService } from '../../interface/service/transaction.service.interface';
import { IWalletService } from '../../interface/service/wallet.service.interface';
import { WalletTransactionQuery } from '../../dto/shared/wallet.dto';

@injectable()
export class ManagementAdmin implements IAdminManagementController {
  constructor(
    @inject(TYPES.ManagementAdminService)
    private _adminManagement: IManagementAdminService,
    @inject(TYPES.WalletService) private _walletService: IWalletService,
    @inject(TYPES.TransactionService)
    private _transactionService: ITransactionService,
  ) {}

  async getAllUsers(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || '';
      const sortBy = (req.query.sortBy as string) || 'createdAt';
      const sortOrder = (req.query.sortOrder as string) === 'asc' ? 'asc' : 'desc';

      const data = await this._adminManagement.getAllUsers(
        'user',
        page,
        limit,
        search,
        sortBy,
        sortOrder,
      );
      console.log(data);
      res.status(STATUS_CODES.OK).json({ success: true, ...data });
    } catch (error) {
      res
        .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ message: 'Failed to get users', error });
      next(error);
    }
  }

  async updateUserStatus(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      console.log(req.params, req.body);
      const { userId } = req.params;
      const status = req.body.isActive;
      console.log(userId, status);
      const updated = await this._adminManagement.updateStatus(
        userId,
        status,
        'user',
      );
      if (!updated) {
        res.status(STATUS_CODES.BAD_REQUEST || 400).json({
          success: false,

          message: 'User updation failed',
        });
      }
      res.status(STATUS_CODES.OK || 200).json({
        success: true,

        message: `User ${updated?.isBlocked ? 'activated' : 'blocked'} successfully`,
      });
    } catch (error) {
      const statusCode = error instanceof CustomError
        ? error.statusCode
        : STATUS_CODES.INTERNAL_SERVER_ERROR;
      const message = error instanceof Error ? error.message : 'Failed to update user status';
      res.status(statusCode).json({
        success: false,
        message,
      });
      next(error);
    }
  }

  async getAllWorkers(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || '';
      const sortBy = (req.query.sortBy as string) || 'createdAt';
      const sortOrder = (req.query.sortOrder as string) === 'asc' ? 'asc' : 'desc';

      const data = await this._adminManagement.getAllUsers(
        'worker',
        page,
        limit,
        search,
        sortBy,
        sortOrder,
      );
      console.log(data);
      res.status(STATUS_CODES.OK).json({ success: true, ...data });
    } catch (error) {
      res
        .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ message: 'Failed to get users', error });
      next(error);
    }
  }

  async updateWorkerStatus(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      console.log(req.params, req.body);
      const { userId } = req.params;
      const status = req.body.isActive;
      console.log(userId, status);
      const updated = await this._adminManagement.updateStatus(
        userId,
        status,
        'worker',
      );
      if (!updated) {
        res.status(STATUS_CODES.BAD_REQUEST || 400).json({
          success: false,

          message: 'User updation failed',
        });
      }
      res.status(STATUS_CODES.OK || 200).json({
        success: true,

        message: `User ${updated?.isBlocked ? 'activated' : 'blocked'} successfully`,
      });
    } catch (error) {
      const statusCode = error instanceof CustomError
        ? error.statusCode
        : STATUS_CODES.INTERNAL_SERVER_ERROR;
      const message = error instanceof Error ? error.message : 'Failed to update user status';
      res.status(statusCode).json({
        success: false,
        message,
      });
      next(error);
    }
  }

  async unVerifiedWorkers(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      console.log('unverified controller');
      const { page = 1, pageSize = 10 } = req.query;
      const data = await this._adminManagement.getUnverifiedWorkers(
        Number(page),
        Number(pageSize),
        'pending',
      );

      res.status(STATUS_CODES.OK).json({ success: true, ...data });
    } catch (error) {
      throw error instanceof CustomError
        ? error
        : new CustomError(
          'Failed to unverified workers',
          STATUS_CODES.INTERNAL_SERVER_ERROR,
        );
    }
  }

  async verifyWorker(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      console.log(req.params);
      const { workerId } = req.params;
      const { status } = req.body;
      console.log({ workerId });

      if (!['approved', 'rejected'].includes(status)) {
        res
          .status(STATUS_CODES.BAD_REQUEST)
          .json({ success: false, message: 'Invalid status' });
      }
      console.log('kjhdk');
      const worker = await this._adminManagement.verifyWorker(
        workerId,
        status as 'approved' | 'rejected',
      );

      res.json({ success: true, status: worker.status });
    } catch (error) {
      next(error);
    }
  }

  async getAllServices(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const {
        search = '',
        sort = 'latest',
        page = '1',
        limit = '6',
      } = req.query as {
        search?: string;
        sort?: string;
        page?: string;
        limit?: string;
      };
      const data = await this._adminManagement.getAllServices(
        String(search),
        sort,
        Number(page),
        Number(limit),
      );
      res.status(STATUS_CODES.OK).json({ success: true, ...data });
    } catch (error) {
      next(error);
    }
  }

  async serviceRegister(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const data = req.body;
      
      const validatedData = serviceRegistrationSchema.parse(data);
      const result = await this._adminManagement.serviceRegister(validatedData);
      console.log(result)
      if (result.success) {
        res.status(STATUS_CODES.OK).json(result);
      } else {
        res.status(STATUS_CODES.NOT_FOUND).json(result);
      }
    } catch (error) {
      console.error(error);
      next(error);
    }
  }

  async updateServiceStatus(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      console.log(req.params, req.body);
      const serviceId = req.params.id;
      const status = req.body.status as 'active' | 'inactive';
      console.log(serviceId, status);
      const updated = await this._adminManagement.updateServiceStatus(
        serviceId,
        status,
      );
      if (!updated) {
        res.status(STATUS_CODES.BAD_REQUEST || 400).json({
          success: false,

          message: 'User updation failed',
        });
      }
      res.status(STATUS_CODES.OK || 200).json({
        success: true,
        status: updated.status,
        message: `User ${updated?.status ? 'inactive' : 'active'} successfully`,
      });
    } catch (error) {
      next(error);
    }
  }

  async getBookings(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const {
        search = '',
        status = 'all',
        limit = '10',
        page = '1',
      } = req.query as {
        search?: string;
        status?: string;
        limit?: string;
        page?: string;
      };

      const result = await this._adminManagement.getAllBookings(
        search,
        status,
        Number(limit),
        Number(page),
      );
      if (result.success) {
        res.status(STATUS_CODES.OK).json(result);
      } else {
        res.status(STATUS_CODES.BAD_REQUEST).json(result);
      }
    } catch (error) {
      next(error);
    }
  }

  async getBookingDetailPage(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const bookingId = req.params.bookingId as string;

      const result = await this._adminManagement.getBookingDetail(bookingId);
      if (result.success) {
        res.status(STATUS_CODES.OK).json(result);
      } else {
        res.status(STATUS_CODES.BAD_REQUEST).json(result);
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
    try {
      console.log((req as CustomRequest).user);
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
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async getDashboard(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const dashboard = await this._adminManagement.getDashboard();

      res.status(STATUS_CODES.OK).json({
        success: true,
        data: dashboard,
      });
    } catch (error) {
      next(error);
    }
  }
}
