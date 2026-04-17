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
exports.LoginService = void 0;
const tsyringe_1 = require("tsyringe");
const types_1 = require("../../config/constants/types");
const custom_error_1 = require("../../utils/custom-error");
const message_1 = require("../../config/constants/message");
const status_code_1 = require("../../config/constants/status-code");
const user_mapper_1 = require("../../utils/mapper/user-mapper");
const worker_mapper_1 = require("../../utils/mapper/worker-mapper");
const admin_mapper_1 = require("../../utils/mapper/admin-mapper");
let LoginService = class LoginService {
    constructor(_adminRepo, _workerRepo, _userRepo, _passwordHash, _jwtService) {
        this._adminRepo = _adminRepo;
        this._workerRepo = _workerRepo;
        this._userRepo = _userRepo;
        this._passwordHash = _passwordHash;
        this._jwtService = _jwtService;
    }
    execute(user) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let repository;
                if (user.role == 'admin') {
                    repository = this._adminRepo;
                }
                else if (user.role == 'user') {
                    repository = this._userRepo;
                }
                else if (user.role == 'worker') {
                    repository = this._workerRepo;
                }
                else {
                    throw new custom_error_1.CustomError('invalid role', status_code_1.STATUS_CODES.UNAUTHORIZED);
                }
                const userData = yield repository.findByEmail(user.email);
                console.log(userData);
                if (!userData) {
                    throw new custom_error_1.CustomError(message_1.MESSAGES.USER_NOT_FOUND, status_code_1.STATUS_CODES.UNAUTHORIZED);
                }
                if (user.role != 'admin') {
                    if (userData.isBlocked) {
                        return {
                            success: false, message: user.role == 'user' ? message_1.MESSAGES.USER_BLOCKED : message_1.MESSAGES.WORKER_BLOCKED, accessToken: null, refreshToken: null, user: null,
                        };
                    }
                }
                if (!userData) {
                    throw new custom_error_1.CustomError(message_1.MESSAGES.INVALID_CREDENTIALS, status_code_1.STATUS_CODES.UNAUTHORIZED);
                }
                if (!userData.password) {
                    throw new custom_error_1.CustomError(message_1.MESSAGES.INVALID_CREDENTIALS, status_code_1.STATUS_CODES.UNAUTHORIZED);
                }
                const isPasswordValid = yield this._passwordHash.compare(user.password, userData.password);
                if (!isPasswordValid) {
                    console.log('password is wrong');
                    throw new custom_error_1.CustomError(message_1.MESSAGES.INVALID_CREDENTIALS, status_code_1.STATUS_CODES.UNAUTHORIZED);
                }
                const accessToken = this._jwtService.generateAccessToken(userData._id.toString(), user.role);
                const refreshToken = this._jwtService.generateRefreshToken(userData._id.toString(), user.role);
                if (!accessToken || !refreshToken) {
                    console.log('token not found');
                    throw new custom_error_1.CustomError(message_1.MESSAGES.BAD_REQUEST, status_code_1.STATUS_CODES.UNAUTHORIZED);
                }
                let data;
                if (user.role == 'user') {
                    data = user_mapper_1.UserMapper.resposeWorkerDto(userData);
                }
                else if (user.role == 'worker') {
                    data = worker_mapper_1.WorkerMapper.responseWorkerDto(userData);
                }
                else if (user.role == 'admin') {
                    data = admin_mapper_1.AdminMapper.resAdminData(userData);
                }
                else {
                    throw new custom_error_1.CustomError(message_1.MESSAGES.INVALID_CREDENTIALS, status_code_1.STATUS_CODES.UNAUTHORIZED);
                }
                return {
                    success: true, message: message_1.MESSAGES.LOGIN_SUCCESS, accessToken, refreshToken, user: data,
                };
            }
            catch (error) {
                console.error(error);
                throw new custom_error_1.CustomError(message_1.MESSAGES.INVALID_CREDENTIALS, status_code_1.STATUS_CODES.UNAUTHORIZED);
            }
        });
    }
};
exports.LoginService = LoginService;
exports.LoginService = LoginService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(types_1.TYPES.AdminRepository)),
    __param(1, (0, tsyringe_1.inject)(types_1.TYPES.WorkerRepository)),
    __param(2, (0, tsyringe_1.inject)(types_1.TYPES.AuthUserRepository)),
    __param(3, (0, tsyringe_1.inject)(types_1.TYPES.PasswordService)),
    __param(4, (0, tsyringe_1.inject)(types_1.TYPES.JwtService)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], LoginService);
