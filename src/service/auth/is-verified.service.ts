import { inject, injectable } from 'tsyringe';
import { IIsVerified } from '../../interface/service/auth/is-verified.service.interface';
import { TYPES } from '../../config/constants/types';
import { IWorkerRepository } from '../../interface/repository/worker.repository.interface';

@injectable()
export class IsVerified implements IIsVerified {
  constructor(
        @inject(TYPES.WorkerRepository) private _workerRepo:IWorkerRepository,
  ) {}

  async execute(email: string): Promise<{ _id: string | null; status: string | null; }> {
    try {
      console.log(email);
      const data = await this._workerRepo.findByEmail(email);
      console.log(data);
      if (!data) {
        return {
          _id: null,
          status: null,
        };
      }
      return {
        _id: data._id.toString(),
        status: data.isVerified,
      };
    } catch (error) {
      console.error('isverified:', error);
      return {
        _id: null,
        status: null,
      };
    }
  }
}
