import { OAuth2Client } from 'google-auth-library';
import { injectable } from 'tsyringe';
import { ENV } from '../../config/env/env';
import { IGoogleAuthService } from '../../interface/service/google-auth.service.interface';
import { IGoogleInfo } from '../../types/auth.types';

@injectable()

export class GoogleAuthService implements IGoogleAuthService {
  private client = new OAuth2Client(ENV.GOOGLE_CLIENT_ID);

  async verifyToken(token: string): Promise<IGoogleInfo> {
    const ticket = await this.client.verifyIdToken({
      idToken: token,
      audience: ENV.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      throw new Error('Invalid Google token');
    }

    return payload as IGoogleInfo;
  }
}
