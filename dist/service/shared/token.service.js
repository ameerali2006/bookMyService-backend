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
exports.TokenService = void 0;
const tsyringe_1 = require("tsyringe");
const types_1 = require("../../config/constants/types");
const custom_error_1 = require("../../utils/custom-error");
const status_code_1 = require("../../config/constants/status-code");
const message_1 = require("../../config/constants/message");
let TokenService = class TokenService {
    constructor(_redisTokenRepo, _jwtService, _refreshTokenRepository) {
        this._redisTokenRepo = _redisTokenRepo;
        this._jwtService = _jwtService;
        this._refreshTokenRepository = _refreshTokenRepository;
    }
    blacklistToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('Token received in blacklistToken:', token, typeof token);
                const decode = yield this._jwtService.verifyToken(token, 'access');
                if (!decode || typeof decode === 'string' || !decode.exp) {
                    throw new Error('Invalid Token: Missing expiration time');
                }
                const expiresIn = decode.exp - Math.floor(Date.now() / 100);
                if (expiresIn > 0) {
                    yield this._redisTokenRepo.blackListToken(token, expiresIn);
                }
            }
            catch (error) {
                console.error(error);
            }
        });
    }
    revokeRefreshToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._refreshTokenRepository.revokeRefreshToken(token);
        });
    }
    refreshToken(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const payload = yield this._jwtService.verifyToken(refreshToken, 'refresh');
            console.log('refresh tocken request ', payload);
            if (!payload) {
                throw new custom_error_1.CustomError(message_1.MESSAGES.INVALID_TOKEN, status_code_1.STATUS_CODES.BAD_REQUEST);
            }
            return {
                role: payload.role,
                accessToken: this._jwtService.generateAccessToken(payload._id, payload.role),
            };
        });
    }
};
exports.TokenService = TokenService;
exports.TokenService = TokenService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(types_1.TYPES.RedisTokenService)),
    __param(1, (0, tsyringe_1.inject)(types_1.TYPES.JwtService)),
    __param(2, (0, tsyringe_1.inject)(types_1.TYPES.RefreshTokenRepository)),
    __metadata("design:paramtypes", [Object, Object, Object])
], TokenService);
