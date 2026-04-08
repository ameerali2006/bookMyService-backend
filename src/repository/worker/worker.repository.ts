import { injectable } from 'inversify';
import { IWorkerRepository } from '../../interface/repository/worker.repository.interface';
import { WorkerModel } from '../../model/worker.model';
import { BaseRepository } from '../../repository/shared/base.repository';
import { IWorker } from '../../interface/model/worker.model.interface';

@injectable()
export class WorkerRepository
  extends BaseRepository<IWorker>
  implements IWorkerRepository {
  constructor() {
    super(WorkerModel);
  }

  async findByEmail(email: string): Promise<IWorker | null> {
    return await WorkerModel.findOne({ email });
  }
}
