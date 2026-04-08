import { createServer } from 'http';
import { container } from 'tsyringe';
import app from '../app';

import { SocketCore } from './socket.io';
import { TYPES } from './constants/types';

// ✅ NOW import resolver (important!)
import { bookingSocket, chatSocketHandler } from './di/resolver';

// ❌ REMOVE THIS FROM TOP
// import { bookingSocket, chatSocketHandler } from './di/resolver';

const server = createServer(app);
const socketCore = new SocketCore(server);

// ✅ Register BEFORE resolver
container.registerInstance(TYPES.SocketIO, socketCore.getIO());
container.registerInstance(TYPES.OnlineUsers, socketCore.getOnlineUsers());

// ✅ THEN register handlers
socketCore.registerHandler(bookingSocket);
socketCore.registerHandler(chatSocketHandler);
// ✅ Initialize first
socketCore.initialize();
export const io = socketCore.getIO();
export const onlineUsers = socketCore.getOnlineUsers();
export const socketServer = server;

export default socketCore;
