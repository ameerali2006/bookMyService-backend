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
exports.ChatSocketHandler = void 0;
const tsyringe_1 = require("tsyringe");
const types_1 = require("../../config/constants/types");
let ChatSocketHandler = class ChatSocketHandler {
    constructor(_chatRepo, _messageRepo) {
        this._chatRepo = _chatRepo;
        this._messageRepo = _messageRepo;
    }
    registerEvents(io, onlineUsers) {
        io.on('connection', (socket) => {
            const customSocket = socket;
            /* ---------------- JOIN CHAT ---------------- */
            socket.on('chat:join', (_a) => __awaiter(this, [_a], void 0, function* ({ chatId }) {
                console.log('dfdfdfdf meesdsge');
                const chat = yield this._chatRepo.findById(chatId);
                if (!chat)
                    return;
                // 🔐 SECURITY CHECK
                if (chat.userId.toString() !== customSocket.userId
                    && chat.workerId.toString() !== customSocket.userId) {
                    console.log('🚫 Unauthorized chat join attempt');
                    socket.disconnect();
                    return;
                }
                socket.join(chatId);
                console.log(`💬 ${customSocket.userType} ${customSocket.userId} joined chat ${chatId}`);
            }));
            /* ---------------- SEND MESSAGE ---------------- */
            socket.on('chat:send', (_a) => __awaiter(this, [_a], void 0, function* ({ chatId, message }) {
                console.log('send message', message);
                const chat = yield this._chatRepo.findById(chatId);
                if (!chat)
                    return;
                // 🔐 SECURITY CHECK AGAIN
                if (chat.userId.toString() !== customSocket.userId
                    && chat.workerId.toString() !== customSocket.userId) {
                    return;
                }
                // 💾 SAVE MESSAGE
                const savedMessage = yield this._messageRepo.create({
                    chatId,
                    senderId: customSocket.userId,
                    role: customSocket.userType,
                    type: message.type,
                    content: message.content,
                    metadata: message.metadata,
                });
                // 📡 EMIT TO BOTH SIDES
                io.to(chatId).emit('chat:receive', savedMessage);
            }));
            socket.on('chat:react', (_a) => __awaiter(this, [_a], void 0, function* ({ chatId, messageId, emoji }) {
                try {
                    console.log({ chatId, messageId, emoji });
                    const customSocket = socket;
                    const { userId } = customSocket;
                    const chat = yield this._chatRepo.findById(chatId);
                    if (!chat)
                        return;
                    // 🔐 SECURITY CHECK
                    if (chat.userId.toString() !== userId
                        && chat.workerId.toString() !== userId) {
                        return;
                    }
                    // ✅ ATOMIC REACTION UPDATE
                    const emoje = yield this._messageRepo.reactToMessage(messageId, userId, emoji);
                    console.log(emoje);
                    // 📡 Emit minimal payload
                    io.to(chatId).emit('chat:reaction', {
                        messageId,
                        userId,
                        emoji,
                    });
                }
                catch (error) {
                    console.error('Reaction error:', error);
                }
            }));
            socket.on('chat:delete', (_a) => __awaiter(this, [_a], void 0, function* ({ chatId, messageId }) {
                try {
                    const customSocket = socket;
                    const { userId } = customSocket;
                    const chat = yield this._chatRepo.findById(chatId);
                    if (!chat)
                        return;
                    // 🔐 SECURITY CHECK
                    if (chat.userId.toString() !== userId
                        && chat.workerId.toString() !== userId) {
                        return;
                    }
                    yield this._messageRepo.deleteMessage(messageId, userId);
                    io.to(chatId).emit('chat:deleted', {
                        messageId,
                    });
                }
                catch (error) {
                    console.error('Delete error:', error);
                }
            }));
        });
    }
};
exports.ChatSocketHandler = ChatSocketHandler;
exports.ChatSocketHandler = ChatSocketHandler = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(types_1.TYPES.ChatRepository)),
    __param(1, (0, tsyringe_1.inject)(types_1.TYPES.MessageRepository)),
    __metadata("design:paramtypes", [Object, Object])
], ChatSocketHandler);
