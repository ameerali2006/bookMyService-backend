import { IWorker } from '../../interface/model/worker.model.interface';

import { IBaseRepository } from './base.repository.interface';

export interface IWorkerRepository extends IBaseRepository<IWorker> {
  findByEmail(email: string): Promise<IWorker | null>;

}
