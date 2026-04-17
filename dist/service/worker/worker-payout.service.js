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
exports.WorkerPayoutService = void 0;
const tsyringe_1 = require("tsyringe");
const types_1 = require("../../config/constants/types");
let WorkerPayoutService = class WorkerPayoutService {
    constructor(bookingRepo, walletService) {
        this.bookingRepo = bookingRepo;
        this.walletService = walletService;
    }
    calculateWorkerAmount(booking) {
        var _a;
        const commissionRate = 0.1;
        const base = booking.totalAmount || 0;
        const additional = ((_a = booking.additionalItems) === null || _a === void 0 ? void 0 : _a.reduce((sum, item) => sum + item.price, 0)) || 0;
        const total = base + additional;
        return total - total * commissionRate;
    }
    processPayouts() {
        return __awaiter(this, void 0, void 0, function* () {
            const bookings = yield this.bookingRepo.findUnsettledCompleted();
            const workerMap = new Map();
            for (const booking of bookings) {
                const amount = this.calculateWorkerAmount(booking);
                const workerId = booking.workerId.toString();
                workerMap.set(workerId, (workerMap.get(workerId) || 0) + amount);
            }
            for (const [workerId, amount] of workerMap) {
                yield this.walletService.addBalance({
                    userId: workerId,
                    role: 'worker',
                    amount,
                    description: 'Booking payout (cron)',
                });
            }
            yield this.bookingRepo.markAsSettled(bookings.map((b) => b._id.toString()));
        });
    }
};
exports.WorkerPayoutService = WorkerPayoutService;
exports.WorkerPayoutService = WorkerPayoutService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(types_1.TYPES.BookingRepository)),
    __param(1, (0, tsyringe_1.inject)(types_1.TYPES.WalletService)),
    __metadata("design:paramtypes", [Object, Object])
], WorkerPayoutService);
