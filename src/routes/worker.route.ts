import { Response, Request, NextFunction } from 'express';
import { BaseRoute } from './base.route';
import {
  authWorkerController, bookingController, chatController, cloudinaryController, notificationController, tokenController, workerbookingController, workerController, workingDetailsController,
} from '../config/di/resolver';
import { authorizeRole, verifyAuth } from '../middleware/auth.middleware';
import { BACKEND_ROUTES } from '../config/constants/apiRoutes';

export class WorkerRoute extends BaseRoute {
  constructor() {
    super();
  }

  protected initializeRoutes(): void {
    this.router.post(BACKEND_ROUTES.WORKER.GENERATE_OTP, (req: Request, res: Response, next: NextFunction) => authWorkerController.generateOtp(req, res, next));
    this.router.post(BACKEND_ROUTES.WORKER.VERIFY_OTP, (req: Request, res: Response, next: NextFunction) => authWorkerController.verifyOtp(req, res, next));
    this.router.post(BACKEND_ROUTES.WORKER.CLOUDINARY_SIGNATURE, (req: Request, res: Response, next: NextFunction) => {
      cloudinaryController.getSignature(req, res, next);
    });
    this.router.post(BACKEND_ROUTES.WORKER.GOOGLE_AUTH, (req: Request, res: Response, next: NextFunction) => authWorkerController.googleAuth(req, res, next));
    this.router.post(BACKEND_ROUTES.WORKER.REGISTER, (req: Request, res: Response, next: NextFunction) => authWorkerController.register(req, res, next));
    this.router.post(BACKEND_ROUTES.WORKER.LOGIN, (req: Request, res: Response, next: NextFunction) => authWorkerController.login(req, res, next));
    this.router.post(BACKEND_ROUTES.WORKER.LOGOUT, verifyAuth(), authorizeRole(['worker']), (req: Request, res: Response, next: NextFunction) => authWorkerController.logout(req, res, next));
    this.router.post(BACKEND_ROUTES.WORKER.FORGOT_PASSWORD, (req: Request, res: Response, next: NextFunction) => authWorkerController.forgotPassword(req, res, next));
    this.router.post(BACKEND_ROUTES.WORKER.RESET_PASSWORD, (req: Request, res: Response, next: NextFunction) => authWorkerController.resetPassword(req, res, next));
    this.router.get(BACKEND_ROUTES.WORKER.GET_SERVICE_NAMES, (req: Request, res: Response, next: NextFunction) => cloudinaryController.getServiceNames(req, res, next));
    this.router.get(BACKEND_ROUTES.WORKER.IS_VERIFIED, verifyAuth(), authorizeRole(['worker']), (req: Request, res: Response, next: NextFunction) => authWorkerController.isVerified(req, res, next));
    this.router.post(BACKEND_ROUTES.WORKER.REFRESH_TOKEN, (req: Request, res: Response) => authWorkerController.handleTokenRefresh(req, res));
    this.router.get(BACKEND_ROUTES.WORKER.GET_SLOT, verifyAuth(), authorizeRole(['worker']), (req: Request, res: Response, next: NextFunction) => workingDetailsController.getWorkingDetails(req, res, next));
    this.router.post(BACKEND_ROUTES.WORKER.UPDATE_SLOT, verifyAuth(), authorizeRole(['worker']), (req: Request, res: Response, next: NextFunction) => workingDetailsController.updateWorkingDetails(req, res, next));
    this.router.get(BACKEND_ROUTES.WORKER.APPOINTMENTS_REQUEST, verifyAuth(), authorizeRole(['worker']), (req: Request, res: Response, next: NextFunction) => workingDetailsController.getWorkingDetails(req, res, next));
    this.router.get(BACKEND_ROUTES.WORKER.PROFILE_DETAILS, verifyAuth(), authorizeRole(['worker']), (req: Request, res: Response, next: NextFunction) => workingDetailsController.getProfileDetails(req, res, next));
    this.router.put(BACKEND_ROUTES.WORKER.UPDATE_PROFILE, verifyAuth(), authorizeRole(['worker']), (req: Request, res: Response, next: NextFunction) => workingDetailsController.updateProfileDetails(req, res, next));
    this.router.put(BACKEND_ROUTES.WORKER.CHANGE_PASSWORD, verifyAuth(), authorizeRole(['worker']), (req: Request, res: Response, next: NextFunction) => workingDetailsController.changePassword(req, res, next));
    this.router.get(BACKEND_ROUTES.WORKER.CALENDAR_GET, verifyAuth(), authorizeRole(['worker']), (req: Request, res: Response, next: NextFunction) => workingDetailsController.getCalenderDetails(req, res, next));
    this.router.put(BACKEND_ROUTES.WORKER.CALENDAR_UPDATE, verifyAuth(), authorizeRole(['worker']), (req: Request, res: Response, next: NextFunction) => workingDetailsController.updateCalenderDetails(req, res, next));
    this.router.put(BACKEND_ROUTES.WORKER.SERVICE_APPROVE, verifyAuth(), authorizeRole(['worker']), (req: Request, res: Response, next: NextFunction) => workerbookingController.approveService(req, res, next));
    this.router.put(BACKEND_ROUTES.WORKER.SERVICE_REJECT, verifyAuth(), authorizeRole(['worker']), (req: Request, res: Response, next: NextFunction) => workerbookingController.rejectService(req, res, next));
    this.router.get(BACKEND_ROUTES.WORKER.SERVICE_REQUESTS, verifyAuth(), authorizeRole(['worker']), (req: Request, res: Response, next: NextFunction) => workerbookingController.getServiceRequests(req, res, next));
    this.router.get(BACKEND_ROUTES.WORKER.SERVICE_APPROVEDS, verifyAuth(), authorizeRole(['worker']), (req: Request, res: Response, next: NextFunction) => workerbookingController.getServiceApprovals(req, res, next));
    this.router.get(BACKEND_ROUTES.WORKER.SERVICE_APPROVED_DETAILS, verifyAuth(), authorizeRole(['worker']), (req: Request, res: Response, next: NextFunction) => workerbookingController.getApprovalsDetails(req, res, next));
    this.router.get(BACKEND_ROUTES.WORKER.REACH_LOCATION, verifyAuth(), authorizeRole(['worker']), (req: Request, res: Response, next: NextFunction) => workerbookingController.reachLocation(req, res, next));
    this.router.put(BACKEND_ROUTES.WORKER.VERIFY_WORKER, verifyAuth(), authorizeRole(['worker']), (req: Request, res: Response, next: NextFunction) => workerbookingController.verifyWorker(req, res, next));
    this.router.patch(BACKEND_ROUTES.WORKER.WORK_COMPLETED, verifyAuth(), authorizeRole(['worker']), (req: Request, res: Response, next: NextFunction) => workerbookingController.workComplated(req, res, next));
    this.router.get(BACKEND_ROUTES.WORKER.ALL_BOOKINGS, verifyAuth(), authorizeRole(['worker']), (req: Request, res: Response, next: NextFunction) => workerbookingController.allBookings(req, res, next));
    this.router.get(BACKEND_ROUTES.WORKER.WALLET_DATA, verifyAuth(), authorizeRole(['worker']), (req: Request, res: Response, next: NextFunction) => workingDetailsController.getWalletData(req, res, next));
    this.router.get(BACKEND_ROUTES.WORKER.TRANSACTIONS, verifyAuth(), authorizeRole(['worker']), (req: Request, res: Response, next: NextFunction) => workingDetailsController.getTransactions(req, res, next));
    this.router.get(BACKEND_ROUTES.WORKER.CHAT_INBOX, verifyAuth(), authorizeRole(['worker']), (req: Request, res: Response, next: NextFunction) => chatController.getWorkerInboxUsers(req, res, next));
    this.router.get(BACKEND_ROUTES.WORKER.CHAT_HISTORY, verifyAuth(), authorizeRole(['worker']), (req: Request, res: Response, next: NextFunction) => chatController.getChatHistory(req, res, next));
    this.router.get(BACKEND_ROUTES.WORKER.DASHBOARD, verifyAuth(), authorizeRole(['worker']), (req: Request, res: Response, next: NextFunction) => workerController.getDashboard(req, res, next));
    this.router.get(BACKEND_ROUTES.WORKER.NOTIFICATIONS, verifyAuth(), authorizeRole(['worker']), (req: Request, res: Response, next: NextFunction) => notificationController.getNotifications(req, res, next));
    this.router.patch(BACKEND_ROUTES.WORKER.MARK_NOTIFICATION_READ, verifyAuth(), authorizeRole(['worker']), (req: Request, res: Response, next: NextFunction) => notificationController.markAsRead(req, res, next));
    this.router.patch(BACKEND_ROUTES.WORKER.MARK_ALL_NOTIFICATION_READ, verifyAuth(), authorizeRole(['worker']), (req: Request, res: Response, next: NextFunction) => notificationController.markAllRead(req, res, next));
  }
}
