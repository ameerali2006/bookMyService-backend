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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthWorkerController = void 0;
const tsyringe_1 = require("tsyringe");
const mongoose_1 = require("mongoose");
const types_1 = require("../../config/constants/types");
const message_1 = require("../../config/constants/message");
const status_code_1 = require("../../config/constants/status-code");
const cookie_helper_1 = require("../../utils/cookie-helper");
const register_zod_1 = require("../validation/register.zod");
let AuthWorkerController = class AuthWorkerController {
    constructor(_tokenService, _resetPassword, _Login, _Register, _Otp, _googleLogin, _isVerified, _jwtService) {
        this._tokenService = _tokenService;
        this._resetPassword = _resetPassword;
        this._Login = _Login;
        this._Register = _Register;
        this._Otp = _Otp;
        this._googleLogin = _googleLogin;
        this._isVerified = _isVerified;
        this._jwtService = _jwtService;
    }
    generateOtp(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                console.log(`otp generation ${email}`);
                yield this._Otp.generate(email);
                res
                    .status(status_code_1.STATUS_CODES.CREATED)
                    .json({ success: true, message: message_1.MESSAGES.OTP_SENT });
            }
            catch (error) {
                next(error);
            }
        });
    }
    verifyOtp(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { otp, email, role } = req.body;
                yield this._Otp.verify({ email, otp, role });
                res
                    .status(status_code_1.STATUS_CODES.OK)
                    .json({ success: true, message: message_1.MESSAGES.OTP_VERIFIED });
            }
            catch (error) {
                next(error);
            }
        });
    }
    register(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('worker register');
                const data = req.body;
                console.log(data);
                const schema = register_zod_1.schemasByRole.worker;
                console.log(schema);
                const validatedData = schema.parse(data);
                console.log('after validation');
                const Data = yield this._Register.execute(Object.assign(Object.assign({}, validatedData), { category: new mongoose_1.Types.ObjectId(validatedData.category) }));
                if (Data.accessToken && Data.refreshToken) {
                    const accessTokenName = 'access_token';
                    const refreshTokenName = 'refresh_token';
                    (0, cookie_helper_1.setAuthCookies)(res, Data.accessToken, Data.refreshToken, accessTokenName, refreshTokenName);
                }
                res.status(status_code_1.STATUS_CODES.CREATED).json({
                    success: true,
                    message: message_1.MESSAGES.REGISTRATION_SUCCESS,
                    worker: Data.user,
                });
            }
            catch (error) {
                console.error(error);
            }
        });
    }
    googleAuth(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { token, role } = req.body;
                const result = yield this._googleLogin.execute(token, role);
                if (!result.success) {
                    res.status(status_code_1.STATUS_CODES.BAD_REQUEST).json(result);
                }
                if (!result.isNew && result.accessToken && result.refreshToken) {
                    const accessTokenName = 'access_token';
                    const refreshTokenName = 'refresh_token';
                    (0, cookie_helper_1.setAuthCookies)(res, result.accessToken, result.refreshToken, accessTokenName, refreshTokenName);
                }
                const { accessToken, refreshToken } = result, cleanedData = __rest(result, ["accessToken", "refreshToken"]);
                res.status(status_code_1.STATUS_CODES.OK).json(cleanedData);
            }
            catch (error) {
                console.error('Google Auth Controller Error:', error);
                res.status(status_code_1.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: 'Something went wrong during Google authentication',
                });
            }
        });
    }
    login(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const loginCredential = req.body;
                const { success, message, refreshToken, accessToken, user: workerDto, } = yield this._Login.execute(loginCredential);
                if (!success) {
                    res
                        .status(status_code_1.STATUS_CODES.CONFLICT)
                        .json({
                        success,
                        message,
                        worker: workerDto,
                    });
                }
                if (accessToken && refreshToken) {
                    const accessTokenName = 'access_token';
                    const refreshTokenName = 'refresh_token';
                    (0, cookie_helper_1.setAuthCookies)(res, accessToken, refreshToken, accessTokenName, refreshTokenName);
                    res
                        .status(status_code_1.STATUS_CODES.OK)
                        .json({
                        success: true,
                        message: message_1.MESSAGES.LOGIN_SUCCESS,
                        worker: workerDto,
                    });
                }
            }
            catch (error) {
                next(error);
            }
        });
    }
    forgotPassword(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                if (!email) {
                    res.status(status_code_1.STATUS_CODES.BAD_REQUEST).json({
                        success: false,
                        message: message_1.MESSAGES.VALIDATION_ERROR,
                    });
                }
                yield this._resetPassword.forgotPassword(email, 'worker');
                res.status(status_code_1.STATUS_CODES.OK).json({
                    success: true,
                    message: message_1.MESSAGES.EMAIL_VERIFICATION_SENT,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    resetPassword(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('resetPassword-controller');
                const { token, password } = req.body;
                if (!token || !password) {
                    res.status(status_code_1.STATUS_CODES.BAD_REQUEST).json({
                        success: false,
                        message: message_1.MESSAGES.VALIDATION_ERROR,
                    });
                }
                yield this._resetPassword.resetPassword(token, password, 'worker');
                res.status(status_code_1.STATUS_CODES.OK).json({
                    success: true,
                    message: message_1.MESSAGES.PASSWORD_RESET_SUCCESS,
                });
            }
            catch (error) {
                next(error);
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
    logout(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('log out');
                console.log('helooo log out');
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
    isVerified(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.query;
                if (!email) {
                    res.status(status_code_1.STATUS_CODES.BAD_REQUEST).json({
                        success: false,
                        message: message_1.MESSAGES.VALIDATION_ERROR,
                    });
                }
                const data = yield this._isVerified.execute(String(email));
                if (!data._id || !data.status) {
                    res.status(status_code_1.STATUS_CODES.BAD_REQUEST).json({
                        success: false,
                        message: message_1.MESSAGES.VALIDATION_ERROR,
                    });
                }
                res.status(status_code_1.STATUS_CODES.OK).json(Object.assign({ success: true, message: message_1.MESSAGES.LOGOUT_SUCCESS }, data));
            }
            catch (error) {
                res.status(status_code_1.STATUS_CODES.BAD_REQUEST).json({
                    success: false,
                    message: message_1.MESSAGES.VALIDATION_ERROR,
                });
            }
        });
    }
};
exports.AuthWorkerController = AuthWorkerController;
exports.AuthWorkerController = AuthWorkerController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(types_1.TYPES.TokenService)),
    __param(1, (0, tsyringe_1.inject)(types_1.TYPES.ResetPassword)),
    __param(2, (0, tsyringe_1.inject)(types_1.TYPES.LoginService)),
    __param(3, (0, tsyringe_1.inject)(types_1.TYPES.RegisterService)),
    __param(4, (0, tsyringe_1.inject)(types_1.TYPES.OtpService)),
    __param(5, (0, tsyringe_1.inject)(types_1.TYPES.GoogleService)),
    __param(6, (0, tsyringe_1.inject)(types_1.TYPES.IsVerified)),
    __param(7, (0, tsyringe_1.inject)(types_1.TYPES.JwtService)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object])
], AuthWorkerController);
