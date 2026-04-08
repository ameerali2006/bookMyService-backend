import { inject, injectable } from 'tsyringe';
import { NextFunction, Request, Response } from 'express';
import { IWorkerController } from '../../interface/controller/worker-controller.controller.interface';
import { CustomRequest } from '../../middleware/auth.middleware';
import { STATUS_CODES } from '../../config/constants/status-code';
import { TYPES } from '../../config/constants/types';
import { IWorkerHelperService } from '../../interface/service/helper-service.service.interface';

@injectable()
export class WorkerController implements IWorkerController {
  constructor(
        @inject(TYPES.WorkerHelperService) private workerService:IWorkerHelperService,
  ) {}

  async getDashboard(req: Request, res: Response, next:NextFunction):Promise<void> {
    try {
      const workerId = (req as CustomRequest).user._id;

      const data = await this.workerService.getDashboard(workerId);
      console.log(data);

      res.status(STATUS_CODES.OK).json(data);
    } catch (error) {
      next(error);
    }
  }
}
