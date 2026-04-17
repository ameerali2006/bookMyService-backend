"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
exports.RedisTokenService = void 0;
const tsyringe_1 = require("tsyringe");
const redis_1 = require("../../config/redis");
const custom_error_1 = require("../../utils/custom-error");
let RedisTokenService = class RedisTokenService {
    blackListToken(token, expiresIn) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof token !== 'string') {
                console.error('Invalid token type:', typeof token, token);
                throw new Error('Token must be a string');
            }
            yield redis_1.redisClient.set(token, 'blacklisted', { EX: expiresIn });
        });
    }
    isTokenBlackListed(token) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield redis_1.redisClient.get(token);
            return result === 'blacklisted';
        });
    }
    // Reset token
    storeResetToken(userId, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = `reset_token:${userId}`;
            try {
                const res = yield redis_1.redisClient.setEx(key, 300, token);
                console.log('Reset token stored in Redis.', res);
            }
            catch (err) {
                console.error('Redis setEx failed:', err);
                throw new custom_error_1.CustomError('Failed to store token in Redis', 500); // real reason
            }
        });
    }
    verifyResetToken(userId, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = `reset_token:${userId}`;
            const storedToken = yield redis_1.redisClient.get(key);
            console.log('🔍 Stored token from Redis:', storedToken);
            console.log('🔐 Token from URL:', token);
            return storedToken === token;
        });
    }
    deleteResetToken(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = `reset_token:${userId}`;
            yield redis_1.redisClient.del(key);
        });
    }
};
exports.RedisTokenService = RedisTokenService;
exports.RedisTokenService = RedisTokenService = __decorate([
    (0, tsyringe_1.injectable)()
], RedisTokenService);
