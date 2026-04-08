import express, { NextFunction, Request, Response } from 'express';
import 'reflect-metadata';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { UserRoute } from './routes/user.route';
import { AdminRoute } from './routes/admin.route';
import { ENV } from './config/env/env';
import { WorkerRoute } from './routes/worker.route';
import { stripeController } from './config/di/resolver';
import { morganLogger } from './utils/morgon';

const app = express();

app.use(
  cors({
    origin: ENV.FRONTEND_URI,
    credentials: true,
  }),
);
app.post('/payment/webhook', express.raw({ type: 'application/json' }), (req: Request, res: Response, next: NextFunction) => stripeController.handleWebhook(req, res, next));
app.use(express.json());
app.use(cookieParser());
app.use(morganLogger);

app.use('/', new UserRoute().router);
app.use('/admin', new AdminRoute().router);
app.use('/worker', new WorkerRoute().router);

export default app;
