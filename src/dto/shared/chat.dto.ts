import { Message } from '../../interface/service/chat.service.interface';

export interface MessageDTO {
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

export type MessageType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO';

export interface ChatInboxDTO {
  id: string;
  participantId: string;
  participantName?: string;
  participantAvatar?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  bookingId?: string;
}
