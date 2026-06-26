import express, {
  Response, Request, NextFunction, RequestHandler,
} from 'express';
import { BaseRoute } from './base.route';
import {
  authController,
  blockStatusMiddleware,
  bookingController,
  chatController,
  notificationController,
  reviewController,
  serviceController,
  stripeController,
  tokenController,
  userController,

} from '../config/di/resolver';
import { authorizeRole, verifyAuth } from '../middleware/auth.middleware';
import { BACKEND_ROUTES } from '../config/constants/apiRoutes';

export class UserRoute extends BaseRoute {
  constructor() {
    super();
  }

  protected initializeRoutes(): void {
    this.router.post(BACKEND_ROUTES.USER.REGISTER, (req: Request, res: Response, next: NextFunction) => authController.register(req, res, next));
    this.router.post(BACKEND_ROUTES.USER.GENERATE_OTP, (req: Request, res: Response, next: NextFunction) => authController.generateOtp(req, res, next));
    this.router.post(BACKEND_ROUTES.USER.VERIFY_OTP, (req: Request, res: Response, next: NextFunction) => authController.verifyOtp(req, res, next));
    this.router.post(BACKEND_ROUTES.USER.LOGIN, (req: Request, res: Response, next: NextFunction) => authController.login(req, res, next));
    this.router.post(BACKEND_ROUTES.USER.GOOGLE_LOGIN, (req: Request, res: Response, next: NextFunction) => {
      console.log('google.login');
      authController.googleLogin(req, res, next);
    });

    this.router.post(BACKEND_ROUTES.USER.LOGOUT, verifyAuth(), blockStatusMiddleware.checkStatus as RequestHandler, (req:Request, res:Response, next:NextFunction) => {
      authController.logout(req, res, next);
    });
    this.router.post(BACKEND_ROUTES.USER.FORGOT_PASSWORD, (req: Request, res: Response, next: NextFunction) => authController.forgotPassword(req, res, next));
    this.router.post(BACKEND_ROUTES.USER.RESET_PASSWORD, (req: Request, res: Response, next: NextFunction) => authController.resetPassword(req, res, next));
    this.router.get(BACKEND_ROUTES.USER.GET_SERVICE, (req: Request, res: Response, next: NextFunction) => serviceController.getServices(req, res, next));
    this.router.post(BACKEND_ROUTES.USER.REFRESH_TOKEN, (req: Request, res: Response, next: NextFunction) => authController.handleTokenRefresh(req, res));
    // add verify and auth middle ware
    this.router.get(BACKEND_ROUTES.USER.PROFILE_DETAILS, verifyAuth(), blockStatusMiddleware.checkStatus as RequestHandler, (req: Request, res: Response, next: NextFunction) => userController.userProfileDetails(req, res, next));
    this.router.put(BACKEND_ROUTES.USER.UPDATE_PROFILE, verifyAuth(), blockStatusMiddleware.checkStatus as RequestHandler, (req: Request, res: Response, next: NextFunction) => userController.updateProfileDetails(req, res, next));
    this.router.get(BACKEND_ROUTES.USER.NEARBY_WORKERS, (req: Request, res: Response, next: NextFunction) => serviceController.getNearByWorkers(req, res, next));
    this.router.get(BACKEND_ROUTES.USER.WORKER_AVAILABILITY, verifyAuth(), blockStatusMiddleware.checkStatus as RequestHandler, (req: Request, res: Response, next: NextFunction) => serviceController.getWorkerAvailability(req, res, next));
    this.router.get(BACKEND_ROUTES.USER.ADDRESSES, verifyAuth(), blockStatusMiddleware.checkStatus as RequestHandler, (req: Request, res: Response, next: NextFunction) => userController.getUserAddresses(req, res, next));
    this.router.post(BACKEND_ROUTES.USER.ADD_ADDRESS, verifyAuth(), blockStatusMiddleware.checkStatus as RequestHandler, (req: Request, res: Response, next: NextFunction) => userController.addUserAddress(req, res, next));
    this.router.put(BACKEND_ROUTES.USER.SET_PRIMARY_ADDRESS, verifyAuth(), blockStatusMiddleware.checkStatus as RequestHandler, (req: Request, res: Response, next: NextFunction) => userController.setPrimaryAddress(req, res, next));
    this.router.post(BACKEND_ROUTES.USER.BASIC_BOOKING, verifyAuth(), blockStatusMiddleware.checkStatus as RequestHandler, (req: Request, res: Response, next: NextFunction) => bookingController.setBasicBookingDetails(req, res, next));
    this.router.get(BACKEND_ROUTES.USER.BOOKING_DETAILS, verifyAuth(), blockStatusMiddleware.checkStatus as RequestHandler, (req: Request, res: Response, next: NextFunction) => bookingController.getBookingDetails(req, res, next));
    this.router.post(BACKEND_ROUTES.USER.CREATE_PAYMENT_INTENT, verifyAuth(), blockStatusMiddleware.checkStatus as RequestHandler, (req: Request, res: Response, next: NextFunction) => stripeController.createPaymentIntent(req, res, next));
    this.router.put(BACKEND_ROUTES.USER.CHANGE_PASSWORD, verifyAuth(), blockStatusMiddleware.checkStatus as RequestHandler, (req: Request, res: Response, next: NextFunction) => userController.changePassword(req, res, next));
    this.router.get(BACKEND_ROUTES.USER.VERIFY_PAYMENT, verifyAuth(), blockStatusMiddleware.checkStatus as RequestHandler, (req: Request, res: Response, next: NextFunction) => bookingController.verifyPayment(req, res, next));
    this.router.get(BACKEND_ROUTES.USER.ONGOING_BOOKINGS, verifyAuth(), blockStatusMiddleware.checkStatus as RequestHandler, (req: Request, res: Response, next: NextFunction) => userController.ongoingBookings(req, res, next));
    this.router.get(BACKEND_ROUTES.USER.BOOKING_DETAIL, verifyAuth(), blockStatusMiddleware.checkStatus as RequestHandler, (req: Request, res: Response, next: NextFunction) => userController.bookingDetailData(req, res, next));
    this.router.get(BACKEND_ROUTES.USER.WALLET_DATA, verifyAuth(), blockStatusMiddleware.checkStatus as RequestHandler, (req: Request, res: Response, next: NextFunction) => userController.getWalletData(req, res, next));
    this.router.get(BACKEND_ROUTES.USER.TRANSACTIONS, verifyAuth(), blockStatusMiddleware.checkStatus as RequestHandler, (req: Request, res: Response, next: NextFunction) => userController.getTransactions(req, res, next));
    this.router.get(BACKEND_ROUTES.USER.CHAT_ID, verifyAuth(), blockStatusMiddleware.checkStatus as RequestHandler, (req: Request, res: Response, next: NextFunction) => chatController.getChatId(req, res, next));
    this.router.get(BACKEND_ROUTES.USER.CHAT_HISTORY, verifyAuth(), blockStatusMiddleware.checkStatus as RequestHandler, (req: Request, res: Response, next: NextFunction) => chatController.getChatHistory(req, res, next));
    this.router.post(BACKEND_ROUTES.USER.ADD_REVIEW, verifyAuth(), blockStatusMiddleware.checkStatus as RequestHandler, (req: Request, res: Response, next: NextFunction) => reviewController.addReview(req, res, next));
    this.router.post(BACKEND_ROUTES.USER.WALLET_PAYMENT, verifyAuth(), blockStatusMiddleware.checkStatus as RequestHandler, (req: Request, res: Response, next: NextFunction) => userController.walletPayment(req, res, next));
    this.router.get(BACKEND_ROUTES.USER.WORKER_PROFILE, verifyAuth(), blockStatusMiddleware.checkStatus as RequestHandler, (req: Request, res: Response, next: NextFunction) => serviceController.getWorkerProfile(req, res, next));
    this.router.get(BACKEND_ROUTES.USER.NOTIFICATIONS, verifyAuth(), blockStatusMiddleware.checkStatus as RequestHandler, (req: Request, res: Response, next: NextFunction) => notificationController.getNotifications(req, res, next));
    this.router.patch(BACKEND_ROUTES.USER.MARK_NOTIFICATION_READ, verifyAuth(), blockStatusMiddleware.checkStatus as RequestHandler, (req: Request, res: Response, next: NextFunction) => notificationController.markAsRead(req, res, next));
    this.router.patch(BACKEND_ROUTES.USER.MARK_ALL_NOTIFICATION_READ, verifyAuth(), blockStatusMiddleware.checkStatus as RequestHandler, (req: Request, res: Response, next: NextFunction) => notificationController.markAllRead(req, res, next));
    this.router.patch(BACKEND_ROUTES.USER.CANCEL_BOOKING, verifyAuth(), blockStatusMiddleware.checkStatus as RequestHandler, (req: Request, res: Response, next: NextFunction) => bookingController.cancelBooking (req, res, next));
  
  }
}
