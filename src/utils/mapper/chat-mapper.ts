import { MessageDTO } from '../../dto/shared/chat.dto';
import { IMessagePopulated } from '../../interface/model/message.model.interface';

export class ChatMapper {
  static toMessageDTO(
    message: IMessagePopulated,
    currentUserId: string,
  ): MessageDTO {
    console.log(message.senderId?.toString(), currentUserId.toString());
    return {
      id: message._id?.toString() || message.id,
      chatId: message.chatId._id?.toString(),
      senderId: message.senderId._id?.toString(),
      senderName: message.senderId.name,
      type: message.type,
      content: message.content,
      metadata: {
        duration: Number(message.metadata?.duration),
        fileName: message.metadata?.fileName,
        mimeType: message.metadata?.mimeType,
      },
      createdAt: message.createdAt?.toISOString(),
      isOwn: message.senderId._id?.toString() == currentUserId.toString(),
      isDeleted: message.isDeleted,
      reactions: message.reactions.map((a) => ({
        emoji: a.emoji,
        userId: a.userId.toString(),
      })),
      replyTo: null,
    };
  }

  static toMessageDTOList(
    messages: IMessagePopulated[],
    currentUserId: string,
  ): MessageDTO[] {
    return messages.map((msg) => this.toMessageDTO(msg, currentUserId));
  }
}
