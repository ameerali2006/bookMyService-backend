"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketServer = exports.onlineUsers = exports.io = void 0;
const http_1 = require("http");
const tsyringe_1 = require("tsyringe");
const app_1 = __importDefault(require("../app"));
const socket_io_1 = require("./socket.io");
const types_1 = require("./constants/types");
// ✅ NOW import resolver (important!)
const resolver_1 = require("./di/resolver");
// ❌ REMOVE THIS FROM TOP
// import { bookingSocket, chatSocketHandler } from './di/resolver';
const server = (0, http_1.createServer)(app_1.default);
const socketCore = new socket_io_1.SocketCore(server);
// ✅ Register BEFORE resolver
tsyringe_1.container.registerInstance(types_1.TYPES.SocketIO, socketCore.getIO());
tsyringe_1.container.registerInstance(types_1.TYPES.OnlineUsers, socketCore.getOnlineUsers());
// ✅ THEN register handlers
socketCore.registerHandler(resolver_1.bookingSocket);
socketCore.registerHandler(resolver_1.chatSocketHandler);
// ✅ Initialize first
socketCore.initialize();
exports.io = socketCore.getIO();
exports.onlineUsers = socketCore.getOnlineUsers();
exports.socketServer = server;
exports.default = socketCore;
