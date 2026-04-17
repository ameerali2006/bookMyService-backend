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
exports.RegisterService = void 0;
const tsyringe_1 = require("tsyringe");
const types_1 = require("../../config/constants/types");
const message_1 = require("../../config/constants/message");
const status_code_1 = require("../../config/constants/status-code");
const custom_error_1 = require("../../utils/custom-error");
const user_mapper_1 = require("../../utils/mapper/user-mapper");
const worker_mapper_1 = require("../../utils/mapper/worker-mapper");
let RegisterService = class RegisterService {
    constructor(_workerRepo, _userRepo, _passwordHash, _jwtService) {
        this._workerRepo = _workerRepo;
        this._userRepo = _userRepo;
        this._passwordHash = _passwordHash;
        this._jwtService = _jwtService;
    }
    execute(user) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let repository;
                if (user.role == 'user') {
                    repository = this._userRepo;
                }
                else if (user.role == 'worker') {
                    repository = this._workerRepo;
                }
                else {
                    throw new custom_error_1.CustomError(message_1.MESSAGES.INVALID_CREDENTIALS, status_code_1.STATUS_CODES.UNAUTHORIZED);
                }
                const existingUser = yield repository.findByEmail(user.email);
                if (existingUser) {
                    throw new custom_error_1.CustomError(message_1.MESSAGES.ALREADY_EXISTS, status_code_1.STATUS_CODES.CONFLICT);
                }
                if (!user.password) {
                    throw new custom_error_1.CustomError(message_1.MESSAGES.INVALID_CREDENTIALS, status_code_1.STATUS_CODES.UNAUTHORIZED);
                }
                user.password = yield this._passwordHash.hash(user.password);
                let userDbData;
                if (user.role == 'worker') {
                    const workerData = {
                        name: user.name,
                        email: user.email,
                        phone: user.phone,
                        password: user.password,
                        location: {
                            type: 'Point',
                            coordinates: [
                                parseFloat(user.longitude),
                                parseFloat(user.latitude),
                            ],
                        },
                        zone: user.zone,
                        category: user.category,
                        experience: user.experience,
                        documents: user.documents,
                    };
                    userDbData = yield repository.create(workerData);
                }
                else {
                    userDbData = yield repository.create(user);
                }
                let userData;
                if (user.role == 'user') {
                    userData = user_mapper_1.UserMapper.resposeWorkerDto(userDbData);
                }
                else if (user.role == 'worker') {
                    userData = worker_mapper_1.WorkerMapper.responseWorkerDto(userDbData);
                }
                else {
                    throw new custom_error_1.CustomError(message_1.MESSAGES.INVALID_CREDENTIALS, status_code_1.STATUS_CODES.UNAUTHORIZED);
                }
                const accessToken = this._jwtService.generateAccessToken(userDbData._id.toString(), user.role);
                const refreshToken = this._jwtService.generateRefreshToken(userDbData._id.toString(), user.role);
                return {
                    accessToken,
                    refreshToken,
                    user: userData,
                };
            }
            catch (error) {
                console.error(error);
                throw new custom_error_1.CustomError(message_1.MESSAGES.INVALID_CREDENTIALS, status_code_1.STATUS_CODES.UNAUTHORIZED);
            }
        });
    }
};
exports.RegisterService = RegisterService;
exports.RegisterService = RegisterService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(types_1.TYPES.WorkerRepository)),
    __param(1, (0, tsyringe_1.inject)(types_1.TYPES.AuthUserRepository)),
    __param(2, (0, tsyringe_1.inject)(types_1.TYPES.PasswordService)),
    __param(3, (0, tsyringe_1.inject)(types_1.TYPES.JwtService)),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], RegisterService);
