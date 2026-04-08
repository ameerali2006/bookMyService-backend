import { inject, injectable } from 'tsyringe';
import { GoogleLoginResponseDTO } from '../../dto/worker/auth/worker-register.dto';
import { IGoogleService } from '../../interface/service/auth/google.service.interface';
import { TYPES } from '../../config/constants/types';
import { IWorkerRepository } from '../../interface/repository/worker.repository.interface';
import { IUserRepository } from '../../interface/repository/user.repository.interface';
import { IGoogleAuthService } from '../../interface/service/google-auth.service.interface';
import { CustomError } from '../../utils/custom-error';
import { IUser } from '../../interface/model/user.model.interface';
import { IWorker } from '../../interface/model/worker.model.interface';
import { IJwtService } from '../../interface/helpers/jwt-service.service.interface';
import { UserRegisterDTO } from '../../dto/user/auth/user-register.dto';
import { UserMapper } from '../../utils/mapper/user-mapper';
import { MESSAGES } from '../../config/constants/message';
import { STATUS_CODES } from '../../config/constants/status-code';

@injectable()
export class GoogleService implements IGoogleService {
  constructor(
        @inject(TYPES.WorkerRepository) private _workerRepo:IWorkerRepository,
        @inject(TYPES.AuthUserRepository) private _userRepo:IUserRepository,
        @inject(TYPES.GoogleAuthService) private _googleAuth:IGoogleAuthService,
        @inject(TYPES.JwtService) private _jwtService:IJwtService,

  ) {

  }

  async execute(token: string, role:'user'|'worker'): Promise<GoogleLoginResponseDTO> {
    try {
      const payload = await this._googleAuth.verifyToken(token);
      if (!payload || !payload.email || !payload.name) {
        console.log(payload);
        throw new CustomError('Invalid Google Token', 400);
      }
      const {
        email, name, sub, picture,
      } = payload;
      let repository;
      if (role == 'user') {
        repository = this._userRepo;
      } else if (role == 'worker') {
        repository = this._workerRepo;
      } else {
        throw new CustomError('Invalid Role', 400);
      }

      const user:IUser|IWorker|null = await repository.findByEmail(email);
      if (user) {
        const accessToken = this._jwtService.generateAccessToken(user._id.toString(), role);
        const refreshToken = this._jwtService.generateRefreshToken(user._id.toString(), role);

        return {
          success: true,
          message: 'login successfull',
          accessToken,
          refreshToken,
          user: {
            _id: user._id.toString(),
            name: user.name,
            email: user.email,
            googleId: sub,
            image: role == 'user' ? (user as IUser).image || null : (user as IWorker).profileImage || null,

          },
          isNew: false,

        };
      }
      if (role == 'user') {
        const UserData: UserRegisterDTO = {
          email,
          name,
          googleId: sub,
        };
        const userModel = UserMapper.toRegistrationModel(UserData);
        const newUser = await (repository as IUserRepository).create(userModel);
        const accessToken = this._jwtService.generateAccessToken(newUser._id.toString(), role);
        const refreshToken = this._jwtService.generateRefreshToken(newUser._id.toString(), role);
        return {
          success: true,
          message: 'register successfull',
          accessToken,
          refreshToken,
          user: {
            name: newUser.name,
            email: newUser.email,
            googleId: sub,
            image: newUser.image,

          },
          isNew: false,

        };
      }
      return {
        success: true,
        message: 'Google user verified',
        accessToken: null,
        refreshToken: null,
        user: {
          email,
          name,
          googleId: sub,
          image: picture || null,
        },
        isNew: false,
      };
    } catch (error) {
      throw new CustomError(MESSAGES.ACCOUNT_NOT_VERIFIED, STATUS_CODES.BAD_REQUEST);
    }
  }
}
