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
exports.ChatController = void 0;
const tsyringe_1 = require("tsyringe");
const types_1 = require("../config/constants/types");
const status_code_1 = require("../config/constants/status-code");
let ChatController = class ChatController {
    constructor(chatService) {
        this.chatService = chatService;
    }
    getChatId(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const bookingId = (_a = req.query.bookingId) === null || _a === void 0 ? void 0 : _a.toString();
                console.log(bookingId);
                if (!bookingId) {
                    res.status(status_code_1.STATUS_CODES.BAD_REQUEST).json({
                        success: false,
                        message: 'Booking ID is missing',
                    });
                    return;
                }
                const chat = yield this.chatService.getChatId(bookingId);
                console.log(chat);
                if (!chat) {
                    res.status(status_code_1.STATUS_CODES.NOT_FOUND).json({
                        success: false,
                        message: 'Chat not found',
                    });
                    return;
                }
                res.status(status_code_1.STATUS_CODES.OK).json(chat);
            }
            catch (error) {
                next(error);
            }
        });
    }
    getChatHistory(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { chatId, limit, skip } = req.query;
                const userId = req.user._id;
                console.log({
                    chatId, limit, skip, userId,
                });
                const result = yield this.chatService.getChatHistory(userId, String(chatId), Number(limit), Number(skip));
                res.status(status_code_1.STATUS_CODES.OK).json(result);
            }
            catch (error) {
                next(error);
            }
        });
    }
    getWorkerInboxUsers(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const workerId = req.user._id;
                const result = yield this.chatService.getChatInbox(workerId);
                res.status(status_code_1.STATUS_CODES.OK).json(result);
            }
            catch (error) {
                next(error);
            }
        });
    }
};
exports.ChatController = ChatController;
exports.ChatController = ChatController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(types_1.TYPES.ChatService)),
    __metadata("design:paramtypes", [Object])
], ChatController);
