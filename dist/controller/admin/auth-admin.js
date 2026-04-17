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
exports.AuthAdminController = void 0;
const tsyringe_1 = require("tsyringe");
const status_code_1 = require("../../config/constants/status-code");
const message_1 = require("../../config/constants/message");
const types_1 = require("../../config/constants/types");
const cookie_helper_1 = require("../../utils/cookie-helper");
let AuthAdminController = class AuthAdminController {
    constructor(_authAdminService, _tokenService, _jwtService, _Login) {
        this._authAdminService = _authAdminService;
        this._tokenService = _tokenService;
        this._jwtService = _jwtService;
        this._Login = _Login;
    }
    login(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const loginCredential = req.body;
                const { message, success, refreshToken, accessToken, user: admin, } = yield this._Login.execute(loginCredential);
                if (success && refreshToken && accessToken) {
                    const accessTokenName = 'access_token';
                    const refreshTokenName = 'refresh_token';
                    (0, cookie_helper_1.setAuthCookies)(res, accessToken, refreshToken, accessTokenName, refreshTokenName);
                    res
                        .status(status_code_1.STATUS_CODES.OK)
                        .json({ success: true, message: message_1.MESSAGES.LOGIN_SUCCESS, admin });
                }
            }
            catch (error) {
                next(error);
            }
        });
    }
    logout(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('log out');
                yield this._tokenService.blacklistToken(req.user.access_token);
                console.log('1');
                yield this._tokenService.revokeRefreshToken(req.user.refresh_token);
                console.log('12');
                const { user } = req;
                const accessTokenName = 'access_token';
                const refreshTokenName = 'refresh_token';
                (0, cookie_helper_1.clearAuthCookies)(res, accessTokenName, refreshTokenName);
                console.log('13');
                res.status(status_code_1.STATUS_CODES.OK).json({
                    success: true,
                    message: message_1.MESSAGES.LOGOUT_SUCCESS,
                });
            }
            catch (error) {
                console.error(error);
            }
        });
    }
    handleTokenRefresh(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                console.log('ALL COOKIES:', req.cookies);
                const refreshToken = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.refresh_token;
                console.log('REFRESH TOKEN FROM COOKIE:', refreshToken);
                if (!refreshToken) {
                    console.log('NO REFRESH TOKEN FOUND');
                    res.status(401).json({
                        message: 'Refresh token missing',
                    });
                    return;
                }
                const payload = this._jwtService.verifyToken(refreshToken, 'refresh');
                console.log('REFRESH PAYLOAD:', payload);
                const newTokens = yield this._tokenService.refreshToken(refreshToken);
                (0, cookie_helper_1.updateCookieWithAccessToken)(res, newTokens.accessToken, 'access_token');
                res.status(200).json({
                    success: true,
                    message: 'Token refreshed',
                });
            }
            catch (error) {
                console.log('REFRESH ERROR:', error);
                (0, cookie_helper_1.clearAuthCookies)(res, 'access_token', 'refresh_token');
                res.status(401).json({
                    message: 'Invalid refresh token',
                });
            }
        });
    }
};
exports.AuthAdminController = AuthAdminController;
exports.AuthAdminController = AuthAdminController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(types_1.TYPES.AuthAdminService)),
    __param(1, (0, tsyringe_1.inject)(types_1.TYPES.TokenService)),
    __param(2, (0, tsyringe_1.inject)(types_1.TYPES.JwtService)),
    __param(3, (0, tsyringe_1.inject)(types_1.TYPES.LoginService)),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], AuthAdminController);
