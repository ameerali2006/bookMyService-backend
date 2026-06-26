"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminRoute = void 0;
const base_route_1 = require("../routes/base.route");
const resolver_1 = require("../config/di/resolver");
const auth_middleware_1 = require("../middleware/auth.middleware");
const apiRoutes_1 = require("../config/constants/apiRoutes");
class AdminRoute extends base_route_1.BaseRoute {
    constructor() {
        super();
    }
    initializeRoutes() {
        this.router.post(apiRoutes_1.BACKEND_ROUTES.ADMIN.LOGIN, (req, res, next) => {
            resolver_1.authAdminController.login(req, res, next);
        });
        this.router.post(apiRoutes_1.BACKEND_ROUTES.ADMIN.LOGOUT, (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['admin']), (req, res, next) => {
            resolver_1.authAdminController.logout(req, res, next);
        });
        this.router.get(apiRoutes_1.BACKEND_ROUTES.ADMIN.USERS, (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['admin']), (req, res, next) => {
            resolver_1.managementAdminController.getAllUsers(req, res, next);
        });
        this.router.patch(apiRoutes_1.BACKEND_ROUTES.ADMIN.UPDATE_USER_STATUS, (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['admin']), (req, res, next) => {
            resolver_1.managementAdminController.updateUserStatus(req, res, next);
        });
        this.router.get(apiRoutes_1.BACKEND_ROUTES.ADMIN.WORKERS, (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['admin']), (req, res, next) => {
            resolver_1.managementAdminController.getAllWorkers(req, res, next);
        });
        this.router.patch(apiRoutes_1.BACKEND_ROUTES.ADMIN.UPDATE_WORKER_STATUS, (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['admin']), (req, res, next) => {
            resolver_1.managementAdminController.updateWorkerStatus(req, res, next);
        });
        this.router.patch(apiRoutes_1.BACKEND_ROUTES.ADMIN.VERIFY_WORKER, (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['admin']), (req, res, next) => {
            resolver_1.managementAdminController.verifyWorker(req, res, next);
        });
        this.router.get(apiRoutes_1.BACKEND_ROUTES.ADMIN.UNVERIFIED_WORKERS, (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['admin']), (req, res, next) => {
            resolver_1.managementAdminController.unVerifiedWorkers(req, res, next);
        });
        this.router.get(apiRoutes_1.BACKEND_ROUTES.ADMIN.SERVICES, (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['admin']), (req, res, next) => {
            resolver_1.managementAdminController.getAllServices(req, res, next);
        });
        this.router.get(apiRoutes_1.BACKEND_ROUTES.ADMIN.CLOUDINARY_SIGNATURE, (req, res, next) => {
            resolver_1.cloudinaryController.getSignature(req, res, next);
        });
        this.router.post(apiRoutes_1.BACKEND_ROUTES.ADMIN.CREATE_SERVICE, (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['admin']), (req, res, next) => {
            console.log('/services/create');
            resolver_1.managementAdminController.serviceRegister(req, res, next);
        });
        this.router.patch(apiRoutes_1.BACKEND_ROUTES.ADMIN.UPDATE_SERVICE_STATUS, (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['admin']), (req, res, next) => {
            resolver_1.managementAdminController.updateServiceStatus(req, res, next);
        });
        this.router.post(apiRoutes_1.BACKEND_ROUTES.ADMIN.REFRESH_TOKEN, (req, res, next) => resolver_1.authAdminController.handleTokenRefresh(req, res));
        this.router.get(apiRoutes_1.BACKEND_ROUTES.ADMIN.BOOKINGS, (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['admin']), (req, res, next) => {
            resolver_1.managementAdminController.getBookings(req, res, next);
        });
        this.router.get(apiRoutes_1.BACKEND_ROUTES.ADMIN.BOOKING_DETAIL, (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['admin']), (req, res, next) => {
            resolver_1.managementAdminController.getBookingDetailPage(req, res, next);
        });
        this.router.get(apiRoutes_1.BACKEND_ROUTES.ADMIN.WALLET_DATA, (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['admin']), (req, res, next) => {
            resolver_1.managementAdminController.getWalletData(req, res, next);
        });
        this.router.get(apiRoutes_1.BACKEND_ROUTES.ADMIN.TRANSACTIONS, (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['admin']), (req, res, next) => {
            resolver_1.managementAdminController.getTransactions(req, res, next);
        });
        this.router.get(apiRoutes_1.BACKEND_ROUTES.ADMIN.DASHBOARD, (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['admin']), (req, res, next) => {
            resolver_1.managementAdminController.getDashboard(req, res, next);
        });
        this.router.get(apiRoutes_1.BACKEND_ROUTES.ADMIN.REVIEWS, (0, auth_middleware_1.verifyAuth)(), (0, auth_middleware_1.authorizeRole)(['admin']), (req, res, next) => {
            resolver_1.reviewController.allReviewManagement(req, res, next);
        });
    }
}
exports.AdminRoute = AdminRoute;
