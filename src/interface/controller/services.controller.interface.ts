import { NextFunction, Request, Response } from 'express';

export interface IServiceConroller{
    getServices(req: Request, res: Response, next:NextFunction): Promise<void>;
    getNearByWorkers(req: Request, res: Response, next:NextFunction): Promise<void>;
    getWorkerAvailability(req: Request, res: Response, next:NextFunction): Promise<void>;
    getWorkerProfile(req: Request, res: Response, next:NextFunction): Promise<void>;
}
