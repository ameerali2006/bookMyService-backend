"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtService = void 0;
const inversify_1 = require("inversify");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../../config/env/env");
let JwtService = class JwtService {
    generateAccessToken(_id, role) {
        return jsonwebtoken_1.default.sign({ _id, role }, env_1.ENV.ACCESS_TOKEN_SECRET, {
            expiresIn: env_1.ENV.ACCESS_TOKEN_EXPIRY,
        });
    }
    generateRefreshToken(_id, role) {
        return jsonwebtoken_1.default.sign({ _id, role }, env_1.ENV.REFRESH_TOKEN_SECRET, {
            expiresIn: env_1.ENV.REFRESH_TOKEN_EXPIRY,
        });
    }
    verifyToken(token, type) {
        const secret = type === 'access' ? env_1.ENV.ACCESS_TOKEN_SECRET : env_1.ENV.REFRESH_TOKEN_SECRET;
        try {
            return jsonwebtoken_1.default.verify(token, secret);
        }
        catch (error) {
            console.error('error on jwt :', error);
            return null;
        }
    }
    generateResetToken(email) {
        return jsonwebtoken_1.default.sign({ email }, env_1.ENV.RESET_SECRET_KEY, {
            expiresIn: env_1.ENV.RESET_EXPIRES_IN,
        });
    }
    verifyResetToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, env_1.ENV.RESET_SECRET_KEY);
        }
        catch (error) {
            console.error('Reset token verification failed:', error);
            return null;
        }
    }
    decodeResetToken(token) {
        try {
            return jsonwebtoken_1.default.decode(token);
        }
        catch (error) {
            console.error('Reset token decoding failed', error);
            return null;
        }
    }
};
exports.JwtService = JwtService;
exports.JwtService = JwtService = __decorate([
    (0, inversify_1.injectable)()
], JwtService);
