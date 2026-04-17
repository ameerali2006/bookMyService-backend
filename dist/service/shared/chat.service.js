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
exports.ChatService = void 0;
const tsyringe_1 = require("tsyringe");
const types_1 = require("../../config/constants/types");
const chat_mapper_1 = require("../../utils/mapper/chat-mapper");
let ChatService = class ChatService {
    constructor(bookingRepo, chatRepo, messageRepo) {
        this.bookingRepo = bookingRepo;
        this.chatRepo = chatRepo;
        this.messageRepo = messageRepo;
    }
    validateParticipant(chatId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const chat = yield this.chatRepo.findById(chatId);
            if (!chat)
                throw new Error('Chat not found');
            const allowed = chat.userId.toString() === userId || chat.workerId.toString() === userId;
            if (!allowed)
                throw new Error('Unauthorized');
        });
    }
    createChat(bookingId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const booking = yield this.bookingRepo.findById(bookingId);
                if (!booking) {
                    return { success: false, message: 'booking not fount' };
                }
                const existingChat = yield this.chatRepo.findByBookingId(bookingId);
                if (existingChat) {
                    return {
                        success: true,
                        message: 'chat id fetch successfully',
                        chatId: existingChat._id.toString(),
                    };
                }
                const newChat = yield this.chatRepo.create({
                    userId: booking.userId,
                    workerId: booking.workerId,
                });
                return {
                    success: true,
                    message: 'chat id fetch successfully',
                    chatId: newChat._id.toString(),
                };
            }
            catch (error) {
                console.error('Chat creation failed:', error);
                return { success: false, message: 'internal error' };
            }
        });
    }
    getChatId(bookingId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!bookingId) {
                return { success: false, message: 'booking id not found' };
            }
            const booking = yield this.bookingRepo.findById(bookingId);
            if (!booking) {
                return { success: false, message: 'booking not found' };
            }
            const chat = yield this.chatRepo.findByUserAndWorker(booking.userId.toString(), booking.workerId.toString());
            if (!chat) {
                const newChat = yield this.createChat(bookingId);
                return newChat;
            }
            return {
                success: true,
                message: 'chat fetch successfully',
                chatId: chat._id.toString(),
            };
        });
    }
    getChatHistory(userId, chatId, limit, skip) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!chatId) {
                    return {
                        success: false,
                        message: 'Chat ID is required',
                        messages: [],
                    };
                }
                const chat = yield this.chatRepo.findById(chatId);
                if (!chat) {
                    return {
                        success: false,
                        message: 'Chat not found',
                        messages: [],
                    };
                }
                const messages = yield this.messageRepo.findByChatId(chatId, limit, skip);
                const mappedMessages = chat_mapper_1.ChatMapper.toMessageDTOList(messages, userId);
                return {
                    success: true,
                    message: 'Chat history fetched successfully',
                    messages: mappedMessages,
                };
            }
            catch (error) {
                console.error('Failed to fetch chat history:', error);
                return {
                    success: false,
                    message: 'Internal server error',
                    messages: [],
                };
            }
        });
    }
    getChatInbox(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const chats = yield this.chatRepo.getInboxWithAggregation(userId);
            return {
                success: true,
                message: 'Chat inbox fetched successfully',
                chats,
            };
        });
    }
    deleteMessage(chatId, messageId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.validateParticipant(chatId, userId);
            yield this.messageRepo.deleteMessage(messageId, userId);
            return { messageId };
        });
    }
    reactToMessage(chatId, messageId, userId, emoji) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.validateParticipant(chatId, userId);
            yield this.messageRepo.reactToMessage(messageId, userId, emoji);
            return { messageId, userId, emoji };
        });
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(types_1.TYPES.BookingRepository)),
    __param(1, (0, tsyringe_1.inject)(types_1.TYPES.ChatRepository)),
    __param(2, (0, tsyringe_1.inject)(types_1.TYPES.MessageRepository)),
    __metadata("design:paramtypes", [Object, Object, Object])
], ChatService);
