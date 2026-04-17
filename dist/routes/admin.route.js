"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminRoute = void 0;
const base_route_1 = require("../routes/base.route");
const resolver_1 = require("../config/di/resolver");
const auth_middleware_1 = require("../middleware/auth.middleware");
class AdminRoute extends base_route_1.BaseRoute {
    constructor() {
        super();
    }
    initializeRoutes() {
        this.router.post('/login', (req, res, next) => {
            resolver_1.authAdminController.login(req, res, next);
        });
        this.router.post('/logout', (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['admin']), (req, res, next) => {
            resolver_1.authAdminController.logout(req, res, next);
        });
        this.router.get('/users', (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['admin']), (req, res, next) => {
            resolver_1.managementAdminController.getAllUsers(req, res, next);
        });
        this.router.patch('/users/:userId/status', (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['admin']), (req, res, next) => {
            resolver_1.managementAdminController.updateUserStatus(req, res, next);
        });
        this.router.get('/workers', (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['admin']), (req, res, next) => {
            resolver_1.managementAdminController.getAllWorkers(req, res, next);
        });
        this.router.patch('/workers/:userId/status', (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['admin']), (req, res, next) => {
            resolver_1.managementAdminController.updateWorkerStatus(req, res, next);
        });
        this.router.patch('/workers/:workerId/unverified', (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['admin']), (req, res, next) => {
            resolver_1.managementAdminController.verifyWorker(req, res, next);
        });
        this.router.get('/workers/unverified', (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['admin']), (req, res, next) => {
            resolver_1.managementAdminController.unVerifiedWorkers(req, res, next);
        });
        this.router.get('/services', (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['admin']), (req, res, next) => {
            resolver_1.managementAdminController.getAllServices(req, res, next);
        });
        this.router.get('/cloudinary-signature', (req, res, next) => {
            resolver_1.cloudinaryController.getSignature(req, res, next);
        });
        this.router.post('/services/create', (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['admin']), (req, res, next) => {
            console.log('/services/create');
            resolver_1.managementAdminController.serviceRegister(req, res, next);
        });
        this.router.patch('/services/:id/status', (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['admin']), (req, res, next) => {
            resolver_1.managementAdminController.updateServiceStatus(req, res, next);
        });
        this.router.post('/refresh-token', (req, res, next) => resolver_1.authAdminController.handleTokenRefresh(req, res));
        this.router.get('/bookings', (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['admin']), (req, res, next) => {
            resolver_1.managementAdminController.getBookings(req, res, next);
        });
        this.router.get('/booking/:bookingId', (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['admin']), (req, res, next) => {
            resolver_1.managementAdminController.getBookingDetailPage(req, res, next);
        });
        this.router.get('/wallet/walletData', (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['admin']), (req, res, next) => {
            resolver_1.managementAdminController.getWalletData(req, res, next);
        });
        this.router.get('/wallet/transactions', (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['admin']), (req, res, next) => {
            resolver_1.managementAdminController.getTransactions(req, res, next);
        });
        this.router.get('/dashboard', (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['admin']), (req, res, next) => {
            resolver_1.managementAdminController.getDashboard(req, res, next);
        });
        this.router.get('/reviews', (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['admin']), (req, res, next) => {
            resolver_1.reviewController.allReviewManagement(req, res, next);
        });
    }
}
exports.AdminRoute = AdminRoute;
