import { MESSAGES } from '../../config/constants/message';
import { inject, injectable } from 'tsyringe';
import {
  IChatService,
  Message,
} from '../../interface/service/chat.service.interface';
import { TYPES } from '../../config/constants/types';
import { IBookingRepository } from '../../interface/repository/booking.repository.interface';
import { IChatRepository } from '../../interface/repository/chat.repository.interface';
import { IMessageRepository } from '../../interface/repository/message.repoository.interface';
import { ChatMapper } from '../../utils/mapper/chat-mapper';
import { ChatInboxDTO } from '../../dto/shared/chat.dto';

@injectable()
export class ChatService implements IChatService {
  constructor(
    @inject(TYPES.BookingRepository) private bookingRepo: IBookingRepository,
    @inject(TYPES.ChatRepository) private chatRepo: IChatRepository,
    @inject(TYPES.MessageRepository) private messageRepo: IMessageRepository,
  ) {}

  private async validateParticipant(chatId: string, userId: string) {
    const chat = await this.chatRepo.findById(chatId);
    if (!chat) throw new Error(MESSAGES.CHAT_NOT_FOUND);

    const allowed = chat.userId.toString() === userId || chat.workerId.toString() === userId;

    if (!allowed) throw new Error(MESSAGES.UNAUTHORIZED);
  }

  async createChat(
    bookingId: string,
  ): Promise<{ success: boolean; message: string; chatId?: string }> {
    try {
      const booking = await this.bookingRepo.findById(bookingId);
      if (!booking) {
        return { success: false, message: MESSAGES.BOOKING_NOT_FOUNT };
      }
      const existingChat = await this.chatRepo.findByBookingId(bookingId);

      if (existingChat) {
        return {
          success: true,
          message: MESSAGES.CHAT_ID_FETCH_SUCCESSFULLY,
          chatId: existingChat._id.toString(),
        };
      }
      const newChat = await this.chatRepo.create({
        userId: booking.userId,
        workerId: booking.workerId,
      });
      return {
        success: true,
        message: MESSAGES.CHAT_ID_FETCH_SUCCESSFULLY,
        chatId: newChat._id.toString(),
      };
    } catch (error) {
      console.error('Chat creation failed:', error);
      return { success: false, message: MESSAGES.INTERNAL_ERROR };
    }
  }

  async getChatId(
    bookingId: string,
  ): Promise<{ success: boolean; message: string; chatId?: string }> {
    if (!bookingId) {
      return { success: false, message: MESSAGES.BOOKING_ID_NOT_FOUND };
    }
    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking) {
      return { success: false, message: MESSAGES.BOOKING_NOT_FOUND };
    }
    const chat = await this.chatRepo.findByUserAndWorker(
      booking.userId.toString(),
      booking.workerId.toString(),
    );
    if (!chat) {
      const newChat = await this.createChat(bookingId);

      return newChat;
    }
    return {
      success: true,
      message: MESSAGES.CHAT_FETCH_SUCCESSFULLY,
      chatId: chat._id.toString(),
    };
  }

  async getChatHistory(
    userId: string,
    chatId: string,
    limit: number,
    skip: number,
  ): Promise<{ success: boolean; message: string; messages: Message[] }> {
    try {
      if (!chatId) {
        return {
          success: false,
          message: MESSAGES.CHAT_ID_IS_REQUIRED,
          messages: [],
        };
      }

      const chat = await this.chatRepo.findById(chatId);
      if (!chat) {
        return {
          success: false,
          message: MESSAGES.CHAT_NOT_FOUND,
          messages: [],
        };
      }

      const messages = await this.messageRepo.findByChatId(chatId, limit, skip);
      const mappedMessages = ChatMapper.toMessageDTOList(messages, userId);

      return {
        success: true,
        message: MESSAGES.CHAT_HISTORY_FETCHED_SUCCESSFULLY,
        messages: mappedMessages,
      };
    } catch (error) {
      console.error('Failed to fetch chat history:', error);

      return {
        success: false,
        message: MESSAGES.INTERNAL_SERVER_ERROR,
        messages: [],
      };
    }
  }

  async getChatInbox(
    userId: string,
  ): Promise<{ success: boolean; message: string; chats: ChatInboxDTO[] }> {
    const chats = await this.chatRepo.getInboxWithAggregation(userId);

    return {
      success: true,
      message: MESSAGES.CHAT_INBOX_FETCHED_SUCCESSFULLY,
      chats,
    };
  }

  async deleteMessage(chatId: string, messageId: string, userId: string) {
    await this.validateParticipant(chatId, userId);

    await this.messageRepo.deleteMessage(messageId, userId);

    return { messageId };
  }

  async reactToMessage(
    chatId: string,
    messageId: string,
    userId: string,
    emoji: string,
  ) {
    await this.validateParticipant(chatId, userId);

    await this.messageRepo.reactToMessage(messageId, userId, emoji);

    return { messageId, userId, emoji };
  }
}
