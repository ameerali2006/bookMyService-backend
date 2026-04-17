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
exports.MessageRepository = void 0;
const tsyringe_1 = require("tsyringe");
const mongoose_1 = require("mongoose");
const base_repository_1 = require("./base.repository");
const message_model_1 = require("../../model/message.model");
let MessageRepository = class MessageRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(message_model_1.MessageModel);
    }
    createMessage(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield message_model_1.MessageModel.create(Object.assign(Object.assign({}, data), { readBy: data.senderId ? [data.senderId] : [] }));
        });
    }
    findByChatId(chatId_1) {
        return __awaiter(this, arguments, void 0, function* (chatId, limit = 50, skip = 0) {
            return yield message_model_1.MessageModel.find({ chatId })
                .sort({ createdAt: 1 }) // oldest → newest
                .skip(skip)
                .limit(limit)
                .populate('senderId chatId') // 👈 populate here
                .lean();
        });
    }
    markMessagesAsRead(chatId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield message_model_1.MessageModel.updateMany({ chatId, readBy: { $ne: userId } }, { $addToSet: { readBy: userId } });
        });
    }
    deleteMessage(messageId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield message_model_1.MessageModel.findOneAndUpdate({
                _id: messageId,
                senderId: userId,
                isDeleted: false,
            }, {
                $set: {
                    isDeleted: true,
                    deletedAt: new Date(),
                    content: '',
                    metadata: {},
                },
            }, { new: true });
        });
    }
    reactToMessage(messageId, userId, emoji) {
        return __awaiter(this, void 0, void 0, function* () {
            const now = new Date();
            const updateExisting = yield message_model_1.MessageModel.updateOne({
                _id: messageId,
                'reactions.userId': userId,
            }, {
                $set: {
                    'reactions.$.emoji': emoji,
                    'reactions.$.reactedAt': now,
                },
            });
            if (updateExisting.matchedCount === 0) {
                yield message_model_1.MessageModel.updateOne({
                    _id: messageId,
                    'reactions.userId': { $ne: userId },
                }, {
                    $push: {
                        reactions: {
                            userId: new mongoose_1.Types.ObjectId(userId),
                            emoji,
                            reactedAt: now,
                        },
                    },
                });
            }
            return yield message_model_1.MessageModel.findById(messageId);
        });
    }
};
exports.MessageRepository = MessageRepository;
exports.MessageRepository = MessageRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], MessageRepository);
