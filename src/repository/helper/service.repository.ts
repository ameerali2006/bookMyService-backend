import { ServiceModel } from '../../model/service.model';
import { IService } from '../../interface/model/service.model.interface';
import { IServiceRepository } from '../../interface/repository/service.repository.interface';
import { BaseRepository } from '../shared/base.repository';

export class ServiceRepository
  extends BaseRepository<IService>
  implements IServiceRepository {
  constructor() {
    super(ServiceModel);
  }

  async findActiveServices(): Promise<IService[]> {
    return this.find({ status: 'active' });
  }

  async findByCategory(category: string): Promise<IService[]> {
    return this.find({ category });
  }

  async findActiveServicesByIds(ids: string[]): Promise<IService[]> {
    return this.find({ _id: { $in: ids }, status: 'active' });
  }
}
