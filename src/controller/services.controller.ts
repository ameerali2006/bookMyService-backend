import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { IServiceConroller } from '../interface/controller/services.controller.interface';
import { TYPES } from '../config/constants/types';
import { STATUS_CODES } from '../config/constants/status-code';

import { IServiceDetails } from '../interface/service/services/Service-details.service.interface';

@injectable()
export class ServiceController implements IServiceConroller {
  constructor(
    @inject(TYPES.ServiceDetails) private _serviceDetails: IServiceDetails,
  ) {}

  async getServices(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { lat, lng, maxDistance = 2000000 } = req.query;

      const response = await this._serviceDetails.getServices(
        parseFloat(lat as string),
        parseFloat(lng as string),
        parseFloat(maxDistance as string),
      );
      console.log(response);

      res.status(response.status as number).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getNearByWorkers(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const {
        search = '',
        sort = 'asc',
        page = 1,
        pageSize = 10,
        serviceId,
        lat,
        lng,
      } = req.query;
      console.log(req.query);

      const response = await this._serviceDetails.getNearByWorkers(
        serviceId as string,
        Number(lat),
        Number(lng),
        search as string,
        sort as string,
        Number(page),
        Number(pageSize),
      );

      if (response.success) {
        res.status(STATUS_CODES.OK).json({
          success: true,
          message: response.message,
          workers: response.data?.workers,
          totalCount: response.data?.totalCount,
          totalPages: Math.ceil(
            (response.data?.totalCount as number) / Number(pageSize),
          ),
          currentPage: Number(page),
        });
      } else {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: response.message || 'Failed to fetch nearby workers',
        });
      }
    } catch (error: any) {
      res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: error.message || 'Failed to fetch nearby workers',
      });
    }
  }

  async getWorkerAvailability(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { workerId } = req.query;
      console.log(workerId);
      if (!workerId) {
        res
          .status(STATUS_CODES.BAD_REQUEST)
          .json({ error: 'Missing workerId' });
      }

      const data = await this._serviceDetails.getWorkerAvailablity(
        workerId as string,
      );
      console.log(data.data?.dates);
      res.status(STATUS_CODES.OK).json(data);
    } catch (err: any) {
      res
        .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ error: err.message });
    }
  }

  async getWorkerProfile(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { workerId } = req.query as { workerId: string };
      console.log(workerId);

      const response = await this._serviceDetails.getWorkerProfile(workerId);
      console.log(response);

      if (!response.success) {
        res.status(404).json(response);
        return;
      }

      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch worker profile',
      });
    }
  }
}
