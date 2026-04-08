import { Document, Types } from 'mongoose';
import { IChat } from './chat.model.interface';
import { IUser } from './user.model.interface';
import { IWorker } from './worker.model.interface';

export type MessageType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO';

export interface IMessage extends Document {
  _id: Types.ObjectId;

  chatId: Types.ObjectId | string;

  senderId: Types.ObjectId | string;

  role: 'User' | 'Worker' | 'Admin';

  type: MessageType;

  content: string; // text OR Cloudinary URL

  metadata?: {
    fileName?: string;
    duration?: string;
    mimeType?: string;
  };

  readBy: Types.ObjectId[];

  isDeleted: boolean;

  replyTo?: Types.ObjectId | null;

  reactions: {
    userId: Types.ObjectId;
    emoji: string;
  }[];

  editedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}
export type IMessagePopulated = Omit<IMessage, 'chatId' | 'senderId'| 'replyTo' > & {
  chatId: IChat;
  senderId: IUser|IWorker;
  replyTo?: IMessage | null;

};
