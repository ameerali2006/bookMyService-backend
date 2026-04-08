import { injectable, inject } from 'tsyringe';
import { CustomError } from '../../utils/custom-error';
import { IHashService } from '../../interface/helpers/hash.interface';
import { LoginDto } from '../../dto/shared/login.dto';
import { IJwtService } from '../../interface/helpers/jwt-service.service.interface';
import { IAuthAdminService } from '../../interface/service/auth-admin.service.interface';

import { IAdminRepository } from '../../interface/repository/admin.repository.interface';
import { MESSAGES } from '../../config/constants/message';
import { STATUS_CODES } from '../../config/constants/status-code';
import { TYPES } from '../../config/constants/types';

import { IUserRepository } from '../../interface/repository/user.repository.interface';
import { IAdmin } from '../../interface/model/admin.model.interface';
import { IUser } from '../../interface/model/user.model.interface';

@injectable()
export class AuthAdminService implements IAuthAdminService {
  constructor(
    @inject(TYPES.AdminRepository) private _adminrepository: IAdminRepository,
    @inject(TYPES.AuthUserRepository) private _userrepository: IUserRepository,
    @inject(TYPES.PasswordService) private _passwordService: IHashService,
    @inject(TYPES.JwtService) private _jwtService: IJwtService,
  ) {}

  async login(
    adminCredential: LoginDto,
  ): Promise<{ accessToken: string; refreshToken: string, admin:{name:string, email:string}}> {
    console.log(adminCredential);
    const adminData: IAdmin | null = await this._adminrepository.findByEmail(
      adminCredential.email,
    );

    if (!adminData) {
      throw new CustomError(
        MESSAGES.INVALID_CREDENTIALS,
        STATUS_CODES.UNAUTHORIZED,
      );
    }

    if (!adminData.password) {
      throw new CustomError(
        MESSAGES.INVALID_CREDENTIALS,
        STATUS_CODES.UNAUTHORIZED,
      );
    }

    const isPasswordValid: boolean = await this._passwordService.compare(
      adminCredential.password,
      adminData.password,
    );
    if (!isPasswordValid) {
      throw new CustomError(
        MESSAGES.INVALID_CREDENTIALS,
        STATUS_CODES.UNAUTHORIZED,
      );
    }
    const accessToken = this._jwtService.generateAccessToken(adminData._id, 'admin');
    const refreshToken = this._jwtService.generateRefreshToken(adminData._id, 'admin');
    const admin = { name: adminData.name, email: adminData.email };

    return { accessToken, refreshToken, admin };
  }
}
