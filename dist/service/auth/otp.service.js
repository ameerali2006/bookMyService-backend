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
exports.OtpService = void 0;
const tsyringe_1 = require("tsyringe");
const types_1 = require("../../config/constants/types");
const custom_error_1 = require("../../utils/custom-error");
const message_1 = require("../../config/constants/message");
const status_code_1 = require("../../config/constants/status-code");
let OtpService = class OtpService {
    constructor(_emailService, _hash, _otpRepo, _userRepo, _workerRepo) {
        this._emailService = _emailService;
        this._hash = _hash;
        this._otpRepo = _otpRepo;
        this._userRepo = _userRepo;
        this._workerRepo = _workerRepo;
    }
    generate(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const otp = Math.floor(1000 + Math.random() * 9000).toString();
            const expireAt = new Date(Date.now() + 2 * 60 * 1000);
            console.log('otp', otp);
            const hashedOtp = yield this._hash.hash(String(otp));
            const otpdata = {
                email,
                otp: hashedOtp,
                expireAt,
            };
            const content = this._emailService.generateOtpEmailContent(otp);
            const subject = 'OTP Verification';
            console.log('otp anooo');
            yield this._emailService.sendEmail(email, subject, content);
            console.log('sathanamm');
            return yield this._otpRepo.create(otpdata);
        });
    }
    verify(otpData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield this._otpRepo.findOtp(otpData.email);
                if (!data) {
                    throw new custom_error_1.CustomError(message_1.MESSAGES.OTP_INVALID, status_code_1.STATUS_CODES.UNAUTHORIZED);
                }
                const currentTime = new Date();
                const otpExpiryTime = new Date(data.expireAt);
                let repository;
                if (otpData.role == 'user') {
                    repository = this._userRepo;
                }
                else if (otpData.role == 'worker') {
                    repository = this._workerRepo;
                }
                else {
                    throw new custom_error_1.CustomError(message_1.MESSAGES.OTP_INVALID, status_code_1.STATUS_CODES.NOT_FOUND);
                }
                const user = yield repository.findByEmail(otpData.email);
                if (user) {
                    throw new custom_error_1.CustomError('Email already exists', status_code_1.STATUS_CODES.CONFLICT);
                }
                const isValid = yield this._hash.compare(String(otpData.otp), data.otp);
                if (!isValid) {
                    throw new custom_error_1.CustomError(message_1.MESSAGES.OTP_INVALID, status_code_1.STATUS_CODES.UNAUTHORIZED);
                }
                if (currentTime > otpExpiryTime) {
                    throw new custom_error_1.CustomError(message_1.MESSAGES.OTP_INVALID, status_code_1.STATUS_CODES.UNAUTHORIZED);
                }
            }
            catch (error) {
                console.error('verify otp :', error);
                throw new custom_error_1.CustomError(message_1.MESSAGES.OTP_INVALID, status_code_1.STATUS_CODES.BAD_REQUEST);
            }
        });
    }
};
exports.OtpService = OtpService;
exports.OtpService = OtpService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(types_1.TYPES.EmailService)),
    __param(1, (0, tsyringe_1.inject)(types_1.TYPES.PasswordService)),
    __param(2, (0, tsyringe_1.inject)(types_1.TYPES.OtpRepository)),
    __param(3, (0, tsyringe_1.inject)(types_1.TYPES.AuthUserRepository)),
    __param(4, (0, tsyringe_1.inject)(types_1.TYPES.WorkerRepository)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], OtpService);
