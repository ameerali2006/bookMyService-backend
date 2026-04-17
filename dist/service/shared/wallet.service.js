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
exports.WalletService = void 0;
const tsyringe_1 = require("tsyringe");
const types_1 = require("../../config/constants/types");
let WalletService = class WalletService {
    constructor(walletRepo, walletTransaction) {
        this.walletRepo = walletRepo;
        this.walletTransaction = walletTransaction;
    }
    getOrCreateWallet(userId, role) {
        return __awaiter(this, void 0, void 0, function* () {
            let wallet = yield this.walletRepo.findByUser(userId, role);
            if (!wallet) {
                wallet = yield this.walletRepo.create({
                    userId,
                    role,
                    balance: 0,
                    isFrozen: false,
                });
            }
            return wallet;
        });
    }
    addBalance(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId, role, amount, description, } = data;
                const wallet = yield this.getOrCreateWallet(userId, role);
                if (wallet.isFrozen) {
                    return { success: false, message: 'Wallet is frozen' };
                }
                const balanceBefore = wallet.balance;
                const balanceAfter = wallet.balance + amount;
                const transactionPayload = {
                    walletId: wallet._id.toString(),
                    type: data.type || 'TOPUP',
                    amount,
                    direction: 'CREDIT',
                    balanceBefore,
                    balanceAfter,
                    description: description || 'Balance credited',
                    status: 'SUCCESS',
                };
                yield Promise.all([
                    this.walletRepo.updateBalance(wallet._id.toString(), balanceAfter),
                    this.walletTransaction.createTransaction(transactionPayload),
                ]);
                return { success: true, message: 'Balance credited successfully' };
            }
            catch (error) {
                return { success: false, message: 'Something went wrong' };
            }
        });
    }
    getWalletData(ownerId, role) {
        return __awaiter(this, void 0, void 0, function* () {
            const wallet = yield this.getOrCreateWallet(ownerId, role);
            if (!wallet) {
                return {
                    success: false,
                    message: 'Wallet not found',
                    data: {
                        balance: 0,
                        isFrozen: false,
                        lastActivityAt: new Date(),
                        role,
                    },
                };
            }
            return {
                success: true,
                message: 'Wallet data fetched successfully',
                data: {
                    balance: wallet.balance,
                    isFrozen: wallet.isFrozen,
                    lastActivityAt: wallet.updatedAt,
                    role,
                },
            };
        });
    }
    creditAdminWallet(amount, paymentIntentId) {
        return __awaiter(this, void 0, void 0, function* () {
            const adminWallet = yield this.walletRepo.findAdminWallet();
            if (!adminWallet)
                return null;
            const before = adminWallet.balance;
            const after = before + amount;
            yield this.walletTransaction.createTransaction({
                walletId: adminWallet._id.toString(),
                type: 'TOPUP',
                direction: 'CREDIT',
                amount,
                balanceBefore: before,
                balanceAfter: after,
                status: 'SUCCESS',
                description: `Stripe payment credited to admin wallet (${paymentIntentId})`,
            });
            return yield this.walletRepo.updateById(adminWallet._id.toString(), {
                balance: after,
                lastActivityAt: new Date(),
            });
        });
    }
    debitBalance(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId, role, amount, description, type, } = data;
                const wallet = yield this.getOrCreateWallet(userId, role);
                if (wallet.isFrozen) {
                    return { success: false, message: 'Wallet is frozen' };
                }
                if (wallet.balance < amount) {
                    return { success: false, message: 'Insufficient wallet balance' };
                }
                const balanceBefore = wallet.balance;
                const balanceAfter = wallet.balance - amount;
                const transactionPayload = {
                    walletId: wallet._id.toString(),
                    type,
                    amount,
                    direction: 'DEBIT',
                    balanceBefore,
                    balanceAfter,
                    description: description || 'Wallet payment',
                    status: 'SUCCESS',
                };
                yield Promise.all([
                    this.walletRepo.updateBalance(wallet._id.toString(), balanceAfter),
                    this.walletTransaction.createTransaction(transactionPayload),
                ]);
                return {
                    success: true,
                    message: 'Payment completed successfully',
                };
            }
            catch (error) {
                return {
                    success: false,
                    message: 'Something went wrong',
                };
            }
        });
    }
};
exports.WalletService = WalletService;
exports.WalletService = WalletService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(types_1.TYPES.WalletRepository)),
    __param(1, (0, tsyringe_1.inject)(types_1.TYPES.TransactionRepository)),
    __metadata("design:paramtypes", [Object, Object])
], WalletService);
