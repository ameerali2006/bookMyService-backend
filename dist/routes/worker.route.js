"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerRoute = void 0;
const base_route_1 = require("./base.route");
const resolver_1 = require("../config/di/resolver");
const auth_middleware_1 = require("../middleware/auth.middleware");
const apiRoutes_1 = require("../config/constants/apiRoutes");
class WorkerRoute extends base_route_1.BaseRoute {
    constructor() {
        super();
    }
    initializeRoutes() {
        this.router.post(apiRoutes_1.BACKEND_ROUTES.WORKER.GENERATE_OTP, (req, res, next) => resolver_1.authWorkerController.generateOtp(req, res, next));
        this.router.post(apiRoutes_1.BACKEND_ROUTES.WORKER.VERIFY_OTP, (req, res, next) => resolver_1.authWorkerController.verifyOtp(req, res, next));
        this.router.post(apiRoutes_1.BACKEND_ROUTES.WORKER.CLOUDINARY_SIGNATURE, (req, res, next) => {
            resolver_1.cloudinaryController.getSignature(req, res, next);
        });
        this.router.post(apiRoutes_1.BACKEND_ROUTES.WORKER.GOOGLE_AUTH, (req, res, next) => resolver_1.authWorkerController.googleAuth(req, res, next));
        this.router.post(apiRoutes_1.BACKEND_ROUTES.WORKER.REGISTER, (req, res, next) => resolver_1.authWorkerController.register(req, res, next));
        this.router.post(apiRoutes_1.BACKEND_ROUTES.WORKER.LOGIN, (req, res, next) => resolver_1.authWorkerController.login(req, res, next));
        this.router.post(apiRoutes_1.BACKEND_ROUTES.WORKER.LOGOUT, (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['worker']), (req, res, next) => resolver_1.authWorkerController.logout(req, res, next));
        this.router.post(apiRoutes_1.BACKEND_ROUTES.WORKER.FORGOT_PASSWORD, (req, res, next) => resolver_1.authWorkerController.forgotPassword(req, res, next));
        this.router.post(apiRoutes_1.BACKEND_ROUTES.WORKER.RESET_PASSWORD, (req, res, next) => resolver_1.authWorkerController.resetPassword(req, res, next));
        this.router.get(apiRoutes_1.BACKEND_ROUTES.WORKER.GET_SERVICE_NAMES, (req, res, next) => resolver_1.cloudinaryController.getServiceNames(req, res, next));
        this.router.get(apiRoutes_1.BACKEND_ROUTES.WORKER.IS_VERIFIED, (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['worker']), (req, res, next) => resolver_1.authWorkerController.isVerified(req, res, next));
        this.router.post(apiRoutes_1.BACKEND_ROUTES.WORKER.REFRESH_TOKEN, (req, res) => resolver_1.authWorkerController.handleTokenRefresh(req, res));
        this.router.get(apiRoutes_1.BACKEND_ROUTES.WORKER.GET_SLOT, (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['worker']), (req, res, next) => resolver_1.workingDetailsController.getWorkingDetails(req, res, next));
        this.router.post(apiRoutes_1.BACKEND_ROUTES.WORKER.UPDATE_SLOT, (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['worker']), (req, res, next) => resolver_1.workingDetailsController.updateWorkingDetails(req, res, next));
        this.router.get(apiRoutes_1.BACKEND_ROUTES.WORKER.APPOINTMENTS_REQUEST, (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['worker']), (req, res, next) => resolver_1.workingDetailsController.getWorkingDetails(req, res, next));
        this.router.get(apiRoutes_1.BACKEND_ROUTES.WORKER.PROFILE_DETAILS, (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['worker']), (req, res, next) => resolver_1.workingDetailsController.getProfileDetails(req, res, next));
        this.router.put(apiRoutes_1.BACKEND_ROUTES.WORKER.UPDATE_PROFILE, (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['worker']), (req, res, next) => resolver_1.workingDetailsController.updateProfileDetails(req, res, next));
        this.router.put(apiRoutes_1.BACKEND_ROUTES.WORKER.CHANGE_PASSWORD, (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['worker']), (req, res, next) => resolver_1.workingDetailsController.changePassword(req, res, next));
        this.router.get(apiRoutes_1.BACKEND_ROUTES.WORKER.CALENDAR_GET, (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['worker']), (req, res, next) => resolver_1.workingDetailsController.getCalenderDetails(req, res, next));
        this.router.put(apiRoutes_1.BACKEND_ROUTES.WORKER.CALENDAR_UPDATE, (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['worker']), (req, res, next) => resolver_1.workingDetailsController.updateCalenderDetails(req, res, next));
        this.router.put(apiRoutes_1.BACKEND_ROUTES.WORKER.SERVICE_APPROVE, (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['worker']), (req, res, next) => resolver_1.workerbookingController.approveService(req, res, next));
        this.router.put(apiRoutes_1.BACKEND_ROUTES.WORKER.SERVICE_REJECT, (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['worker']), (req, res, next) => resolver_1.workerbookingController.rejectService(req, res, next));
        this.router.get(apiRoutes_1.BACKEND_ROUTES.WORKER.SERVICE_REQUESTS, (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['worker']), (req, res, next) => resolver_1.workerbookingController.getServiceRequests(req, res, next));
        this.router.get(apiRoutes_1.BACKEND_ROUTES.WORKER.SERVICE_APPROVEDS, (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['worker']), (req, res, next) => resolver_1.workerbookingController.getServiceApprovals(req, res, next));
        this.router.get(apiRoutes_1.BACKEND_ROUTES.WORKER.SERVICE_APPROVED_DETAILS, (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['worker']), (req, res, next) => resolver_1.workerbookingController.getApprovalsDetails(req, res, next));
        this.router.get(apiRoutes_1.BACKEND_ROUTES.WORKER.REACH_LOCATION, (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['worker']), (req, res, next) => resolver_1.workerbookingController.reachLocation(req, res, next));
        this.router.put(apiRoutes_1.BACKEND_ROUTES.WORKER.VERIFY_WORKER, (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['worker']), (req, res, next) => resolver_1.workerbookingController.verifyWorker(req, res, next));
        this.router.patch(apiRoutes_1.BACKEND_ROUTES.WORKER.WORK_COMPLETED, (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['worker']), (req, res, next) => resolver_1.workerbookingController.workComplated(req, res, next));
        this.router.get(apiRoutes_1.BACKEND_ROUTES.WORKER.ALL_BOOKINGS, (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['worker']), (req, res, next) => resolver_1.workerbookingController.allBookings(req, res, next));
        this.router.get(apiRoutes_1.BACKEND_ROUTES.WORKER.WALLET_DATA, (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['worker']), (req, res, next) => resolver_1.workingDetailsController.getWalletData(req, res, next));
        this.router.get(apiRoutes_1.BACKEND_ROUTES.WORKER.TRANSACTIONS, (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['worker']), (req, res, next) => resolver_1.workingDetailsController.getTransactions(req, res, next));
        this.router.get(apiRoutes_1.BACKEND_ROUTES.WORKER.CHAT_INBOX, (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['worker']), (req, res, next) => resolver_1.chatController.getWorkerInboxUsers(req, res, next));
        this.router.get(apiRoutes_1.BACKEND_ROUTES.WORKER.CHAT_HISTORY, (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['worker']), (req, res, next) => resolver_1.chatController.getChatHistory(req, res, next));
        this.router.get(apiRoutes_1.BACKEND_ROUTES.WORKER.DASHBOARD, (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['worker']), (req, res, next) => resolver_1.workerController.getDashboard(req, res, next));
        this.router.get(apiRoutes_1.BACKEND_ROUTES.WORKER.NOTIFICATIONS, (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['worker']), (req, res, next) => resolver_1.notificationController.getNotifications(req, res, next));
        this.router.patch(apiRoutes_1.BACKEND_ROUTES.WORKER.MARK_NOTIFICATION_READ, (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['worker']), (req, res, next) => resolver_1.notificationController.markAsRead(req, res, next));
        this.router.patch(apiRoutes_1.BACKEND_ROUTES.WORKER.MARK_ALL_NOTIFICATION_READ, (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['worker']), (req, res, next) => resolver_1.notificationController.markAllRead(req, res, next));
    }
}
exports.WorkerRoute = WorkerRoute;
