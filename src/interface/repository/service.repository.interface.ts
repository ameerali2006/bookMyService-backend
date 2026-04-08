import { IBaseRepository } from './base.repository.interface';
import { IService } from '../model/service.model.interface';

export interface IServiceRepository extends IBaseRepository<IService> {
  findActiveServices(): Promise<IService[]>;
  findByCategory(category: string): Promise<IService[]>;
  findActiveServicesByIds(ids: string[]): Promise<IService[]>
}
