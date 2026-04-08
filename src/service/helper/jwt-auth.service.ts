import { injectable } from 'inversify';
import jwt, { JwtPayload } from 'jsonwebtoken';
import ms from 'ms';
import { ENV } from '../../config/env/env';
import { IJwtService } from '../../interface/helpers/jwt-service.service.interface';

export interface ResetTokenPayload extends JwtPayload {
	email: string;
}
@injectable()
export class JwtService implements IJwtService {
  generateAccessToken(_id:string, role:'user'|'admin'|'worker'):string {
    return jwt.sign({ _id, role }, ENV.ACCESS_TOKEN_SECRET as string, {
      expiresIn: ENV.ACCESS_TOKEN_EXPIRY as ms.StringValue,
    });
  }

  generateRefreshToken(_id:string, role:'user'|'admin'|'worker'):string {
    return jwt.sign({ _id, role }, ENV.REFRESH_TOKEN_SECRET as string, {
      expiresIn: ENV.REFRESH_TOKEN_EXPIRY as ms.StringValue,
    });
  }

  verifyToken(token:string, type:'access'|'refresh'):any {
    const secret = type === 'access' ? ENV.ACCESS_TOKEN_SECRET : ENV.REFRESH_TOKEN_SECRET;
    try {
      return jwt.verify(token, secret as string);
    } catch (error) {
      console.error('error on jwt :', error);
      return null;
    }
  }

  generateResetToken(email: string): string {
    return jwt.sign({ email }, ENV.RESET_SECRET_KEY, {
      expiresIn: ENV.RESET_EXPIRES_IN as ms.StringValue,
    });
  }

  verifyResetToken(token: string): ResetTokenPayload | null {
    try {
      return jwt.verify(token, ENV.RESET_SECRET_KEY) as ResetTokenPayload;
    } catch (error) {
      console.error('Reset token verification failed:', error);
      return null;
    }
  }

  decodeResetToken(token: string): ResetTokenPayload | null {
    try {
      return jwt.decode(token) as ResetTokenPayload;
    } catch (error) {
      console.error('Reset token decoding failed', error);
      return null;
    }
  }
}
