import { Request, Response } from 'express';

export interface ITokenController{
    handleTokenRefresh(req: Request, res: Response): void;
}
