import { Request, Response, NextFunction } from 'express';

export interface IAuthController {
	register(req: Request, res: Response, next:NextFunction): Promise<void>;
	generateOtp(req: Request, res: Response, next :NextFunction): Promise<void>;
	verifyOtp(req: Request, res: Response, next:NextFunction): Promise<void>;
	login(req: Request, res: Response, next:NextFunction): Promise<void>;
	googleLogin(req: Request, res: Response, next:NextFunction): Promise<void>;
	logout(req: Request, res: Response, next :NextFunction): Promise<void>;
	forgotPassword(req: Request, res: Response, next :NextFunction): Promise<void>;
	resetPassword(req: Request, res: Response, next :NextFunction): Promise<void>;
	handleTokenRefresh(req: Request, res: Response): void;

}
