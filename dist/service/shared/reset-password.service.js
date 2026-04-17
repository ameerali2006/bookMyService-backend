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
exports.ResetPassword = void 0;
const tsyringe_1 = require("tsyringe");
const types_1 = require("../../config/constants/types");
const message_1 = require("../../config/constants/message");
const custom_error_1 = require("../../utils/custom-error");
const status_code_1 = require("../../config/constants/status-code");
const env_1 = require("../../config/env/env");
let ResetPassword = class ResetPassword {
    constructor(_authUserRepo, _passwordHash, _emailService, _otpRepo, _workerRepo, _jwtService, _redisRepo) {
        this._authUserRepo = _authUserRepo;
        this._passwordHash = _passwordHash;
        this._emailService = _emailService;
        this._otpRepo = _otpRepo;
        this._workerRepo = _workerRepo;
        this._jwtService = _jwtService;
        this._redisRepo = _redisRepo;
    }
    forgotPassword(email, role) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const repository = role === 'user' ? this._authUserRepo : this._workerRepo;
                const user = yield repository.findOne({ email });
                if (!user) {
                    throw new custom_error_1.CustomError(message_1.MESSAGES.INVALID_CREDENTIALS, status_code_1.STATUS_CODES.FORBIDDEN);
                }
                if (!user._id) {
                    throw new custom_error_1.CustomError('User ID missing', status_code_1.STATUS_CODES.INTERNAL_SERVER_ERROR);
                }
                console.log(user);
                if (user.googleId) {
                    console.log({
                        success: false,
                        message: 'you are login with googleId',
                    });
                    return {
                        success: false,
                        message: 'you are login with googleId',
                    };
                }
                console.log('sjdlfdslkfdlskfslkfd');
                const resetToken = this._jwtService.generateResetToken(email);
                yield this._redisRepo.storeResetToken(user._id.toString(), resetToken);
                const rolePrefix = role === 'worker' ? '/worker' : '';
                const resetUrl = new URL(`${rolePrefix}/reset-password/${resetToken}`, env_1.ENV.FRONTEND_URI).toString();
                yield this._emailService.sendResetEmail(email, 'BookMyService - Reset your password', resetUrl);
                return {
                    success: true,
                    message: 'Password reset link sent to email',
                };
            }
            catch (error) {
                console.error('Forgot password error:', error);
                throw new custom_error_1.CustomError(message_1.MESSAGES.SERVER_ERROR, status_code_1.STATUS_CODES.INTERNAL_SERVER_ERROR);
            }
        });
    }
    resetPassword(token, password, role) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                console.log('resetPassword');
                const payload = this._jwtService.verifyResetToken(token);
                if (!payload || !payload.email) {
                    throw new custom_error_1.CustomError(message_1.MESSAGES.INVALID_TOKEN, status_code_1.STATUS_CODES.BAD_REQUEST);
                }
                const { email } = payload;
                let repository;
                if (role === 'user') {
                    repository = this._authUserRepo;
                }
                else if (role === 'worker') {
                    repository = this._workerRepo;
                }
                else {
                    throw new custom_error_1.CustomError(message_1.MESSAGES.INVALID_CREDENTIALS, status_code_1.STATUS_CODES.FORBIDDEN);
                }
                const user = yield repository.findOne({ email });
                if (!user) {
                    throw new custom_error_1.CustomError(message_1.MESSAGES.USER_NOT_FOUND, status_code_1.STATUS_CODES.NOT_FOUND);
                }
                console.log(`${user._id}***************${token}`);
                const tokenValid = yield this._redisRepo.verifyResetToken((_a = user._id.toString()) !== null && _a !== void 0 ? _a : '', token);
                console.log(tokenValid);
                if (!tokenValid) {
                    throw new custom_error_1.CustomError(message_1.MESSAGES.INVALID_TOKEN, status_code_1.STATUS_CODES.BAD_REQUEST);
                }
                const isSamePasswordAsOld = yield this._passwordHash.compare(password, user.password);
                if (isSamePasswordAsOld) {
                    throw new custom_error_1.CustomError(message_1.MESSAGES.SAME_CURR_NEW_PASSWORD, status_code_1.STATUS_CODES.BAD_REQUEST);
                }
                const hashedPassword = yield this._passwordHash.hash(password);
                yield repository.update({ email }, { password: hashedPassword });
                yield this._redisRepo.deleteResetToken((_b = user._id.toString()) !== null && _b !== void 0 ? _b : '');
            }
            catch (error) { }
        });
    }
};
exports.ResetPassword = ResetPassword;
exports.ResetPassword = ResetPassword = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(types_1.TYPES.AuthUserRepository)),
    __param(1, (0, tsyringe_1.inject)(types_1.TYPES.PasswordService)),
    __param(2, (0, tsyringe_1.inject)(types_1.TYPES.EmailService)),
    __param(3, (0, tsyringe_1.inject)(types_1.TYPES.OtpRepository)),
    __param(4, (0, tsyringe_1.inject)(types_1.TYPES.WorkerRepository)),
    __param(5, (0, tsyringe_1.inject)(types_1.TYPES.JwtService)),
    __param(6, (0, tsyringe_1.inject)(types_1.TYPES.RedisTokenService)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object])
], ResetPassword);
