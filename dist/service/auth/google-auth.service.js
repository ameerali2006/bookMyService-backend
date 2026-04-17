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
exports.GoogleService = void 0;
const tsyringe_1 = require("tsyringe");
const types_1 = require("../../config/constants/types");
const custom_error_1 = require("../../utils/custom-error");
const user_mapper_1 = require("../../utils/mapper/user-mapper");
const message_1 = require("../../config/constants/message");
const status_code_1 = require("../../config/constants/status-code");
let GoogleService = class GoogleService {
    constructor(_workerRepo, _userRepo, _googleAuth, _jwtService) {
        this._workerRepo = _workerRepo;
        this._userRepo = _userRepo;
        this._googleAuth = _googleAuth;
        this._jwtService = _jwtService;
    }
    execute(token, role) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const payload = yield this._googleAuth.verifyToken(token);
                if (!payload || !payload.email || !payload.name) {
                    console.log(payload);
                    throw new custom_error_1.CustomError('Invalid Google Token', 400);
                }
                const { email, name, sub, picture, } = payload;
                let repository;
                if (role == 'user') {
                    repository = this._userRepo;
                }
                else if (role == 'worker') {
                    repository = this._workerRepo;
                }
                else {
                    throw new custom_error_1.CustomError('Invalid Role', 400);
                }
                const user = yield repository.findByEmail(email);
                if (user) {
                    const accessToken = this._jwtService.generateAccessToken(user._id.toString(), role);
                    const refreshToken = this._jwtService.generateRefreshToken(user._id.toString(), role);
                    return {
                        success: true,
                        message: 'login successfull',
                        accessToken,
                        refreshToken,
                        user: {
                            _id: user._id.toString(),
                            name: user.name,
                            email: user.email,
                            googleId: sub,
                            image: role == 'user' ? user.image || null : user.profileImage || null,
                        },
                        isNew: false,
                    };
                }
                if (role == 'user') {
                    const UserData = {
                        email,
                        name,
                        googleId: sub,
                    };
                    const userModel = user_mapper_1.UserMapper.toRegistrationModel(UserData);
                    const newUser = yield repository.create(userModel);
                    const accessToken = this._jwtService.generateAccessToken(newUser._id.toString(), role);
                    const refreshToken = this._jwtService.generateRefreshToken(newUser._id.toString(), role);
                    return {
                        success: true,
                        message: 'register successfull',
                        accessToken,
                        refreshToken,
                        user: {
                            name: newUser.name,
                            email: newUser.email,
                            googleId: sub,
                            image: newUser.image,
                        },
                        isNew: false,
                    };
                }
                return {
                    success: true,
                    message: 'Google user verified',
                    accessToken: null,
                    refreshToken: null,
                    user: {
                        email,
                        name,
                        googleId: sub,
                        image: picture || null,
                    },
                    isNew: false,
                };
            }
            catch (error) {
                throw new custom_error_1.CustomError(message_1.MESSAGES.ACCOUNT_NOT_VERIFIED, status_code_1.STATUS_CODES.BAD_REQUEST);
            }
        });
    }
};
exports.GoogleService = GoogleService;
exports.GoogleService = GoogleService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(types_1.TYPES.WorkerRepository)),
    __param(1, (0, tsyringe_1.inject)(types_1.TYPES.AuthUserRepository)),
    __param(2, (0, tsyringe_1.inject)(types_1.TYPES.GoogleAuthService)),
    __param(3, (0, tsyringe_1.inject)(types_1.TYPES.JwtService)),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], GoogleService);
