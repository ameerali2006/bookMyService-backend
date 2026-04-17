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
exports.TransactionRepository = void 0;
// src/repository/implementation/wallet-transaction.repository.ts
const inversify_1 = require("inversify");
const base_repository_1 = require("./base.repository");
const transactions_model_1 = require("../../model/transactions.model");
let TransactionRepository = class TransactionRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(transactions_model_1.TransactionModel);
    }
    createTransaction(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield transactions_model_1.TransactionModel.create(data);
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield transactions_model_1.TransactionModel.findById(id)
                .populate('walletId')
                .exec();
        });
    }
    findByWalletId(walletId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield transactions_model_1.TransactionModel.find({ walletId })
                .sort({ createdAt: -1 })
                .exec();
        });
    }
    findLatestTransaction(walletId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield transactions_model_1.TransactionModel.findOne({ walletId })
                .sort({ createdAt: -1 })
                .exec();
        });
    }
    findByType(walletId, type) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield transactions_model_1.TransactionModel.find({ walletId, type })
                .sort({ createdAt: -1 })
                .exec();
        });
    }
    deleteTransaction(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield transactions_model_1.TransactionModel.findByIdAndDelete(id);
        });
    }
    findWithFilters(walletId, query) {
        return __awaiter(this, void 0, void 0, function* () {
            const { page = 1, limit = 10, type, status, sortBy = 'createdAt', sortOrder = 'desc', startDate, endDate, } = query;
            const filter = {
                walletId: walletId.toString(),
            };
            if (type)
                filter.type = type;
            if (status)
                filter.status = status;
            if (startDate || endDate) {
                filter.createdAt = {};
                if (startDate)
                    filter.createdAt.$gte = new Date(startDate);
                if (endDate)
                    filter.createdAt.$lte = new Date(endDate);
            }
            const skip = (page - 1) * limit;
            const sortDirection = sortOrder === 'asc' ? 1 : -1;
            const [transactions, total] = yield Promise.all([
                transactions_model_1.TransactionModel.find(filter)
                    .sort({ [sortBy]: sortDirection })
                    .skip(skip)
                    .limit(limit)
                    .exec(),
                transactions_model_1.TransactionModel.countDocuments(filter),
            ]);
            return {
                transactions,
                total,
            };
        });
    }
};
exports.TransactionRepository = TransactionRepository;
exports.TransactionRepository = TransactionRepository = __decorate([
    (0, inversify_1.injectable)(),
    __metadata("design:paramtypes", [])
], TransactionRepository);
