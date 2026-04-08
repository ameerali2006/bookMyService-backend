import { IAdmin } from '../../interface/model/admin.model.interface';
import { IBaseRepository } from './base.repository.interface';

export interface IAdminRepository extends IBaseRepository<IAdmin> {
  findByEmail(email: string): Promise<IAdmin | null>;
}
