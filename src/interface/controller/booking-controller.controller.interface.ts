import { NextFunction, Request, Response } from 'express';

export interface IBookingController{
    setBasicBookingDetails(req: Request, res: Response, next: NextFunction): Promise<void>;
    getBookingDetails(req: Request, res: Response, next: NextFunction): Promise<void>;
    verifyPayment(req: Request, res: Response, next: NextFunction): Promise<void>;
}
