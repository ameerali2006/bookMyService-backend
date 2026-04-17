"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoute = void 0;
const base_route_1 = require("./base.route");
const resolver_1 = require("../config/di/resolver");
const auth_middleware_1 = require("../middleware/auth.middleware");
class UserRoute extends base_route_1.BaseRoute {
    constructor() {
        super();
    }
    initializeRoutes() {
        this.router.post('/register', (req, res, next) => resolver_1.authController.register(req, res, next));
        this.router.post('/generate-otp', (req, res, next) => resolver_1.authController.generateOtp(req, res, next));
        this.router.post('/verify-otp', (req, res, next) => resolver_1.authController.verifyOtp(req, res, next));
        this.router.post('/login', (req, res, next) => resolver_1.authController.login(req, res, next));
        this.router.post('/google-login', (req, res, next) => {
            console.log('google.login');
            resolver_1.authController.googleLogin(req, res, next);
        });
        this.router.post('/logout', (0, auth_middleware_1.verifyAuth)(), resolver_1.blockStatusMiddleware.checkStatus, (req, res, next) => {
            resolver_1.authController.logout(req, res, next);
        });
        this.router.post('/forgot-password', (req, res, next) => resolver_1.authController.forgotPassword(req, res, next));
        this.router.post('/reset-password', (req, res, next) => resolver_1.authController.resetPassword(req, res, next));
        this.router.get('/getService', (req, res, next) => resolver_1.serviceController.getServices(req, res, next));
        this.router.post('/refresh-token', (req, res, next) => resolver_1.authController.handleTokenRefresh(req, res));
        // add verify and auth middle ware
        this.router.get('/profile/userDetails', (0, auth_middleware_1.verifyAuth)(), resolver_1.blockStatusMiddleware.checkStatus, (req, res, next) => resolver_1.userController.userProfileDetails(req, res, next));
        this.router.put('/profile/updateUserDetails', (0, auth_middleware_1.verifyAuth)(), resolver_1.blockStatusMiddleware.checkStatus, (req, res, next) => resolver_1.userController.updateProfileDetails(req, res, next));
        this.router.get('/workers/nearby', (req, res, next) => resolver_1.serviceController.getNearByWorkers(req, res, next));
        this.router.get('/workers/availability', (0, auth_middleware_1.verifyAuth)(), resolver_1.blockStatusMiddleware.checkStatus, (req, res, next) => resolver_1.serviceController.getWorkerAvailability(req, res, next));
        this.router.get('/addresses', (0, auth_middleware_1.verifyAuth)(), resolver_1.blockStatusMiddleware.checkStatus, (req, res, next) => resolver_1.userController.getUserAddresses(req, res, next));
        this.router.post('/addAddress', (0, auth_middleware_1.verifyAuth)(), resolver_1.blockStatusMiddleware.checkStatus, (req, res, next) => resolver_1.userController.addUserAddress(req, res, next));
        this.router.put('/address/setPrimary', (0, auth_middleware_1.verifyAuth)(), resolver_1.blockStatusMiddleware.checkStatus, (req, res, next) => resolver_1.userController.setPrimaryAddress(req, res, next));
        this.router.post('/basicBookingDetails', (0, auth_middleware_1.verifyAuth)(), resolver_1.blockStatusMiddleware.checkStatus, (req, res, next) => resolver_1.bookingController.setBasicBookingDetails(req, res, next));
        this.router.get('/getBoookingDetails', (0, auth_middleware_1.verifyAuth)(), resolver_1.blockStatusMiddleware.checkStatus, (req, res, next) => resolver_1.bookingController.getBookingDetails(req, res, next));
        this.router.post('/payment/create-payment-intent', (0, auth_middleware_1.verifyAuth)(), resolver_1.blockStatusMiddleware.checkStatus, (req, res, next) => resolver_1.stripeController.createPaymentIntent(req, res, next));
        this.router.put('/profile/changePassword', (0, auth_middleware_1.verifyAuth)(), resolver_1.blockStatusMiddleware.checkStatus, (req, res, next) => resolver_1.userController.changePassword(req, res, next));
        this.router.get('/payment/verify', (0, auth_middleware_1.verifyAuth)(), resolver_1.blockStatusMiddleware.checkStatus, (req, res, next) => resolver_1.bookingController.verifyPayment(req, res, next));
        this.router.get('/bookings/ongoing', (0, auth_middleware_1.verifyAuth)(), resolver_1.blockStatusMiddleware.checkStatus, (req, res, next) => resolver_1.userController.ongoingBookings(req, res, next));
        this.router.get('/bookings/ongoing/:bookingId', (0, auth_middleware_1.verifyAuth)(), resolver_1.blockStatusMiddleware.checkStatus, (req, res, next) => resolver_1.userController.bookingDetailData(req, res, next));
        this.router.get('/profile/walletData', (0, auth_middleware_1.verifyAuth)(), resolver_1.blockStatusMiddleware.checkStatus, (req, res, next) => resolver_1.userController.getWalletData(req, res, next));
        this.router.get('/profile/transactions', (0, auth_middleware_1.verifyAuth)(), resolver_1.blockStatusMiddleware.checkStatus, (req, res, next) => resolver_1.userController.getTransactions(req, res, next));
        this.router.get('/chat/chatId', (0, auth_middleware_1.verifyAuth)(), resolver_1.blockStatusMiddleware.checkStatus, (req, res, next) => resolver_1.chatController.getChatId(req, res, next));
        this.router.get('/chat/chatHistory', (0, auth_middleware_1.verifyAuth)(), resolver_1.blockStatusMiddleware.checkStatus, (req, res, next) => resolver_1.chatController.getChatHistory(req, res, next));
        this.router.post('/review/addReview', (0, auth_middleware_1.verifyAuth)(), resolver_1.blockStatusMiddleware.checkStatus, (req, res, next) => resolver_1.reviewController.addReview(req, res, next));
        this.router.post('/wallet/payment', (0, auth_middleware_1.verifyAuth)(), resolver_1.blockStatusMiddleware.checkStatus, (req, res, next) => resolver_1.userController.walletPayment(req, res, next));
        this.router.get('/workers/workerProfile', (0, auth_middleware_1.verifyAuth)(), resolver_1.blockStatusMiddleware.checkStatus, (req, res, next) => resolver_1.serviceController.getWorkerProfile(req, res, next));
        this.router.get('/notifications', (0, auth_middleware_1.verifyAuth)(), resolver_1.blockStatusMiddleware.checkStatus, (req, res, next) => resolver_1.notificationController.getNotifications(req, res, next));
        this.router.patch('/notifications/:id/read', (0, auth_middleware_1.verifyAuth)(), resolver_1.blockStatusMiddleware.checkStatus, (req, res, next) => resolver_1.notificationController.markAsRead(req, res, next));
        this.router.patch('/notifications/read-all', (0, auth_middleware_1.verifyAuth)(), resolver_1.blockStatusMiddleware.checkStatus, (req, res, next) => resolver_1.notificationController.markAllRead(req, res, next));
    }
}
exports.UserRoute = UserRoute;
