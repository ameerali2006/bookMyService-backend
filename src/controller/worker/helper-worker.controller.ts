import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { ICloudinaryService } from '../../interface/helpers/cloudinary.service.interface';
import { TYPES } from '../../config/constants/types';
import { ICloudinaryController } from '../../interface/controller/helper-worker.controller.interface';
import { WorkerHelperService } from '../../service/worker/helper.service';
import { STATUS_CODES } from '../../config/constants/status-code';
import { MESSAGES } from '../../config/constants/message';

@injectable()
export class CloudinaryController implements ICloudinaryController {
  constructor(
    @inject(TYPES.CloudinaryService) private cloudinaryService: ICloudinaryService,
    @inject(TYPES.WorkerHelperService) private workerHelperService:WorkerHelperService,

  ) {}

  async getSignature(req: Request, res: Response, next: NextFunction):Promise<void> {
    try {
      const folder = req.body.folder || req.query.folder || 'unknown';
      const signatureData = this.cloudinaryService.generateSignature(folder);
      res.status(STATUS_CODES.OK).json(signatureData);
    } catch (err) {
      next(err);
    }
  }

  async getServiceNames(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await this.workerHelperService.getServiceNames();
      console.log(data);
      if (!data) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.RESOURCE_NOT_FOUND,
        });
      }
      res.status(STATUS_CODES.OK).json({ success: true, message: MESSAGES.CREATED, data });
    } catch (error) {
      next(error);
    }
  }
}
