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
exports.AuthAdminService = void 0;
const tsyringe_1 = require("tsyringe");
const custom_error_1 = require("../../utils/custom-error");
const message_1 = require("../../config/constants/message");
const status_code_1 = require("../../config/constants/status-code");
const types_1 = require("../../config/constants/types");
let AuthAdminService = class AuthAdminService {
    constructor(_adminrepository, _userrepository, _passwordService, _jwtService) {
        this._adminrepository = _adminrepository;
        this._userrepository = _userrepository;
        this._passwordService = _passwordService;
        this._jwtService = _jwtService;
    }
    login(adminCredential) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(adminCredential);
            const adminData = yield this._adminrepository.findByEmail(adminCredential.email);
            if (!adminData) {
                throw new custom_error_1.CustomError(message_1.MESSAGES.INVALID_CREDENTIALS, status_code_1.STATUS_CODES.UNAUTHORIZED);
            }
            if (!adminData.password) {
                throw new custom_error_1.CustomError(message_1.MESSAGES.INVALID_CREDENTIALS, status_code_1.STATUS_CODES.UNAUTHORIZED);
            }
            const isPasswordValid = yield this._passwordService.compare(adminCredential.password, adminData.password);
            if (!isPasswordValid) {
                throw new custom_error_1.CustomError(message_1.MESSAGES.INVALID_CREDENTIALS, status_code_1.STATUS_CODES.UNAUTHORIZED);
            }
            const accessToken = this._jwtService.generateAccessToken(adminData._id, 'admin');
            const refreshToken = this._jwtService.generateRefreshToken(adminData._id, 'admin');
            const admin = { name: adminData.name, email: adminData.email };
            return { accessToken, refreshToken, admin };
        });
    }
};
exports.AuthAdminService = AuthAdminService;
exports.AuthAdminService = AuthAdminService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(types_1.TYPES.AdminRepository)),
    __param(1, (0, tsyringe_1.inject)(types_1.TYPES.AuthUserRepository)),
    __param(2, (0, tsyringe_1.inject)(types_1.TYPES.PasswordService)),
    __param(3, (0, tsyringe_1.inject)(types_1.TYPES.JwtService)),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], AuthAdminService);
