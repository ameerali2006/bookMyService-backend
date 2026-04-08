import { IMessage, IMessagePopulated } from '../model/message.model.interface';
import { IBaseRepository } from './base.repository.interface';

export interface IMessageRepository extends IBaseRepository<IMessage> {
  createMessage(data: Partial<IMessage>): Promise<IMessage>;
  findByChatId(
    chatId: string,
    limit: number,
    skip: number,
  ): Promise<IMessagePopulated[]>;
  markMessagesAsRead(chatId: string, userId: string): Promise<void>;
  deleteMessage(messageId: string, userId: string): Promise<IMessage | null>;
  reactToMessage(
    messageId: string,
    userId: string,
    emoji: string,
  ): Promise<IMessage | null>;
}
