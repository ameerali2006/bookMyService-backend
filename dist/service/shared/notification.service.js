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
exports.NotificationService = void 0;
const tsyringe_1 = require("tsyringe");
const types_1 = require("../../config/constants/types");
const socketServer_1 = require("../../config/socketServer");
let NotificationService = class NotificationService {
    constructor(NotificationRepo) {
        this.NotificationRepo = NotificationRepo;
    }
    createNotification(data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            // 1. Save to DB
            const notification = yield this.NotificationRepo.create(data);
            if (!notification)
                return notification;
            // 2. Find receiver
            const receiver = notification.workerId
                ? notification.workerId.toString()
                : (_a = notification.userId) === null || _a === void 0 ? void 0 : _a.toString();
            if (!receiver)
                return notification;
            socketServer_1.io.to(receiver).emit('receive_notification', notification);
            return notification;
        });
    }
    getNotifications(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(filter);
            const notification = yield this.NotificationRepo.find(filter);
            console.log(notification);
            return notification;
        });
    }
    markAsRead(notificationId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.NotificationRepo.updateById(notificationId, { isRead: true });
        });
    }
    markAllAsRead(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(filter);
            const updatedCount = yield this.NotificationRepo.updateMany(Object.assign(Object.assign({}, filter), { isRead: false }), { isRead: true });
            return updatedCount;
        });
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(types_1.TYPES.NotificationRepository)),
    __metadata("design:paramtypes", [Object])
], NotificationService);
