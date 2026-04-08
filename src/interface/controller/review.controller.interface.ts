import { NextFunction, Request, Response } from 'express';

export interface IReviewController{
    addReview(req:Request, res:Response, next:NextFunction):Promise<void>
    allReviewManagement(req:Request, res:Response, next:NextFunction):Promise<void>
}
