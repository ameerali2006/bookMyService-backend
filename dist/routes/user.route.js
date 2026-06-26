"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoute = void 0;
const base_route_1 = require("./base.route");
const resolver_1 = require("../config/di/resolver");
const auth_middleware_1 = require("../middleware/auth.middleware");
const apiRoutes_1 = require("../config/constants/apiRoutes");
class UserRoute extends base_route_1.BaseRoute {
    constructor() {
        super();
    }
    initializeRoutes() {
        this.router.post(apiRoutes_1.BACKEND_ROUTES.USER.REGISTER, (req, res, next) => resolver_1.authController.register(req, res, next));
        this.router.post(apiRoutes_1.BACKEND_ROUTES.USER.GENERATE_OTP, (req, res, next) => resolver_1.authController.generateOtp(req, res, next));
        this.router.post(apiRoutes_1.BACKEND_ROUTES.USER.VERIFY_OTP, (req, res, next) => resolver_1.authController.verifyOtp(req, res, next));
        this.router.post(apiRoutes_1.BACKEND_ROUTES.USER.LOGIN, (req, res, next) => resolver_1.authController.login(req, res, next));
        this.router.post(apiRoutes_1.BACKEND_ROUTES.USER.GOOGLE_LOGIN, (req, res, next) => {
            console.log('google.login');
            resolver_1.authController.googleLogin(req, res, next);
        });
        this.router.post(apiRoutes_1.BACKEND_ROUTES.USER.LOGOUT, (0, auth_middleware_1.verifyAuth)(), resolver_1.blockStatusMiddleware.checkStatus, (req, res, next) => {
            resolver_1.authController.logout(req, res, next);
        });
        this.router.post(apiRoutes_1.BACKEND_ROUTES.USER.FORGOT_PASSWORD, (req, res, next) => resolver_1.authController.forgotPassword(req, res, next));
        this.router.post(apiRoutes_1.BACKEND_ROUTES.USER.RESET_PASSWORD, (req, res, next) => resolver_1.authController.resetPassword(req, res, next));
        this.router.get(apiRoutes_1.BACKEND_ROUTES.USER.GET_SERVICE, (req, res, next) => resolver_1.serviceController.getServices(req, res, next));
        this.router.post(apiRoutes_1.BACKEND_ROUTES.USER.REFRESH_TOKEN, (req, res, next) => resolver_1.authController.handleTokenRefresh(req, res));
        // add verify and auth middle ware
        this.router.get(apiRoutes_1.BACKEND_ROUTES.USER.PROFILE_DETAILS, (0, auth_middleware_1.verifyAuth)(), resolver_1.blockStatusMiddleware.checkStatus, (req, res, next) => resolver_1.userController.userProfileDetails(req, res, next));
        this.router.put(apiRoutes_1.BACKEND_ROUTES.USER.UPDATE_PROFILE, (0, auth_middleware_1.verifyAuth)(), resolver_1.blockStatusMiddleware.checkStatus, (req, res, next) => resolver_1.userController.updateProfileDetails(req, res, next));
        this.router.get(apiRoutes_1.BACKEND_ROUTES.USER.NEARBY_WORKERS, (req, res, next) => resolver_1.serviceController.getNearByWorkers(req, res, next));
        this.router.get(apiRoutes_1.BACKEND_ROUTES.USER.WORKER_AVAILABILITY, (0, auth_middleware_1.verifyAuth)(), resolver_1.blockStatusMiddleware.checkStatus, (req, res, next) => resolver_1.serviceController.getWorkerAvailability(req, res, next));
        this.router.get(apiRoutes_1.BACKEND_ROUTES.USER.ADDRESSES, (0, auth_middleware_1.verifyAuth)(), resolver_1.blockStatusMiddleware.checkStatus, (req, res, next) => resolver_1.userController.getUserAddresses(req, res, next));
        this.router.post(apiRoutes_1.BACKEND_ROUTES.USER.ADD_ADDRESS, (0, auth_middleware_1.verifyAuth)(), resolver_1.blockStatusMiddleware.checkStatus, (req, res, next) => resolver_1.userController.addUserAddress(req, res, next));
        this.router.put(apiRoutes_1.BACKEND_ROUTES.USER.SET_PRIMARY_ADDRESS, (0, auth_middleware_1.verifyAuth)(), resolver_1.blockStatusMiddleware.checkStatus, (req, res, next) => resolver_1.userController.setPrimaryAddress(req, res, next));
        this.router.post(apiRoutes_1.BACKEND_ROUTES.USER.BASIC_BOOKING, (0, auth_middleware_1.verifyAuth)(), resolver_1.blockStatusMiddleware.checkStatus, (req, res, next) => resolver_1.bookingController.setBasicBookingDetails(req, res, next));
        this.router.get(apiRoutes_1.BACKEND_ROUTES.USER.BOOKING_DETAILS, (0, auth_middleware_1.verifyAuth)(), resolver_1.blockStatusMiddleware.checkStatus, (req, res, next) => resolver_1.bookingController.getBookingDetails(req, res, next));
        this.router.post(apiRoutes_1.BACKEND_ROUTES.USER.CREATE_PAYMENT_INTENT, (0, auth_middleware_1.verifyAuth)(), resolver_1.blockStatusMiddleware.checkStatus, (req, res, next) => resolver_1.stripeController.createPaymentIntent(req, res, next));
        this.router.put(apiRoutes_1.BACKEND_ROUTES.USER.CHANGE_PASSWORD, (0, auth_middleware_1.verifyAuth)(), resolver_1.blockStatusMiddleware.checkStatus, (req, res, next) => resolver_1.userController.changePassword(req, res, next));
        this.router.get(apiRoutes_1.BACKEND_ROUTES.USER.VERIFY_PAYMENT, (0, auth_middleware_1.verifyAuth)(), resolver_1.blockStatusMiddleware.checkStatus, (req, res, next) => resolver_1.bookingController.verifyPayment(req, res, next));
        this.router.get(apiRoutes_1.BACKEND_ROUTES.USER.ONGOING_BOOKINGS, (0, auth_middleware_1.verifyAuth)(), resolver_1.blockStatusMiddleware.checkStatus, (req, res, next) => resolver_1.userController.ongoingBookings(req, res, next));
        this.router.get(apiRoutes_1.BACKEND_ROUTES.USER.BOOKING_DETAIL, (0, auth_middleware_1.verifyAuth)(), resolver_1.blockStatusMiddleware.checkStatus, (req, res, next) => resolver_1.userController.bookingDetailData(req, res, next));
        this.router.get(apiRoutes_1.BACKEND_ROUTES.USER.WALLET_DATA, (0, auth_middleware_1.verifyAuth)(), resolver_1.blockStatusMiddleware.checkStatus, (req, res, next) => resolver_1.userController.getWalletData(req, res, next));
        this.router.get(apiRoutes_1.BACKEND_ROUTES.USER.TRANSACTIONS, (0, auth_middleware_1.verifyAuth)(), resolver_1.blockStatusMiddleware.checkStatus, (req, res, next) => resolver_1.userController.getTransactions(req, res, next));
        this.router.get(apiRoutes_1.BACKEND_ROUTES.USER.CHAT_ID, (0, auth_middleware_1.verifyAuth)(), resolver_1.blockStatusMiddleware.checkStatus, (req, res, next) => resolver_1.chatController.getChatId(req, res, next));
        this.router.get(apiRoutes_1.BACKEND_ROUTES.USER.CHAT_HISTORY, (0, auth_middleware_1.verifyAuth)(), resolver_1.blockStatusMiddleware.checkStatus, (req, res, next) => resolver_1.chatController.getChatHistory(req, res, next));
        this.router.post(apiRoutes_1.BACKEND_ROUTES.USER.ADD_REVIEW, (0, auth_middleware_1.verifyAuth)(), resolver_1.blockStatusMiddleware.checkStatus, (req, res, next) => resolver_1.reviewController.addReview(req, res, next));
        this.router.post(apiRoutes_1.BACKEND_ROUTES.USER.WALLET_PAYMENT, (0, auth_middleware_1.verifyAuth)(), resolver_1.blockStatusMiddleware.checkStatus, (req, res, next) => resolver_1.userController.walletPayment(req, res, next));
        this.router.get(apiRoutes_1.BACKEND_ROUTES.USER.WORKER_PROFILE, (0, auth_middleware_1.verifyAuth)(), resolver_1.blockStatusMiddleware.checkStatus, (req, res, next) => resolver_1.serviceController.getWorkerProfile(req, res, next));
        this.router.get(apiRoutes_1.BACKEND_ROUTES.USER.NOTIFICATIONS, (0, auth_middleware_1.verifyAuth)(), resolver_1.blockStatusMiddleware.checkStatus, (req, res, next) => resolver_1.notificationController.getNotifications(req, res, next));
        this.router.patch(apiRoutes_1.BACKEND_ROUTES.USER.MARK_NOTIFICATION_READ, (0, auth_middleware_1.verifyAuth)(), resolver_1.blockStatusMiddleware.checkStatus, (req, res, next) => resolver_1.notificationController.markAsRead(req, res, next));
        this.router.patch(apiRoutes_1.BACKEND_ROUTES.USER.MARK_ALL_NOTIFICATION_READ, (0, auth_middleware_1.verifyAuth)(), resolver_1.blockStatusMiddleware.checkStatus, (req, res, next) => resolver_1.notificationController.markAllRead(req, res, next));
        this.router.patch(apiRoutes_1.BACKEND_ROUTES.USER.CANCEL_BOOKING, (0, auth_middleware_1.verifyAuth)(), resolver_1.blockStatusMiddleware.checkStatus, (req, res, next) => resolver_1.bookingController.cancelBooking(req, res, next));
    }
}
exports.UserRoute = UserRoute;
