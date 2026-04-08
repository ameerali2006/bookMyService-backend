import { injectable } from 'tsyringe';
import { BaseRepository } from './base.repository';
import {

  RefreshTokenModel,
} from '../../model/refresh-token.model';
import { IRefreshTokenDocument } from '../../interface/model/refresh-token.model.interface';

import { IRefreshTokenRepository } from '../../interface/repository/refresh-token.repository.interface';

@injectable()
export class RefreshTokenRepository extends BaseRepository<IRefreshTokenDocument> implements IRefreshTokenRepository {
  constructor() {
    super(RefreshTokenModel);
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await RefreshTokenModel.deleteOne({ token });
  }
}
