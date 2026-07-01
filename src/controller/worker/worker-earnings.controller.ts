import { inject, injectable } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { TYPES } from '../../config/constants/types';
import { IWorkerEarningsController } from '../../interface/controller/worker-earnings.controller.interface';
import { IWorkerEarningsService } from '../../interface/service/worker/worker-earnings.service.interface';
import { WorkerEarningsQuerySchema } from '../validation/worker-earnings.zod';
import { STATUS_CODES } from '../../config/constants/status-code';
import { CustomRequest } from '../../middleware/auth.middleware';

@injectable()
export class WorkerEarningsController implements IWorkerEarningsController {
  constructor(
    @inject(TYPES.WorkerEarningsService)
    private earningsService: IWorkerEarningsService,
  ) {}

  async getSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const workerId = (req as CustomRequest).user._id;
      const response = await this.earningsService.getEarningsSummary(workerId);
      res.status(STATUS_CODES.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getList(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const workerId = (req as CustomRequest).user._id;
      const query = WorkerEarningsQuerySchema.parse(req.query);
      const response = await this.earningsService.getEarningsList(workerId, query);
      res.status(STATUS_CODES.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async exportPdf(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const workerId = (req as CustomRequest).user._id;
      const query = WorkerEarningsQuerySchema.parse(req.query);
      const { pdfStream, filename } = await this.earningsService.generateEarningsPdf(
        workerId,
        query,
      );

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      pdfStream.pipe(res);
    } catch (error) {
      next(error);
    }
  }
}
