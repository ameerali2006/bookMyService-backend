"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatMapper = void 0;
class ChatMapper {
    static toMessageDTO(message, currentUserId) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        console.log((_a = message.senderId) === null || _a === void 0 ? void 0 : _a.toString(), currentUserId.toString());
        return {
            id: ((_b = message._id) === null || _b === void 0 ? void 0 : _b.toString()) || message.id,
            chatId: (_c = message.chatId._id) === null || _c === void 0 ? void 0 : _c.toString(),
            senderId: (_d = message.senderId._id) === null || _d === void 0 ? void 0 : _d.toString(),
            senderName: message.senderId.name,
            type: message.type,
            content: message.content,
            metadata: {
                duration: Number((_e = message.metadata) === null || _e === void 0 ? void 0 : _e.duration),
                fileName: (_f = message.metadata) === null || _f === void 0 ? void 0 : _f.fileName,
                mimeType: (_g = message.metadata) === null || _g === void 0 ? void 0 : _g.mimeType,
            },
            createdAt: (_h = message.createdAt) === null || _h === void 0 ? void 0 : _h.toISOString(),
            isOwn: ((_j = message.senderId._id) === null || _j === void 0 ? void 0 : _j.toString()) == currentUserId.toString(),
            isDeleted: message.isDeleted,
            reactions: message.reactions.map((a) => ({
                emoji: a.emoji,
                userId: a.userId.toString(),
            })),
            replyTo: null,
        };
    }
    static toMessageDTOList(messages, currentUserId) {
        return messages.map((msg) => this.toMessageDTO(msg, currentUserId));
    }
}
exports.ChatMapper = ChatMapper;
