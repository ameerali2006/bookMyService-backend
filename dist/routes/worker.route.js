"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerRoute = void 0;
const base_route_1 = require("./base.route");
const resolver_1 = require("../config/di/resolver");
const auth_middleware_1 = require("../middleware/auth.middleware");
class WorkerRoute extends base_route_1.BaseRoute {
    constructor() {
        super();
    }
    initializeRoutes() {
        this.router.post('/generate-otp', (req, res, next) => resolver_1.authWorkerController.generateOtp(req, res, next));
        this.router.post('/verify-otp', (req, res, next) => resolver_1.authWorkerController.verifyOtp(req, res, next));
        this.router.post('/cloudinary-signature', (req, res, next) => {
            resolver_1.cloudinaryController.getSignature(req, res, next);
        });
        this.router.post('/google-auth', (req, res, next) => resolver_1.authWorkerController.googleAuth(req, res, next));
        this.router.post('/register', (req, res, next) => resolver_1.authWorkerController.register(req, res, next));
        this.router.post('/login', (req, res, next) => resolver_1.authWorkerController.login(req, res, next));
        this.router.post('/logout', (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['worker']), (req, res, next) => resolver_1.authWorkerController.logout(req, res, next));
        this.router.post('/forgot-password', (req, res, next) => resolver_1.authWorkerController.forgotPassword(req, res, next));
        this.router.post('/reset-password', (req, res, next) => resolver_1.authWorkerController.resetPassword(req, res, next));
        this.router.get('/getserviceNames', (req, res, next) => resolver_1.cloudinaryController.getServiceNames(req, res, next));
        this.router.get('/isVerified', (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['worker']), (req, res, next) => resolver_1.authWorkerController.isVerified(req, res, next));
        this.router.post('/refresh-token', (req, res) => resolver_1.authWorkerController.handleTokenRefresh(req, res));
        this.router.get('/profile/slot', (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['worker']), (req, res, next) => resolver_1.workingDetailsController.getWorkingDetails(req, res, next));
        this.router.post('/profile/slot/update', (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['worker']), (req, res, next) => resolver_1.workingDetailsController.updateWorkingDetails(req, res, next));
        this.router.get('/appointments/requestService', (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['worker']), (req, res, next) => resolver_1.workingDetailsController.getWorkingDetails(req, res, next));
        this.router.get('/profile/details', (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['worker']), (req, res, next) => resolver_1.workingDetailsController.getProfileDetails(req, res, next));
        this.router.put('/profile/update', (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['worker']), (req, res, next) => resolver_1.workingDetailsController.updateProfileDetails(req, res, next));
        this.router.put('/profile/changePassword', (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['worker']), (req, res, next) => resolver_1.workingDetailsController.changePassword(req, res, next));
        this.router.get('/calender/getData', (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['worker']), (req, res, next) => resolver_1.workingDetailsController.getCalenderDetails(req, res, next));
        this.router.put('/calender/update', (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['worker']), (req, res, next) => resolver_1.workingDetailsController.updateCalenderDetails(req, res, next));
        this.router.put('/service/approve', (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['worker']), (req, res, next) => resolver_1.workerbookingController.approveService(req, res, next));
        this.router.put('/service/reject', (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['worker']), (req, res, next) => resolver_1.workerbookingController.rejectService(req, res, next));
        this.router.get('/service/requests', (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['worker']), (req, res, next) => resolver_1.workerbookingController.getServiceRequests(req, res, next));
        this.router.get('/service/approveds', (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['worker']), (req, res, next) => resolver_1.workerbookingController.getServiceApprovals(req, res, next));
        this.router.get('/service/approveds/:bookingId', (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['worker']), (req, res, next) => resolver_1.workerbookingController.getApprovalsDetails(req, res, next));
        this.router.get('/service/reach-location/:bookingId', (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['worker']), (req, res, next) => resolver_1.workerbookingController.reachLocation(req, res, next));
        this.router.put('/service/verify-worker', (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['worker']), (req, res, next) => resolver_1.workerbookingController.verifyWorker(req, res, next));
        this.router.patch('/service/work-complated', (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['worker']), (req, res, next) => resolver_1.workerbookingController.workComplated(req, res, next));
        this.router.get('/service/allBookings', (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['worker']), (req, res, next) => resolver_1.workerbookingController.allBookings(req, res, next));
        this.router.get('/profile/walletData', (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['worker']), (req, res, next) => resolver_1.workingDetailsController.getWalletData(req, res, next));
        this.router.get('/profile/transactions', (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['worker']), (req, res, next) => resolver_1.workingDetailsController.getTransactions(req, res, next));
        this.router.get('/chat/chatInbox', (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['worker']), (req, res, next) => resolver_1.chatController.getWorkerInboxUsers(req, res, next));
        this.router.get('/chat/chatHistory', (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['worker']), (req, res, next) => resolver_1.chatController.getChatHistory(req, res, next));
        this.router.get('/dashboard', (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['worker']), (req, res, next) => resolver_1.workerController.getDashboard(req, res, next));
        this.router.get('/notifications', (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['worker']), (req, res, next) => resolver_1.notificationController.getNotifications(req, res, next));
        this.router.patch('/notifications/:id/read', (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['worker']), (req, res, next) => resolver_1.notificationController.markAsRead(req, res, next));
        this.router.patch('/notifications/read-all', (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['worker']), (req, res, next) => resolver_1.notificationController.markAllRead(req, res, next));
    }
}
exports.WorkerRoute = WorkerRoute;
