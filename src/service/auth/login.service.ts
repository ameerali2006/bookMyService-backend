import { inject, injectable } from 'tsyringe';
import { LoginDto } from '../../dto/shared/login.dto';
import { UserDataDTO } from '../../dto/user/auth/user-data.dto';
import { responseDto } from '../../dto/worker/auth/worker-register.dto';
import { ILoginService } from '../../interface/service/auth/login.service.interface';
import { ILoginResponseDto } from '../../dto/auth.dto';
import { TYPES } from '../../config/constants/types';
import { IAdminRepository } from '../../interface/repository/admin.repository.interface';
import { IWorkerRepository } from '../../interface/repository/worker.repository.interface';
import { IUserRepository } from '../../interface/repository/user.repository.interface';
import { CustomError } from '../../utils/custom-error';
import { MESSAGES } from '../../config/constants/message';
import { STATUS_CODES } from '../../config/constants/status-code';
import { IUser } from '../../interface/model/user.model.interface';
import { IWorker } from '../../interface/model/worker.model.interface';
import { IAdmin } from '../../interface/model/admin.model.interface';
import { IHashService } from '../../interface/helpers/hash.interface';
import { IJwtService } from '../../interface/helpers/jwt-service.service.interface';
import { AdminDataDTO } from '../../dto/admin/admin.dto';
import { UserMapper } from '../../utils/mapper/user-mapper';
import { WorkerMapper } from '../../utils/mapper/worker-mapper';
import { AdminMapper } from '../../utils/mapper/admin-mapper';

@injectable()
export class LoginService implements ILoginService {
  constructor(
        @inject(TYPES.AdminRepository) private _adminRepo:IAdminRepository,
        @inject(TYPES.WorkerRepository) private _workerRepo:IWorkerRepository,
        @inject(TYPES.AuthUserRepository) private _userRepo:IUserRepository,
        @inject(TYPES.PasswordService) private _passwordHash:IHashService,
        @inject(TYPES.JwtService) private _jwtService:IJwtService,

  ) {

  }

  async execute(user: LoginDto): Promise<ILoginResponseDto> {
    try {
      let repository;
      if (user.role == 'admin') {
        repository = this._adminRepo;
      } else if (user.role == 'user') {
        repository = this._userRepo;
      } else if (user.role == 'worker') {
        repository = this._workerRepo;
      } else {
        throw new CustomError(
          'invalid role',
          STATUS_CODES.UNAUTHORIZED,
        );
      }

      const userData: IUser |IWorker|IAdmin| null = await repository.findByEmail(user.email);
      console.log(userData);
      if (!userData) {
        throw new CustomError(
          MESSAGES.USER_NOT_FOUND,
          STATUS_CODES.UNAUTHORIZED,
        );
      }
      if (user.role != 'admin') {
        if ((userData as IUser|IWorker).isBlocked) {
          return {
            success: false, message: user.role == 'user' ? MESSAGES.USER_BLOCKED : MESSAGES.WORKER_BLOCKED, accessToken: null, refreshToken: null, user: null,
          };
        }
      }

      if (!userData) {
        throw new CustomError(
          MESSAGES.INVALID_CREDENTIALS,
          STATUS_CODES.UNAUTHORIZED,
        );
      }
      if (!userData.password) {
        throw new CustomError(
          MESSAGES.INVALID_CREDENTIALS,
          STATUS_CODES.UNAUTHORIZED,
        );
      }

      const isPasswordValid: boolean = await this._passwordHash.compare(
        user.password,
        userData.password,
      );
      if (!isPasswordValid) {
        console.log('password is wrong');

        throw new CustomError(
          MESSAGES.INVALID_CREDENTIALS,
          STATUS_CODES.UNAUTHORIZED,
        );
      }

      const accessToken = this._jwtService.generateAccessToken(userData._id.toString(), user.role);
      const refreshToken = this._jwtService.generateRefreshToken(userData._id.toString(), user.role);
      if (!accessToken || !refreshToken) {
        console.log('token not found');
        throw new CustomError(
          MESSAGES.BAD_REQUEST,
          STATUS_CODES.UNAUTHORIZED,
        );
      }
      let data;
      if (user.role == 'user') {
        data = UserMapper.resposeWorkerDto(userData as IUser);
      } else if (user.role == 'worker') {
        data = WorkerMapper.responseWorkerDto(userData as IWorker);
      } else if (user.role == 'admin') {
        data = AdminMapper.resAdminData(userData as IAdmin);
      } else {
        throw new CustomError(
          MESSAGES.INVALID_CREDENTIALS,
          STATUS_CODES.UNAUTHORIZED,
        );
      }

      return {
        success: true, message: MESSAGES.LOGIN_SUCCESS, accessToken, refreshToken, user: data,
      };
    } catch (error) {
      console.error(error);
      throw new CustomError(
        MESSAGES.INVALID_CREDENTIALS,
        STATUS_CODES.UNAUTHORIZED,
      );
    }
  }
}
