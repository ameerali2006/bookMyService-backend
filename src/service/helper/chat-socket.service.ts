import type { Server as IOServer } from 'socket.io';
import { inject, injectable } from 'tsyringe';

import { ISocketHandler } from '../../interface/service/socket-handler.service.interface';
import { CustomSocket } from '../../types/socket';
import { TYPES } from '../../config/constants/types';

import { IChatRepository } from '../../interface/repository/chat.repository.interface';
import { IMessageRepository } from '../../interface/repository/message.repoository.interface';

@injectable()
export class ChatSocketHandler implements ISocketHandler {
  constructor(
    @inject(TYPES.ChatRepository)
    private _chatRepo: IChatRepository,

    @inject(TYPES.MessageRepository)
    private _messageRepo: IMessageRepository,
  ) {}

  public registerEvents(
    io: IOServer,
    onlineUsers: Map<string, { socketId: string; userType: string }>,
  ) {
    io.on('connection', (socket) => {
      const customSocket = socket as CustomSocket;

      /* ---------------- JOIN CHAT ---------------- */
      socket.on('chat:join', async ({ chatId }) => {
        console.log('dfdfdfdf meesdsge');

        const chat = await this._chatRepo.findById(chatId);
        if (!chat) return;

        // 🔐 SECURITY CHECK
        if (
          chat.userId.toString() !== customSocket.userId
          && chat.workerId.toString() !== customSocket.userId
        ) {
          console.log('🚫 Unauthorized chat join attempt');
          socket.disconnect();
          return;
        }

        socket.join(chatId);
        console.log(
          `💬 ${customSocket.userType} ${customSocket.userId} joined chat ${chatId}`,
        );
      });

      /* ---------------- SEND MESSAGE ---------------- */
      socket.on('chat:send', async ({ chatId, message }) => {
        console.log('send message', message);
        const chat = await this._chatRepo.findById(chatId);
        if (!chat) return;

        // 🔐 SECURITY CHECK AGAIN
        if (
          chat.userId.toString() !== customSocket.userId
          && chat.workerId.toString() !== customSocket.userId
        ) {
          return;
        }

        // 💾 SAVE MESSAGE
        const savedMessage = await this._messageRepo.create({
          chatId,
          senderId: customSocket.userId,
          role: customSocket.userType,
          type: message.type,
          content: message.content,
          metadata: message.metadata,
        });

        // 📡 EMIT TO BOTH SIDES
        io.to(chatId).emit('chat:receive', savedMessage);
      });
      socket.on('chat:react', async ({ chatId, messageId, emoji }) => {
        try {
          console.log({ chatId, messageId, emoji });
          const customSocket = socket as CustomSocket;
          const { userId } = customSocket;

          const chat = await this._chatRepo.findById(chatId);
          if (!chat) return;

          // 🔐 SECURITY CHECK
          if (
            chat.userId.toString() !== userId
            && chat.workerId.toString() !== userId
          ) {
            return;
          }

          // ✅ ATOMIC REACTION UPDATE
          const emoje = await this._messageRepo.reactToMessage(messageId, userId, emoji);
          console.log(emoje);

          // 📡 Emit minimal payload
          io.to(chatId).emit('chat:reaction', {
            messageId,
            userId,
            emoji,
          });
        } catch (error) {
          console.error('Reaction error:', error);
        }
      });
      socket.on('chat:delete', async ({ chatId, messageId }) => {
        try {
          const customSocket = socket as CustomSocket;
          const { userId } = customSocket;

          const chat = await this._chatRepo.findById(chatId);
          if (!chat) return;

          // 🔐 SECURITY CHECK
          if (
            chat.userId.toString() !== userId
            && chat.workerId.toString() !== userId
          ) {
            return;
          }

          await this._messageRepo.deleteMessage(messageId, userId);

          io.to(chatId).emit('chat:deleted', {
            messageId,
          });
        } catch (error) {
          console.error('Delete error:', error);
        }
      });
    });
  }
}
