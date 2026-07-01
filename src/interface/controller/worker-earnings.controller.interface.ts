import { Request, Response, NextFunction } from 'express';

export interface IWorkerEarningsController {
  getSummary(req: Request, res: Response, next: NextFunction): Promise<void>;
  getList(req: Request, res: Response, next: NextFunction): Promise<void>;
  exportPdf(req: Request, res: Response, next: NextFunction): Promise<void>;
}
