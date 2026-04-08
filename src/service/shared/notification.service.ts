import { Server as IOServer } from 'socket.io';
import { inject, injectable } from 'tsyringe';
import { INotification } from '../../interface/model/notification.model.interface';
import {
  CreateNotificationDTO,
  INotificationService,
} from '../../interface/service/notification.service.interface';
import { TYPES } from '../../config/constants/types';
import { INotificationRepository } from '../../interface/repository/notification.repository.interface';
import { io, onlineUsers } from '../../config/socketServer';

@injectable()
export class NotificationService implements INotificationService {
  constructor(
    @inject(TYPES.NotificationRepository)
    private NotificationRepo: INotificationRepository,

  ) {}

  async createNotification(
    data: CreateNotificationDTO,
  ): Promise<INotification> {
    // 1. Save to DB
    const notification = await this.NotificationRepo.create(data);

    if (!notification) return notification;

    // 2. Find receiver
    const receiver = notification.workerId
      ? notification.workerId.toString()
      : notification.userId?.toString();

    if (!receiver) return notification;

    io.to(receiver).emit('receive_notification', notification);

    return notification;
  }

  async getNotifications(
    filter: Partial<Pick<INotification, 'userId' | 'workerId'>>,
  ): Promise<INotification[]> {
    console.log(filter);
    const notification = await this.NotificationRepo.find(filter);
    console.log(notification);
    return notification;
  }

  async markAsRead(
    notificationId: string,
  ): Promise<INotification | null> {
    return await this.NotificationRepo.updateById(
      notificationId,
      { isRead: true },
    );
  }

  async markAllAsRead(
    filter: Partial<Pick<INotification, 'userId' | 'workerId'>>,
  ): Promise<number> {
    console.log(filter);
    const updatedCount = await this.NotificationRepo.updateMany(
      { ...filter, isRead: false },
      { isRead: true },
    );

    return updatedCount;
  }
}
