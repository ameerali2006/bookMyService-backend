import { NextFunction, Request, Response } from 'express';

export interface IStripeController{
    createPaymentIntent(req: Request, res: Response, next:NextFunction):Promise<void>
    handleWebhook(req: Request, res: Response, next:NextFunction):Promise<void>

}
