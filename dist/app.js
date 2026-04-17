"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("reflect-metadata");
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const user_route_1 = require("./routes/user.route");
const admin_route_1 = require("./routes/admin.route");
const env_1 = require("./config/env/env");
const worker_route_1 = require("./routes/worker.route");
const resolver_1 = require("./config/di/resolver");
const morgon_1 = require("./utils/morgon");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: env_1.ENV.FRONTEND_URI,
    credentials: true,
}));
app.post('/payment/webhook', express_1.default.raw({ type: 'application/json' }), (req, res, next) => resolver_1.stripeController.handleWebhook(req, res, next));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use(morgon_1.morganLogger);
app.use('/', new user_route_1.UserRoute().router);
app.use('/admin', new admin_route_1.AdminRoute().router);
app.use('/worker', new worker_route_1.WorkerRoute().router);
exports.default = app;
