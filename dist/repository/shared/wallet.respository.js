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
exports.WalletRepository = void 0;
// src/repository/implementation/wallet.repository.ts
const inversify_1 = require("inversify");
const base_repository_1 = require("./base.repository");
const wallet_model_1 = require("../../model/wallet.model");
let WalletRepository = class WalletRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(wallet_model_1.WalletModel);
    }
    createWallet(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield wallet_model_1.WalletModel.create(data);
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield wallet_model_1.WalletModel.findById(id).exec();
        });
    }
    findByUser(userId, role) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield wallet_model_1.WalletModel.findOne({ userId, role }).exec();
        });
    }
    updateBalance(id, balance) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield wallet_model_1.WalletModel.findByIdAndUpdate(id, { balance, lastActivityAt: new Date() }, { new: true });
        });
    }
    freezeWallet(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield wallet_model_1.WalletModel.findByIdAndUpdate(id, { isFrozen: true, lastActivityAt: new Date() }, { new: true });
        });
    }
    unfreezeWallet(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield wallet_model_1.WalletModel.findByIdAndUpdate(id, { isFrozen: false, lastActivityAt: new Date() }, { new: true });
        });
    }
    updateLastActivity(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield wallet_model_1.WalletModel.findByIdAndUpdate(id, { lastActivityAt: new Date() }, { new: true });
        });
    }
    deleteWallet(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield wallet_model_1.WalletModel.findByIdAndDelete(id);
        });
    }
    findByRole(role) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield wallet_model_1.WalletModel.find({ role }).sort({ createdAt: -1 }).exec();
        });
    }
    findAdminWallet() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield wallet_model_1.WalletModel.findOne({ role: 'admin' });
        });
    }
};
exports.WalletRepository = WalletRepository;
exports.WalletRepository = WalletRepository = __decorate([
    (0, inversify_1.injectable)(),
    __metadata("design:paramtypes", [])
], WalletRepository);
