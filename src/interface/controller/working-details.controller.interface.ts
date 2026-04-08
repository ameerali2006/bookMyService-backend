import { NextFunction, Request, Response } from 'express';

export interface IWorkingDetailsController{
    getWorkingDetails(req: Request, res: Response, next:NextFunction): Promise<void>;
    updateWorkingDetails(req: Request, res: Response, next:NextFunction): Promise<void>;
    getProfileDetails(req: Request, res: Response, next:NextFunction): Promise<void>;
    updateProfileDetails(req: Request, res: Response, next:NextFunction): Promise<void>;
    changePassword(req: Request, res: Response, next:NextFunction): Promise<void>;
    getCalenderDetails(req: Request, res: Response, next:NextFunction): Promise<void>;
    updateCalenderDetails(req: Request, res: Response, next:NextFunction): Promise<void>;
    getWalletData(req: Request, res: Response, next:NextFunction): Promise<void>;
    getTransactions(req: Request, res: Response, next:NextFunction): Promise<void>;

}
