"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
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
exports.BlockStatusMiddleware = void 0;
const tsyringe_1 = require("tsyringe");
const types_1 = require("../config/constants/types");
const custom_error_1 = require("../utils/custom-error");
const message_1 = require("../config/constants/message");
const status_code_1 = require("../config/constants/status-code");
const cookie_helper_1 = require("../utils/cookie-helper");
let BlockStatusMiddleware = class BlockStatusMiddleware {
    constructor(_tokenService, _userRepo, _workerRepo) {
        this._tokenService = _tokenService;
        this._userRepo = _userRepo;
        this._workerRepo = _workerRepo;
        this.checkStatus = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.user) {
                    return res.status(status_code_1.STATUS_CODES.UNAUTHORIZED).json({
                        status: 'error',
                        message: 'Unauthorized: No user found in request',
                    });
                }
                const { userId, role, access_token, refresh_token, } = req.user;
                if (!['user', 'worker'].includes(role)) {
                    return res.status(status_code_1.STATUS_CODES.BAD_REQUEST).json({
                        success: false,
                        message: message_1.MESSAGES.INVALID_CREDENTIALS,
                    });
                }
                const status = yield this.getUserStatus(userId, role);
                if (status == null) {
                    console.log('ividdennu preshnam');
                    return res.status(status_code_1.STATUS_CODES.NOT_FOUND).json({
                        success: false,
                        message: message_1.MESSAGES.USER_NOT_FOUND,
                    });
                }
                if (status) {
                    yield Promise.all([
                        this._tokenService.blacklistToken(access_token),
                        this._tokenService.revokeRefreshToken(refresh_token),
                    ]);
                    (0, cookie_helper_1.clearAuthCookies)(res, 'access_token', 'refresh_token');
                    return res.status(status_code_1.STATUS_CODES.FORBIDDEN).json({
                        success: false,
                        message: 'Access denied: Your account has been blocked',
                    });
                }
                next();
            }
            catch (error) {
                console.error('Block Status Middleware Error:', error);
                res.status(status_code_1.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: 'Internal server error while checking blocked status',
                });
            }
        });
    }
    getUserStatus(userId, role) {
        return __awaiter(this, void 0, void 0, function* () {
            const repo = {
                user: this._userRepo,
                worker: this._workerRepo,
            }[role] || null;
            if (!repo) {
                throw new custom_error_1.CustomError(message_1.MESSAGES.BAD_REQUEST, status_code_1.STATUS_CODES.BAD_REQUEST);
            }
            const user = yield repo.findOne({ userId });
            return user === null || user === void 0 ? void 0 : user.isBlocked;
        });
    }
};
exports.BlockStatusMiddleware = BlockStatusMiddleware;
exports.BlockStatusMiddleware = BlockStatusMiddleware = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(types_1.TYPES.TokenService)),
    __param(1, (0, tsyringe_1.inject)(types_1.TYPES.AuthUserRepository)),
    __param(2, (0, tsyringe_1.inject)(types_1.TYPES.WorkerRepository)),
    __metadata("design:paramtypes", [Object, Object, Object])
], BlockStatusMiddleware);
