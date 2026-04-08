import { IAdmin } from '../interface/model/admin.model.interface';
import { UserDataDTO } from './user/auth/user-data.dto';
import { responseDto } from './worker/auth/worker-register.dto';

export interface IIsVerifiedResponseDTO {
  _id: string | null;
  status: string | null;
}
export interface ILoginResponseDto {
  success: boolean;
  message: string;
  accessToken: string | null;
  refreshToken: string | null;
  user: UserDataDTO | responseDto | IAdmin | null;
}
export interface RegisterResponseDTO {
  accessToken: string;
  refreshToken: string;
  user: UserDataDTO | responseDto;
}
