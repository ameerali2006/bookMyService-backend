import { FilterQuery, UpdateQuery } from 'mongoose';
import { INotification } from '../model/notification.model.interface';
import { IBaseRepository } from './base.repository.interface';

export interface INotificationRepository extends IBaseRepository<INotification> {

  findByUser(userId: string): Promise<INotification[]>
  find(filter: FilterQuery<INotification>): Promise<INotification[]>
  markAsRead(notificationId: string): Promise<void>

updateMany(
  filter: FilterQuery<INotification>,
  update: UpdateQuery<INotification>
): Promise<number>;

}
