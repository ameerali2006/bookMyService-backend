"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const path_1 = __importDefault(require("path"));
const logDir = path_1.default.resolve(__dirname, '../../logs');
const dailyRotateTransport = new winston_daily_rotate_file_1.default({
    filename: '%DATE%.log',
    dirname: logDir,
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
    zippedArchive: true,
});
exports.logger = winston_1.default.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), process.env.NODE_ENV === 'production'
        ? winston_1.default.format.json()
        : winston_1.default.format.colorize(), winston_1.default.format.printf(({ timestamp, level, message }) => `[${timestamp}] ${level}: ${message}`)),
    transports: [
        new winston_1.default.transports.Console(),
        dailyRotateTransport,
        new winston_1.default.transports.File({
            filename: path_1.default.join(logDir, 'errors.log'),
            level: 'error',
        }),
    ],
});
