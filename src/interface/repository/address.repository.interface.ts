import { IAddress } from '../model/address.model.interface';
import { IBaseRepository } from './base.repository.interface';

export interface IAddressRepository extends IBaseRepository<IAddress>{

  findByUserId(userId: string): Promise<IAddress[]>;
  findPrimaryByUserId(userId: string): Promise<IAddress | null>;
  findByLabel(userId: string, label: string): Promise<IAddress | null>;
}
