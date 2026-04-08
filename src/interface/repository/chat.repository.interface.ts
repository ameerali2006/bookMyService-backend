import { ChatInboxDTO } from '../../dto/shared/chat.dto';
import { IChat } from '../model/chat.model.interface';
import { IBaseRepository } from './base.repository.interface';

export interface IChatRepository extends IBaseRepository<IChat> {
  createChat(data: Partial<IChat>): Promise<IChat>;
  findById(chatId: string): Promise<IChat | null>;
  findByBookingId(bookingId: string): Promise<IChat | null>;
  getInboxWithAggregation(userId: string): Promise<ChatInboxDTO[]>
  findByUserAndWorker(userId: string, workerId:string): Promise<IChat | null>
}
