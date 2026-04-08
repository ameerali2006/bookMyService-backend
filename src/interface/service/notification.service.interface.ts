import { INotification } from '../model/notification.model.interface';

export interface CreateNotificationDTO {
    userId?:string
  workerId?:string
  title: string;
  message: string;
  type: 'booking' | 'payment' | 'review' | 'system'
}
export interface INotificationService {
  createNotification(data: CreateNotificationDTO): Promise<INotification>;
  getNotifications(
    filter: Partial<Pick<INotification, 'userId' | 'workerId'>>
  ): Promise<INotification[]>;
  markAsRead(notificationId: string): Promise<INotification | null>;
  markAllAsRead(
  filter: Partial<Pick<INotification, 'userId' | 'workerId'>>
): Promise<number>;
}
