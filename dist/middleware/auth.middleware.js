"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeToken = exports.authorizeRole = exports.verifyAuth = void 0;
const message_1 = require("../config/constants/message");
const status_code_1 = require("../config/constants/status-code");
const jwt_auth_service_1 = require("../service/helper/jwt-auth.service");
const redis_1 = require("../config/redis");
const tokenService = new jwt_auth_service_1.JwtService();
const verifyAuth = () => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = extractToken(req);
        console.log('**token', token);
        if (!token || !token.access_token) {
            res.status(401).json({
                message: 'Token expired.',
            });
            return;
        }
        if (yield isBlacklisted(token.access_token)) {
            res.status(status_code_1.STATUS_CODES.FORBIDDEN).json({
                success: false,
                message: message_1.MESSAGES.TOKEN_BLACKLISTED,
            });
            return;
        }
        console.log('1');
        const user = tokenService.verifyToken(token.access_token, 'access');
        if (!user || !user._id) {
            res.status(401).json({
                message: 'Token expired.',
            });
            return;
        }
        req.user = Object.assign(Object.assign({}, user), { access_token: token.access_token, refresh_token: token.refresh_token });
        console.log('2');
        next(); // ✅ pass control to next middleware
    }
    catch (error) {
        if (error.name === 'TokenExpiredError') {
            console.error(error.name);
            res.status(status_code_1.STATUS_CODES.UNAUTHORIZED).json({
                message: message_1.MESSAGES.TOKEN_EXPIRED,
            });
            return;
        }
        console.error('Invalid token response sent');
        res.status(status_code_1.STATUS_CODES.UNAUTHORIZED).json({
            message: message_1.MESSAGES.INVALID_TOKEN,
        });
    }
});
exports.verifyAuth = verifyAuth;
const extractToken = (req) => {
    var _a, _b;
    console.log(req.cookies);
    const access_token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.access_token;
    const refresh_token = (_b = req.cookies) === null || _b === void 0 ? void 0 : _b.refresh_token;
    console.log('tokens:', { access_token, refresh_token });
    if (!access_token || !refresh_token)
        return null;
    return { access_token, refresh_token };
};
//* ─────────────────────────────────────────────────────────────
//*                  🛠️ Blacklist checker Fn
//* ─────────────────────────────────────────────────────────────
const isBlacklisted = (token) => __awaiter(void 0, void 0, void 0, function* () {
    if (!token || typeof token !== 'string') {
        console.warn('Attempted to check blacklist with invalid token:', token);
        return false;
    }
    try {
        const result = yield redis_1.redisClient.get(token);
        console.log(result);
        return result !== null;
    }
    catch (error) {
        console.error('Redis error:', error);
        return false;
    }
});
//* ─────────────────────────────────────────────────────────────
//*                 🛠️ Authorize Role Middleware
//* ─────────────────────────────────────────────────────────────
const authorizeRole = (allowedRoles) => (req, res, next) => {
    console.log('authrole');
    const { user } = req;
    console.log(user);
    if (!user || !allowedRoles.includes(user.role)) {
        console.log('adtha valli');
        res.status(status_code_1.STATUS_CODES.FORBIDDEN).json({
            success: false,
            message: message_1.MESSAGES.UNAUTHORIZED_ACCESS,
            userRole: user ? user.role : 'none',
        });
        return;
    }
    next();
};
exports.authorizeRole = authorizeRole;
//* ─────────────────────────────────────────────────────────────
//*                 🛠️ Decode Token Middleware
//* ─────────────────────────────────────────────────────────────
const decodeToken = () => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = extractToken(req);
        if (!token) {
            res.status(status_code_1.STATUS_CODES.UNAUTHORIZED).json({
                message: message_1.MESSAGES.UNAUTHORIZED_ACCESS,
            });
            return;
        }
        if (yield isBlacklisted(token.access_token)) {
            res.status(status_code_1.STATUS_CODES.FORBIDDEN).json({
                message: message_1.MESSAGES.TOKEN_BLACKLISTED,
            });
            return;
        }
        const user = tokenService.verifyToken(token === null || token === void 0 ? void 0 : token.access_token, 'access');
        // console.log(`Decoded`, user);
        req.user = {
            _id: user === null || user === void 0 ? void 0 : user.userId,
            email: user === null || user === void 0 ? void 0 : user.email,
            role: user === null || user === void 0 ? void 0 : user.role,
            access_token: token.access_token,
            refresh_token: token.refresh_token,
        };
        next();
    }
    catch (error) { }
});
exports.decodeToken = decodeToken;
