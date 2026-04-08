import { NextFunction, Request, Response } from 'express';
import { BaseRoute } from '../routes/base.route';
import {
  authAdminController,
  cloudinaryController,
  managementAdminController,
  reviewController,
  tokenController,
} from '../config/di/resolver';
import { authorizeRole, verifyAuth } from '../middleware/auth.middleware';

export class AdminRoute extends BaseRoute {
  constructor() {
    super();
  }

  protected initializeRoutes(): void {
    this.router.post(
      '/login',
      (req: Request, res: Response, next: NextFunction) => {
        authAdminController.login(req, res, next);
      },
    );
    this.router.post(
      '/logout',
      verifyAuth(),
      authorizeRole(['admin']),
      (req: Request, res: Response, next: NextFunction) => {
        authAdminController.logout(req, res, next);
      },
    );
    this.router.get(
      '/users',
      verifyAuth(),
      authorizeRole(['admin']),
      (req: Request, res: Response, next: NextFunction) => {
        managementAdminController.getAllUsers(req, res, next);
      },
    );
    this.router.patch(
      '/users/:userId/status',
      verifyAuth(),
      authorizeRole(['admin']),
      (req: Request, res: Response, next: NextFunction) => {
        managementAdminController.updateUserStatus(req, res, next);
      },
    );
    this.router.get(
      '/workers',
      verifyAuth(),
      authorizeRole(['admin']),
      (req: Request, res: Response, next: NextFunction) => {
        managementAdminController.getAllWorkers(req, res, next);
      },
    );
    this.router.patch(
      '/workers/:userId/status',
      verifyAuth(),
      authorizeRole(['admin']),
      (req: Request, res: Response, next: NextFunction) => {
        managementAdminController.updateWorkerStatus(req, res, next);
      },
    );
    this.router.patch(
      '/workers/:workerId/unverified',
      verifyAuth(),
      authorizeRole(['admin']),
      (req: Request, res: Response, next: NextFunction) => {
        managementAdminController.verifyWorker(req, res, next);
      },
    );
    this.router.get(
      '/workers/unverified',
      verifyAuth(),
      authorizeRole(['admin']),
      (req: Request, res: Response, next: NextFunction) => {
        managementAdminController.unVerifiedWorkers(req, res, next);
      },
    );
    this.router.get(
      '/services',
      verifyAuth(),
      authorizeRole(['admin']),
      (req: Request, res: Response, next: NextFunction) => {
        managementAdminController.getAllServices(req, res, next);
      },
    );
    this.router.get(
      '/cloudinary-signature',
      (req: Request, res: Response, next: NextFunction) => {
        cloudinaryController.getSignature(req, res, next);
      },
    );
    this.router.post(
      '/services/create',
      verifyAuth(),
      authorizeRole(['admin']),
      (req: Request, res: Response, next: NextFunction) => {
        console.log('/services/create');
        managementAdminController.serviceRegister(req, res, next);
      },
    );
    this.router.patch(
      '/services/:id/status',
      verifyAuth(),
      authorizeRole(['admin']),
      (req: Request, res: Response, next: NextFunction) => {
        managementAdminController.updateServiceStatus(req, res, next);
      },
    );
    this.router.post(
      '/refresh-token',
      (req: Request, res: Response, next: NextFunction) => authAdminController.handleTokenRefresh(req, res),
    );
    this.router.get(
      '/bookings',
      verifyAuth(),
      authorizeRole(['admin']),
      (req: Request, res: Response, next: NextFunction) => {
        managementAdminController.getBookings(req, res, next);
      },
    );
    this.router.get(
      '/booking/:bookingId',
      verifyAuth(),
      authorizeRole(['admin']),
      (req: Request, res: Response, next: NextFunction) => {
        managementAdminController.getBookingDetailPage(req, res, next);
      },
    );
    this.router.get(
      '/wallet/walletData',
      verifyAuth(),
      authorizeRole(['admin']),
      (req: Request, res: Response, next: NextFunction) => {
        managementAdminController.getWalletData(req, res, next);
      },
    );
    this.router.get(
      '/wallet/transactions',
      verifyAuth(),
      authorizeRole(['admin']),
      (req: Request, res: Response, next: NextFunction) => {
        managementAdminController.getTransactions(req, res, next);
      },
    );
    this.router.get(
      '/dashboard',
      verifyAuth(),
      authorizeRole(['admin']),
      (req: Request, res: Response, next: NextFunction) => {
        managementAdminController.getDashboard(req, res, next);
      },
    );
    this.router.get(
      '/reviews',
      verifyAuth(),
      authorizeRole(['admin']),
      (req: Request, res: Response, next: NextFunction) => {
        reviewController.allReviewManagement(req, res, next);
      },
    );
  }
}
