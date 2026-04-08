import { ChatInboxDTO, MessageDTO } from '../../dto/shared/chat.dto';

export type MessageType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO';
export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName?: string;
  type: MessageType;
  content: string;
  metadata?: {
    fileName?: string;
    duration?: number;
    mimeType?: string;
  };
  createdAt: string;
  isOwn?: boolean;
  isDeleted?: boolean;
  replyTo?: Message | null;
  reactions?: {
    userId: string;
    emoji: string;
  }[];
}

export interface IChatService{
    createChat(bookingId: string): Promise<{success:boolean, message:string, chatId?: string }>;
    getChatId(bookingId:string):Promise<{success:boolean, message:string, chatId?: string }>
   getChatHistory(
       userId:string,
       chatId: string,
       limit: number,
       skip: number,
     ): Promise<{ success: boolean; message: string; messages: MessageDTO[] }>
     getChatInbox(userId:string):Promise<{success:boolean, message:string, chats: ChatInboxDTO[] }>

}
