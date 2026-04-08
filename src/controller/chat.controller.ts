import { inject, injectable } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { TYPES } from '../config/constants/types';
import { IChatService } from '../interface/service/chat.service.interface';
import { IChatController } from '../interface/controller/chat.controller.interface';
import { STATUS_CODES } from '../config/constants/status-code';
import { CustomRequest } from '../middleware/auth.middleware';

@injectable()
export class ChatController implements IChatController {
  constructor(@inject(TYPES.ChatService) private chatService: IChatService) {}

  async getChatId(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const bookingId = req.query.bookingId?.toString();
      console.log(bookingId);

      if (!bookingId) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: 'Booking ID is missing',
        });
        return;
      }

      const chat = await this.chatService.getChatId(bookingId);
      console.log(chat);

      if (!chat) {
        res.status(STATUS_CODES.NOT_FOUND).json({
          success: false,
          message: 'Chat not found',
        });
        return;
      }

      res.status(STATUS_CODES.OK).json(chat);
    } catch (error) {
      next(error);
    }
  }

  async getChatHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { chatId, limit, skip } = req.query;
      const userId = (req as CustomRequest).user._id;
      console.log({
        chatId, limit, skip, userId,
      });
      const result = await this.chatService.getChatHistory(userId, String(chatId), Number(limit), Number(skip));
      res.status(STATUS_CODES.OK).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getWorkerInboxUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const workerId = (req as CustomRequest).user._id;
      const result = await this.chatService.getChatInbox(workerId);
      res.status(STATUS_CODES.OK).json(result);
    } catch (error) {
      next(error);
    }
  }
}
