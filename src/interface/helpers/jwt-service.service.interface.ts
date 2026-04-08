import { ResetTokenPayload } from '../../service/helper/jwt-auth.service';

export interface IJwtService {
  generateAccessToken(_id: string, role:'user'|'admin'|'worker'): string;
  generateRefreshToken(_id: string, role:'user'|'admin'|'worker'): string;
  verifyToken(token: string, type: 'access' | 'refresh'): any;
  generateResetToken(email: string): string;
  verifyResetToken(token: string): ResetTokenPayload | null
  decodeResetToken(token: string): ResetTokenPayload | null

}
