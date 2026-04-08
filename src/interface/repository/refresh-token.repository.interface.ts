import { IRefreshTokenDocument } from '../../interface/model/refresh-token.model.interface';
import { IBaseRepository } from './base.repository.interface';

export interface IRefreshTokenRepository
  extends IBaseRepository<IRefreshTokenDocument> {
  revokeRefreshToken(token: string): Promise<void>;
}
