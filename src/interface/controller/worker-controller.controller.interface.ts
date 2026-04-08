import { NextFunction, Request, Response } from 'express';

export interface IWorkerController{
    getDashboard(req: Request, res: Response, next:NextFunction):Promise<void>
}
