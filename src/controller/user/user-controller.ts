import { Request, Response, NextFunction } from 'express';
import { inject, injectable } from 'tsyringe';
import { success } from 'zod';
import { IUserController } from '../../interface/controller/user-controller.controller.interface';
import { CustomRequest } from '../../middleware/auth.middleware';
import { TYPES } from '../../config/constants/types';
import { STATUS_CODES } from '../../config/constants/status-code';

import { CustomError } from '../../utils/custom-error';
import { MESSAGES } from '../../config/constants/message';
import { updateUserProfileSchema } from '../validation/update-user-profile-details';
import { IProfileManagement } from '../../interface/service/user/profile-management.serice.interface';
import { addressSchema } from '../validation/add-address.zod';
import { changePasswordSchema } from '../validation/change-password.zod';
import { IChangePasswordService } from '../../interface/service/change-password.service.interface';
import { IBookingDetailsService } from '../../interface/service/user/booking-details.service.interface';
import { IWalletService } from '../../interface/service/wallet.service.interface';
import { ITransactionService } from '../../interface/service/transaction.service.interface';
import { WalletTransactionQuery } from '../../dto/shared/wallet.dto';

@injectable()
export class UserController implements IUserController {
  constructor(
    @inject(TYPES.ProfileManagement) private _profileManage: IProfileManagement,
    @inject(TYPES.ChangePasswordService)
    private _changePassword: IChangePasswordService,
    @inject(TYPES.BookingDetailsService)
    private _bookingDetailsService: IBookingDetailsService,
    @inject(TYPES.WalletService)
    private _walletService: IWalletService,
    @inject(TYPES.TransactionService)
    private _transactionServcie: ITransactionService,
  ) {}

  async userProfileDetails(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      console.log((req as CustomRequest).user);
      const userId = (req as CustomRequest).user._id;
      const data = await this._profileManage.getUserProfileDetails(userId);

      res.status(STATUS_CODES.OK).json(data);
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
      console.log(req.body);

      const parsedData = updateUserProfileSchema.safeParse(req.body);

      if (!parsedData.success) {
        const errors = parsedData.error.format();
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: 'Validation failed',
          errors,
        });
        throw new CustomError(MESSAGES.VALIDATION_ERROR, STATUS_CODES.CONFLICT);
      }

      const user = parsedData.data;
      const userId = (req as CustomRequest).user._id;

      const updatedData = await this._profileManage.updateUserProfileDetails(
        user,
        userId,
      );
      if (!updatedData) {
        throw new CustomError(MESSAGES.BAD_REQUEST, STATUS_CODES.BAD_REQUEST);
      }
      res.status(STATUS_CODES.OK).json(updatedData);
    } catch (error) {
      next(error);
    }
  }

  async getUserAddresses(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = (req as CustomRequest).user._id;
      console.log(userId);
      const data = await this._profileManage.getUserAddress(userId);
      console.log(data);
      res.status(STATUS_CODES.OK).json(data);
    } catch (error) {
      next(error);
    }
  }

  async addUserAddress(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = (req as CustomRequest).user._id;

      const address = addressSchema.parse(req.body);
      const data = await this._profileManage.addUserAddress(userId, address);
      if (!data.success) {
        res.status(STATUS_CODES.BAD_REQUEST).json(data);
      } else {
        res.status(STATUS_CODES.OK).json(data);
      }
    } catch (error) {
      next(error);
    }
  }

  async setPrimaryAddress(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = (req as CustomRequest).user._id;
      console.log(req);
      const { toSetId } = req.body;
      console.log(`${userId}+${toSetId}`);
      const respose = await this._profileManage.setPrimaryAddress(
        userId,
        toSetId,
      );
      if (!respose.success) {
        res.status(STATUS_CODES.BAD_REQUEST).json(respose);
      } else {
        res.status(STATUS_CODES.OK).json(respose);
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
    const parsed = changePasswordSchema.parse(req.body);
    const userId = (req as CustomRequest).user?._id;
    const result = await this._changePassword.changePassword(
      'user',
      userId,
      parsed,
    );
    if (result.success) {
      res.status(STATUS_CODES.OK).json(result);
    } else {
      res.status(STATUS_CODES.CONFLICT).json(result);
    }
  }

  async ongoingBookings(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const limit = Number(req.query.limit) || 10;
      const page = Number(req.query.page) || 1;
      const search = (req.query.search as string) || '';

      const userId = (req as CustomRequest).user._id;

      const skip = (page - 1) * limit;

      // ---- SERVICE CALL ----
      const response = await this._bookingDetailsService.ongoingBookings(
        userId,
        limit,
        skip,
        search,
      );
      if (response.success) {
        res.status(STATUS_CODES.OK).json(response);
      } else {
        res.status(STATUS_CODES.BAD_REQUEST).json(response);
      }
    } catch (error) {
      next(error);
    }
  }

  async bookingDetailData(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { bookingId } = req.params;
      if (!bookingId) {
        res
          .status(STATUS_CODES.BAD_REQUEST)
          .json({ success: false, message: 'ubooking details missing' });
      }
      const response = await this._bookingDetailsService.bookingDetailData(bookingId);
      console.log(response);

      if (response.success) {
        res.status(STATUS_CODES.OK).json(response);
      } else {
        res.status(STATUS_CODES.BAD_REQUEST).json(response);
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
    const result = await this._transactionServcie.getTransactionData(
      userId,
      role,
      query,
    );

    res.status(STATUS_CODES.OK).json(result);
  }

  async walletPayment(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = (req as CustomRequest).user._id;

      const { bookingId, addressId, paymentType } = req.body;

      if (!bookingId || !paymentType || !addressId) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: 'bookingId, addressId and paymentType are required',
        });
        return;
      }

      const booking = await this._bookingDetailsService.bookingDetailData(bookingId);

      if (!booking.success || !booking.booking) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: 'Booking not found',
        });
        return;
      }

      const bookingData = booking.booking;

      const amount = paymentType === 'advance'
        ? bookingData.advanceAmount
        : bookingData.remainingAmount;

      if (
        paymentType === 'advance'
        && bookingData.advancePaymentStatus === 'paid'
      ) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: 'Advance already paid',
        });
        return;
      }

      if (
        paymentType === 'final'
        && bookingData.finalPaymentStatus === 'paid'
      ) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: 'Final payment already completed',
        });
        return;
      }

      // 💰 wallet debit
      const walletResult = await this._walletService.debitBalance({
        userId,
        role: 'user',
        amount,
        type: 'ADJUSTMENT',
        description: `${paymentType} payment for booking ${bookingId}`,
      });

      if (!walletResult.success) {
        res.status(STATUS_CODES.BAD_REQUEST).json(walletResult);
        return;
      }

      // 🧾 Update booking payment status
      await this._bookingDetailsService.updatePaymentStatus(
        bookingId,
        addressId,
        paymentType,
      );

      res.status(STATUS_CODES.OK).json({
        success: true,
        message: 'Wallet payment successful',
      });
    } catch (error) {
      next(error);
    }
  }
}
