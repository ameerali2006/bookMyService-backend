import { injectable } from 'inversify';
import { BaseRepository } from '../../repository/shared/base.repository';

import { IAddress } from '../../interface/model/address.model.interface';
import { IAddressRepository } from '../../interface/repository/address.repository.interface';
import { AddressModel } from '../../model/address.model';

@injectable()
export class AddressRepository
  extends BaseRepository<IAddress>
  implements IAddressRepository {
  constructor() {
    super(AddressModel);
  }

  async findByUserId(userId: string): Promise<IAddress[]> {
    return await AddressModel.find({ userId });
  }

  async findPrimaryByUserId(userId: string): Promise<IAddress | null> {
    return await AddressModel.findOne({ userId, isPrimary: true });
  }

  async findByLabel(userId: string, label: string): Promise<IAddress | null> {
    return await AddressModel.findOne({ userId, label });
  }
}
