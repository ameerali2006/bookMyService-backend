"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.morganLogger = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const morgan_1 = __importDefault(require("morgan"));
const logger_1 = require("../utils/logger");
const logDir = path_1.default.resolve(__dirname, '../../logs');
if (!fs_1.default.existsSync(logDir))
    fs_1.default.mkdirSync(logDir, { recursive: true });
const accessLogStream = fs_1.default.createWriteStream(path_1.default.join(logDir, 'access.log'), { flags: 'a' });
const morganFormat = process.env.LOGGER_STATUS
    || (process.env.NODE_ENV === 'production' ? 'combined' : 'dev');
const fileLogger = (0, morgan_1.default)('combined', { stream: accessLogStream });
const consoleLogger = (0, morgan_1.default)(morganFormat, {
    stream: {
        write: (message) => logger_1.logger.http(message.trim()),
    },
});
const morganLogger = (req, res, next) => {
    if (!morganFormat || morganFormat === 'off') {
        next();
        return;
    }
    fileLogger(req, res, () => {
        consoleLogger(req, res, next);
    });
};
exports.morganLogger = morganLogger;
