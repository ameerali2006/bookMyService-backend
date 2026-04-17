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
exports.ChatRepository = void 0;
const tsyringe_1 = require("tsyringe");
const mongoose_1 = require("mongoose");
const base_repository_1 = require("./base.repository");
const chat_model_1 = require("../../model/chat.model");
let ChatRepository = class ChatRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(chat_model_1.ChatModel);
    }
    createChat(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield chat_model_1.ChatModel.create(data);
        });
    }
    findById(chatId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield chat_model_1.ChatModel.findById(chatId);
        });
    }
    findByBookingId(bookingId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield chat_model_1.ChatModel.findOne({ bookingId });
        });
    }
    findByUserAndWorker(userId, workerId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield chat_model_1.ChatModel.findOne({ userId, workerId });
        });
    }
    getInboxWithAggregation(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const objectUserId = new mongoose_1.Types.ObjectId(userId);
            return yield chat_model_1.ChatModel.aggregate([
                {
                    $match: {
                        $or: [{ userId: objectUserId }, { workerId: objectUserId }],
                    },
                },
                // 🔥 Last message
                {
                    $lookup: {
                        from: 'messages',
                        let: { chatId: '$_id' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $eq: ['$chatId', '$$chatId'] },
                                },
                            },
                            { $sort: { createdAt: -1 } },
                            { $limit: 1 },
                        ],
                        as: 'lastMessage',
                    },
                },
                { $unwind: { path: '$lastMessage', preserveNullAndEmptyArrays: true } },
                // 🔥 Unread count (correct readBy logic)
                {
                    $lookup: {
                        from: 'messages',
                        let: { chatId: '$_id' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$chatId', '$$chatId'] },
                                            { $ne: ['$senderId', objectUserId] },
                                            {
                                                $not: {
                                                    $in: [objectUserId, '$readBy'],
                                                },
                                            },
                                        ],
                                    },
                                },
                            },
                            { $count: 'count' },
                        ],
                        as: 'unread',
                    },
                },
                // 🔥 User lookup
                {
                    $lookup: {
                        from: 'users',
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'user',
                    },
                },
                { $unwind: '$user' },
                // 🔥 Worker lookup
                {
                    $lookup: {
                        from: 'workers',
                        localField: 'workerId',
                        foreignField: '_id',
                        as: 'worker',
                    },
                },
                { $unwind: '$worker' },
                // 🔥 Final projection
                {
                    $project: {
                        id: '$_id',
                        participantId: {
                            $cond: [
                                { $eq: ['$userId', objectUserId] },
                                '$worker._id',
                                '$user._id',
                            ],
                        },
                        participantName: {
                            $cond: [
                                { $eq: ['$userId', objectUserId] },
                                '$worker.name',
                                '$user.name',
                            ],
                        },
                        participantAvatar: {
                            $cond: [
                                { $eq: ['$userId', objectUserId] },
                                '$worker.profileImage', // ✅ fixed
                                '$user.image', // ✅ fixed
                            ],
                        },
                        lastMessage: '$lastMessage.content',
                        lastMessageTime: '$lastMessage.createdAt',
                        unreadCount: {
                            $ifNull: [{ $arrayElemAt: ['$unread.count', 0] }, 0],
                        },
                    },
                },
                { $sort: { lastMessageTime: -1 } },
            ]);
        });
    }
};
exports.ChatRepository = ChatRepository;
exports.ChatRepository = ChatRepository = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], ChatRepository);
