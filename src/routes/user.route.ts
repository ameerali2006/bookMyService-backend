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

export class UserRoute extends BaseRoute {
  constructor() {
    super();
  }

  protected initializeRoutes(): void {
    this.router.post('/register', (req: Request, res: Response, next: NextFunction) => authController.register(req, res, next));
    this.router.post('/generate-otp', (req: Request, res: Response, next: NextFunction) => authController.generateOtp(req, res, next));
    this.router.post('/verify-otp', (req: Request, res: Response, next: NextFunction) => authController.verifyOtp(req, res, next));
    this.router.post('/login', (req: Request, res: Response, next: NextFunction) => authController.login(req, res, next));
    this.router.post('/google-login', (req: Request, res: Response, next: NextFunction) => {
      console.log('google.login');
      authController.googleLogin(req, res, next);
    });

    this.router.post('/logout', verifyAuth(), blockStatusMiddleware.checkStatus as RequestHandler, (req:Request, res:Response, next:NextFunction) => {
      authController.logout(req, res, next);
    });
    this.router.post('/forgot-password', (req: Request, res: Response, next: NextFunction) => authController.forgotPassword(req, res, next));
    this.router.post('/reset-password', (req: Request, res: Response, next: NextFunction) => authController.resetPassword(req, res, next));
    this.router.get('/getService', (req: Request, res: Response, next: NextFunction) => serviceController.getServices(req, res, next));
    this.router.post('/refresh-token', (req: Request, res: Response, next: NextFunction) => authController.handleTokenRefresh(req, res));
    // add verify and auth middle ware
    this.router.get('/profile/userDetails', verifyAuth(), blockStatusMiddleware.checkStatus as RequestHandler, (req: Request, res: Response, next: NextFunction) => userController.userProfileDetails(req, res, next));
    this.router.put('/profile/updateUserDetails', verifyAuth(), blockStatusMiddleware.checkStatus as RequestHandler, (req: Request, res: Response, next: NextFunction) => userController.updateProfileDetails(req, res, next));
    this.router.get('/workers/nearby', (req: Request, res: Response, next: NextFunction) => serviceController.getNearByWorkers(req, res, next));
    this.router.get('/workers/availability', verifyAuth(), blockStatusMiddleware.checkStatus as RequestHandler, (req: Request, res: Response, next: NextFunction) => serviceController.getWorkerAvailability(req, res, next));
    this.router.get('/addresses', verifyAuth(), blockStatusMiddleware.checkStatus as RequestHandler, (req: Request, res: Response, next: NextFunction) => userController.getUserAddresses(req, res, next));
    this.router.post('/addAddress', verifyAuth(), blockStatusMiddleware.checkStatus as RequestHandler, (req: Request, res: Response, next: NextFunction) => userController.addUserAddress(req, res, next));
    this.router.put('/address/setPrimary', verifyAuth(), blockStatusMiddleware.checkStatus as RequestHandler, (req: Request, res: Response, next: NextFunction) => userController.setPrimaryAddress(req, res, next));
    this.router.post('/basicBookingDetails', verifyAuth(), blockStatusMiddleware.checkStatus as RequestHandler, (req: Request, res: Response, next: NextFunction) => bookingController.setBasicBookingDetails(req, res, next));
    this.router.get('/getBoookingDetails', verifyAuth(), blockStatusMiddleware.checkStatus as RequestHandler, (req: Request, res: Response, next: NextFunction) => bookingController.getBookingDetails(req, res, next));
    this.router.post('/payment/create-payment-intent', verifyAuth(), blockStatusMiddleware.checkStatus as RequestHandler, (req: Request, res: Response, next: NextFunction) => stripeController.createPaymentIntent(req, res, next));
    this.router.put('/profile/changePassword', verifyAuth(), blockStatusMiddleware.checkStatus as RequestHandler, (req: Request, res: Response, next: NextFunction) => userController.changePassword(req, res, next));
    this.router.get('/payment/verify', verifyAuth(), blockStatusMiddleware.checkStatus as RequestHandler, (req: Request, res: Response, next: NextFunction) => bookingController.verifyPayment(req, res, next));
    this.router.get('/bookings/ongoing', verifyAuth(), blockStatusMiddleware.checkStatus as RequestHandler, (req: Request, res: Response, next: NextFunction) => userController.ongoingBookings(req, res, next));
    this.router.get('/bookings/ongoing/:bookingId', verifyAuth(), blockStatusMiddleware.checkStatus as RequestHandler, (req: Request, res: Response, next: NextFunction) => userController.bookingDetailData(req, res, next));
    this.router.get('/profile/walletData', verifyAuth(), blockStatusMiddleware.checkStatus as RequestHandler, (req: Request, res: Response, next: NextFunction) => userController.getWalletData(req, res, next));
    this.router.get('/profile/transactions', verifyAuth(), blockStatusMiddleware.checkStatus as RequestHandler, (req: Request, res: Response, next: NextFunction) => userController.getTransactions(req, res, next));
    this.router.get('/chat/chatId', verifyAuth(), blockStatusMiddleware.checkStatus as RequestHandler, (req: Request, res: Response, next: NextFunction) => chatController.getChatId(req, res, next));
    this.router.get('/chat/chatHistory', verifyAuth(), blockStatusMiddleware.checkStatus as RequestHandler, (req: Request, res: Response, next: NextFunction) => chatController.getChatHistory(req, res, next));
    this.router.post('/review/addReview', verifyAuth(), blockStatusMiddleware.checkStatus as RequestHandler, (req: Request, res: Response, next: NextFunction) => reviewController.addReview(req, res, next));
    this.router.post('/wallet/payment', verifyAuth(), blockStatusMiddleware.checkStatus as RequestHandler, (req: Request, res: Response, next: NextFunction) => userController.walletPayment(req, res, next));
    this.router.get('/workers/workerProfile', verifyAuth(), blockStatusMiddleware.checkStatus as RequestHandler, (req: Request, res: Response, next: NextFunction) => serviceController.getWorkerProfile(req, res, next));
    this.router.get('/notifications', verifyAuth(), blockStatusMiddleware.checkStatus as RequestHandler, (req: Request, res: Response, next: NextFunction) => notificationController.getNotifications(req, res, next));
    this.router.patch('/notifications/:id/read', verifyAuth(), blockStatusMiddleware.checkStatus as RequestHandler, (req: Request, res: Response, next: NextFunction) => notificationController.markAsRead(req, res, next));
    this.router.patch('/notifications/read-all', verifyAuth(), blockStatusMiddleware.checkStatus as RequestHandler, (req: Request, res: Response, next: NextFunction) => notificationController.markAllRead(req, res, next));
  }
}
