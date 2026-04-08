import { inject, injectable } from 'tsyringe';
import { UserDataRegisterDto, UserRegisterDTO } from '../../dto/user/auth/user-register.dto';
import { UserDataDTO } from '../../dto/user/auth/user-data.dto';
import { WorkerRegisterDTO, responseDto } from '../../dto/worker/auth/worker-register.dto';
import { IRegisterService } from '../../interface/service/auth/register.service.interface';
import { TYPES } from '../../config/constants/types';
import { IAdminRepository } from '../../interface/repository/admin.repository.interface';
import { IWorkerRepository } from '../../interface/repository/worker.repository.interface';
import { IUserRepository } from '../../interface/repository/user.repository.interface';
import { IHashService } from '../../interface/helpers/hash.interface';
import { IJwtService } from '../../interface/helpers/jwt-service.service.interface';
import { MESSAGES } from '../../config/constants/message';
import { STATUS_CODES } from '../../config/constants/status-code';
import { CustomError } from '../../utils/custom-error';
import { UserMapper } from '../../utils/mapper/user-mapper';
import { WorkerMapper } from '../../utils/mapper/worker-mapper';
import { IUser } from '../../interface/model/user.model.interface';
import { IWorker } from '../../interface/model/worker.model.interface';

@injectable()
export class RegisterService implements IRegisterService {
  constructor(

        @inject(TYPES.WorkerRepository) private _workerRepo:IWorkerRepository,
        @inject(TYPES.AuthUserRepository) private _userRepo:IUserRepository,
        @inject(TYPES.PasswordService) private _passwordHash:IHashService,
        @inject(TYPES.JwtService) private _jwtService:IJwtService,
  ) {

  }

  async execute(user: WorkerRegisterDTO | UserDataRegisterDto): Promise<{ accessToken: string; refreshToken: string; user: UserDataDTO | responseDto; }> {
    try {
      let repository;

      if (user.role == 'user') {
        repository = this._userRepo;
      } else if (user.role == 'worker') {
        repository = this._workerRepo;
      } else {
        throw new CustomError(
          MESSAGES.INVALID_CREDENTIALS,
          STATUS_CODES.UNAUTHORIZED,
        );
      }
      const existingUser = await repository.findByEmail(user.email);
      if (existingUser) {
        throw new CustomError(MESSAGES.ALREADY_EXISTS, STATUS_CODES.CONFLICT);
      }
      if (!user.password) {
        throw new CustomError(MESSAGES.INVALID_CREDENTIALS, STATUS_CODES.UNAUTHORIZED);
      }
      user.password = await this._passwordHash.hash(user.password);
      let userDbData;
      if (user.role == 'worker') {
        const workerData = {
          name: user.name,
          email: user.email,
          phone: user.phone,
          password: user.password,

          location: {
            type: 'Point' as const,
            coordinates: [
              parseFloat(user.longitude),
              parseFloat(user.latitude),
            ] as [number, number],
          },

          zone: user.zone,
          category: user.category,
          experience: user.experience,
          documents: user.documents,

        };
        userDbData = await repository.create(workerData);
      } else {
        userDbData = await repository.create(user);
      }

      let userData;
      if (user.role == 'user') {
        userData = UserMapper.resposeWorkerDto(userDbData as IUser);
      } else if (user.role == 'worker') {
        userData = WorkerMapper.responseWorkerDto(userDbData as IWorker);
      } else {
        throw new CustomError(
          MESSAGES.INVALID_CREDENTIALS,
          STATUS_CODES.UNAUTHORIZED,
        );
      }
      const accessToken = this._jwtService.generateAccessToken(userDbData._id.toString(), user.role);
      const refreshToken = this._jwtService.generateRefreshToken(userDbData._id.toString(), user.role);

      return {
        accessToken,
        refreshToken,
        user: userData,
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
