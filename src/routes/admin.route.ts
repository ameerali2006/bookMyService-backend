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
import { BACKEND_ROUTES } from '../config/constants/apiRoutes';

export class AdminRoute extends BaseRoute {
  constructor() {
    super();
  }

  protected initializeRoutes(): void {
    this.router.post(
      BACKEND_ROUTES.ADMIN.LOGIN,
      (req: Request, res: Response, next: NextFunction) => {
        authAdminController.login(req, res, next);
      },
    );
    this.router.post(
      BACKEND_ROUTES.ADMIN.LOGOUT,
      verifyAuth(),
      authorizeRole(['admin']),
      (req: Request, res: Response, next: NextFunction) => {
        authAdminController.logout(req, res, next);
      },
    );
    this.router.get(
      BACKEND_ROUTES.ADMIN.USERS,
      verifyAuth(),
      authorizeRole(['admin']),
      (req: Request, res: Response, next: NextFunction) => {
        managementAdminController.getAllUsers(req, res, next);
      },
    );
    this.router.patch(
      BACKEND_ROUTES.ADMIN.UPDATE_USER_STATUS,
      verifyAuth(),
      authorizeRole(['admin']),
      (req: Request, res: Response, next: NextFunction) => {
        managementAdminController.updateUserStatus(req, res, next);
      },
    );
    this.router.get(
      BACKEND_ROUTES.ADMIN.WORKERS,
      verifyAuth(),
      authorizeRole(['admin']),
      (req: Request, res: Response, next: NextFunction) => {
        managementAdminController.getAllWorkers(req, res, next);
      },
    );
    this.router.patch(
      BACKEND_ROUTES.ADMIN.UPDATE_WORKER_STATUS,
      verifyAuth(),
      authorizeRole(['admin']),
      (req: Request, res: Response, next: NextFunction) => {
        managementAdminController.updateWorkerStatus(req, res, next);
      },
    );
    this.router.patch(
      BACKEND_ROUTES.ADMIN.VERIFY_WORKER,
      verifyAuth(),
      authorizeRole(['admin']),
      (req: Request, res: Response, next: NextFunction) => {
        managementAdminController.verifyWorker(req, res, next);
      },
    );
    this.router.get(
      BACKEND_ROUTES.ADMIN.UNVERIFIED_WORKERS,
      verifyAuth(),
      authorizeRole(['admin']),
      (req: Request, res: Response, next: NextFunction) => {
        managementAdminController.unVerifiedWorkers(req, res, next);
      },
    );
    this.router.get(
      BACKEND_ROUTES.ADMIN.SERVICES,
      verifyAuth(),
      authorizeRole(['admin']),
      (req: Request, res: Response, next: NextFunction) => {
        managementAdminController.getAllServices(req, res, next);
      },
    );
    this.router.get(
      BACKEND_ROUTES.ADMIN.CLOUDINARY_SIGNATURE,
      (req: Request, res: Response, next: NextFunction) => {
        cloudinaryController.getSignature(req, res, next);
      },
    );
    this.router.post(
      BACKEND_ROUTES.ADMIN.CREATE_SERVICE,
      verifyAuth(),
      authorizeRole(['admin']),
      (req: Request, res: Response, next: NextFunction) => {
        console.log('/services/create');
        managementAdminController.serviceRegister(req, res, next);
      },
    );
    this.router.patch(
      BACKEND_ROUTES.ADMIN.UPDATE_SERVICE_STATUS,
      verifyAuth(),
      authorizeRole(['admin']),
      (req: Request, res: Response, next: NextFunction) => {
        managementAdminController.updateServiceStatus(req, res, next);
      },
    );
    this.router.post(
      BACKEND_ROUTES.ADMIN.REFRESH_TOKEN,
      (req: Request, res: Response, next: NextFunction) => authAdminController.handleTokenRefresh(req, res),
    );
    this.router.get(
      BACKEND_ROUTES.ADMIN.BOOKINGS,
      verifyAuth(),
      authorizeRole(['admin']),
      (req: Request, res: Response, next: NextFunction) => {
        managementAdminController.getBookings(req, res, next);
      },
    );
    this.router.get(
      BACKEND_ROUTES.ADMIN.BOOKING_DETAIL,
      verifyAuth(),
      authorizeRole(['admin']),
      (req: Request, res: Response, next: NextFunction) => {
        managementAdminController.getBookingDetailPage(req, res, next);
      },
    );
    this.router.get(
      BACKEND_ROUTES.ADMIN.WALLET_DATA,
      verifyAuth(),
      authorizeRole(['admin']),
      (req: Request, res: Response, next: NextFunction) => {
        managementAdminController.getWalletData(req, res, next);
      },
    );
    this.router.get(
      BACKEND_ROUTES.ADMIN.TRANSACTIONS,
      verifyAuth(),
      authorizeRole(['admin']),
      (req: Request, res: Response, next: NextFunction) => {
        managementAdminController.getTransactions(req, res, next);
      },
    );
    this.router.get(
      BACKEND_ROUTES.ADMIN.DASHBOARD,
      verifyAuth(),
      authorizeRole(['admin']),
      (req: Request, res: Response, next: NextFunction) => {
        managementAdminController.getDashboard(req, res, next);
      },
    );
    this.router.get(
      BACKEND_ROUTES.ADMIN.REVIEWS,
      verifyAuth(),
      authorizeRole(['admin']),
      (req: Request, res: Response, next: NextFunction) => {
        reviewController.allReviewManagement(req, res, next);
      },
    );
  }
}

