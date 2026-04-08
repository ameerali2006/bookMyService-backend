import { Server as IOServer, Socket } from 'socket.io';
import http from 'http';
import { ENV } from './env/env';
import { MESSAGES } from './constants/message';
import { CustomSocket } from '../types/socket';
import { ISocketHandler } from '../interface/service/socket-handler.service.interface';

export class SocketCore {
  private io: IOServer;

  private onlineUsers = new Map<string, { socketId: string; userType: string }>();

  private handlers: ISocketHandler[] = [];

  constructor(httpServer: http.Server) {
    this.io = new IOServer(httpServer, {
      cors: {
        origin: ENV.FRONTEND_URI || 'http://localhost:5173',
        credentials: true,
        methods: ['GET', 'POST'],
        allowedHeaders: ['Authorization', 'Content-Type'],
      },
    });

    this.io.use(this.authMiddleware);
  }

  private authMiddleware = (socket: Socket, next: (err?: Error) => void) => {
    try {
      const { userId, userType } = socket.handshake.auth;
      if (!userId || !userType) {
        return next(new Error(MESSAGES.INVALID_CREDENTIALS));
      }

      (socket as CustomSocket).userId = userId;
      (socket as CustomSocket).userType = userType;

      next();
    } catch {
      next(new Error(MESSAGES.ACTION_FAILED));
    }
  };

  public registerHandler(handler: ISocketHandler) {
    this.handlers.push(handler);
  }

  public initialize() {
    console.log('🚀 Initializing SocketCore with handlers...');

    this.io.on('connection', (socket) => {
      const customSocket = socket as CustomSocket;

      console.log(`🟢 ${customSocket.userType} connected: ${customSocket.userId} (${socket.id})`);

      // ✅ JOIN ROOM (MOST IMPORTANT)
      socket.join(customSocket.userId);

      // optional tracking (you can keep or remove later)
      this.onlineUsers.set(customSocket.userId, {
        socketId: socket.id,
        userType: customSocket.userType,
      });

      socket.on('disconnect', () => {
        this.onlineUsers.delete(customSocket.userId);
        console.log(`🔴 ${customSocket.userType} disconnected: ${customSocket.userId}`);
      });
    });

    this.handlers.forEach((handler) => handler.registerEvents(this.io, this.onlineUsers));
  }

  public getIO() {
    return this.io;
  }

  public getOnlineUsers() {
    return this.onlineUsers;
  }
}
