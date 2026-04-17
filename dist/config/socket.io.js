"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketCore = void 0;
const socket_io_1 = require("socket.io");
const env_1 = require("./env/env");
const message_1 = require("./constants/message");
class SocketCore {
    constructor(httpServer) {
        this.onlineUsers = new Map();
        this.handlers = [];
        this.authMiddleware = (socket, next) => {
            try {
                const { userId, userType } = socket.handshake.auth;
                if (!userId || !userType) {
                    return next(new Error(message_1.MESSAGES.INVALID_CREDENTIALS));
                }
                socket.userId = userId;
                socket.userType = userType;
                next();
            }
            catch (_a) {
                next(new Error(message_1.MESSAGES.ACTION_FAILED));
            }
        };
        this.io = new socket_io_1.Server(httpServer, {
            cors: {
                origin: env_1.ENV.FRONTEND_URI || 'http://localhost:5173',
                credentials: true,
                methods: ['GET', 'POST'],
                allowedHeaders: ['Authorization', 'Content-Type'],
            },
        });
        this.io.use(this.authMiddleware);
    }
    registerHandler(handler) {
        this.handlers.push(handler);
    }
    initialize() {
        console.log('🚀 Initializing SocketCore with handlers...');
        this.io.on('connection', (socket) => {
            const customSocket = socket;
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
    getIO() {
        return this.io;
    }
    getOnlineUsers() {
        return this.onlineUsers;
    }
}
exports.SocketCore = SocketCore;
