import { injectable } from 'tsyringe';
import { FilterQuery, UpdateQuery } from 'mongoose';
import { INotification } from '../../interface/model/notification.model.interface';
import { INotificationRepository } from '../../interface/repository/notification.repository.interface';

import { BaseRepository } from './base.repository';
import { NotificationModel } from '../../model/notification.model';

@injectable()
export class NotificationRepository extends BaseRepository<INotification> implements INotificationRepository {
  constructor() {
    super(NotificationModel);
  }

  async findByUser(userId: string): Promise<INotification[]> {
    return await NotificationModel
      .find({ receiverId: userId })
      .sort({ createdAt: -1 });
  }

  async find(filter: FilterQuery<INotification>): Promise<INotification[]> {
    return await NotificationModel.find(filter).sort({ createdAt: -1 });
  }

  async markAsRead(notificationId: string): Promise<void> {
    await NotificationModel.updateOne(
      { _id: notificationId },
      { $set: { isRead: true } },
    );
  }

  async updateMany(
    filter: FilterQuery<INotification>,
    update: UpdateQuery<INotification>,
  ): Promise<number> {
    const result = await NotificationModel.updateMany(filter, update);
    return result.modifiedCount;
  }
}
