import { IGoogleInfo } from '../../types/auth.types';

export interface IGoogleAuthService {
  verifyToken(token: string): Promise<IGoogleInfo>;
}
