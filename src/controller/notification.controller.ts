import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';

import { CustomRequest } from '../middleware/auth.middleware';
import { TYPES } from '../config/constants/types';
import { INotificationService } from '../interface/service/notification.service.interface';
import { INotificationController } from '../interface/controller/notification.controller.interface';

@injectable()
export class NotificationController implements INotificationController {
  constructor(
    @inject(TYPES.NotificationService)
    private notificationService: INotificationService,
  ) {}

  // ✅ GET /notifications
  async getNotifications(req: Request, res: Response, next:NextFunction) {
    try {
      const { user } = (req as CustomRequest); // from auth middleware

      const filter = user.role === 'worker'
        ? { workerId: user._id }
        : { userId: user._id };

      const notifications = await this.notificationService.getNotifications(filter);

      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch notifications' });
    }
  }

  // ✅ PATCH /notifications/:id/read
  async markAsRead(req: Request, res: Response, next:NextFunction) {
    try {
      const { id } = req.params;

      const updated = await this.notificationService.markAsRead(id);

      res.json(updated);
    } catch {
      res.status(500).json({ message: 'Failed to update' });
    }
  }

  // ✅ PATCH /notifications/read-all
  async markAllRead(
    req: Request,
    res: Response,
    next: NextFunction,
  ):Promise<void> {
    try {
      const { user } = (req as CustomRequest);

      if (!user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const filter = user.role === 'worker'
        ? { workerId: user._id }
        : { userId: user._id };

      const updatedCount = await this.notificationService.markAllAsRead(filter);

      res.status(200).json({
        success: true,
        message: 'All notifications marked as read',
        updated: updatedCount,
      });
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
}
