import fs from 'fs';
import path from 'path';
import morgan from 'morgan';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

const logDir = path.resolve(__dirname, '../../logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

const accessLogStream = fs.createWriteStream(path.join(logDir, 'access.log'), { flags: 'a' });

const morganFormat = process.env.LOGGER_STATUS
  || (process.env.NODE_ENV === 'production' ? 'combined' : 'dev');

const fileLogger = morgan('combined', { stream: accessLogStream });

const consoleLogger = morgan(morganFormat, {
  stream: {
    write: (message) => logger.http(message.trim()),
  },
});

export const morganLogger = (req: Request, res: Response, next: NextFunction): void => {
  if (!morganFormat || morganFormat === 'off') {
    next();
    return;
  }

  fileLogger(req, res, () => {
    consoleLogger(req, res, next);
  });
};
