import { NextFunction, Request, Response } from 'express';

export interface IChatController{
    getChatId(req: Request, res: Response, next: NextFunction): Promise<void>
    getChatHistory(req: Request, res: Response, next: NextFunction): Promise<void>
    getWorkerInboxUsers(req: Request, res: Response, next: NextFunction): Promise<void>
}
