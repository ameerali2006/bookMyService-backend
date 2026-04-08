import { refreshTokenResponse } from '../../dto/shared/helpers.dto';

export interface ITokenservice{
    blacklistToken(token:string):Promise<void>
    revokeRefreshToken(token:string):Promise<void>
    refreshToken(refreshToken: string): Promise<refreshTokenResponse>
}
