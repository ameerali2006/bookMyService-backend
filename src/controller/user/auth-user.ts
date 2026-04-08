import { Request, Response, NextFunction } from 'express';
import { injectable, inject } from 'tsyringe';
import { IAuthController } from '../../interface/controller/auth-user.controller.interface';
import { TYPES } from '../../config/constants/types';
import { MESSAGES } from '../../config/constants/message';
import { STATUS_CODES } from '../../config/constants/status-code';
import { LoginDto } from '../../dto/shared/login.dto';
import { clearAuthCookies, setAuthCookies, updateCookieWithAccessToken } from '../../utils/cookie-helper';
import { ITokenservice } from '../../interface/service/token.service.interface';
import { CustomRequest } from '../../middleware/auth.middleware';
import { IResetPassword } from '../../interface/service/reset-password.service.interface';
import { ILoginService } from '../../interface/service/auth/login.service.interface';
import { schemasByRole } from '../validation/register.zod';
import { IRegisterService } from '../../interface/service/auth/register.service.interface';
import { IOtpService } from '../../interface/service/auth/otp.service.interface';
import { IGoogleService } from '../../interface/service/auth/google.service.interface';
import { CustomError } from '../../utils/custom-error';
import { IJwtService } from '../../interface/helpers/jwt-service.service.interface';

@injectable()
export class AuthUserController implements IAuthController {
  constructor(

    @inject(TYPES.TokenService) private _tokenService:ITokenservice,
    @inject(TYPES.ResetPassword) private _resetPassword:IResetPassword,
    @inject(TYPES.RegisterService) private _Register:IRegisterService,
    @inject(TYPES.LoginService) private _Login:ILoginService,
    @inject(TYPES.OtpService) private _Otp:IOtpService,
    @inject(TYPES.GoogleService) private _googleAuth:IGoogleService,
     @inject(TYPES.JwtService) private _jwtService:IJwtService,

  ) {}

  async register(req: Request, res: Response, next:NextFunction) {
    try {
      const UserData = req.body as {role :keyof typeof schemasByRole};
      const schema = schemasByRole.user;
      const result = schema.parse(UserData);

      const { accessToken, refreshToken, user: userData } = await this._Register.execute(result);
      const accessTokenName = 'access_token';
      const refreshTokenName = 'refresh_token';
      setAuthCookies(
        res,
        accessToken,
        refreshToken,
        accessTokenName,
        refreshTokenName,
      );

      res.status(STATUS_CODES.CREATED).json({ success: true, message: MESSAGES.REGISTRATION_SUCCESS, userData });
    } catch (error) {
      res.status(STATUS_CODES.BAD_REQUEST).json({ success: false, message: MESSAGES.REGISTRATION_FAILED });
      next(error);
    }
  }

  async generateOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      console.log(`otp generation ${email}`);
      await this._Otp.generate(email);
      res
        .status(STATUS_CODES.CREATED)
        .json({ success: true, message: MESSAGES.OTP_SENT });
    } catch (error) {
      next(error);
    }
  }

  async verifyOtp(req: Request, res: Response, next :NextFunction): Promise<void> {
    try {
      await this._Otp.verify(req.body);

      res
        .status(STATUS_CODES.OK)
        .json({ success: true, message: MESSAGES.OTP_VERIFIED });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const loginCredential: LoginDto = req.body;
      const {
        success, message, refreshToken, accessToken, user: userData,
      } = await this._Login.execute(
        loginCredential,
      );

      if (success && accessToken && refreshToken && userData) {
        const accessTokenName = 'access_token';
        const refreshTokenName = 'refresh_token';
        setAuthCookies(
          res,
          accessToken,
          refreshToken,
          accessTokenName,
          refreshTokenName,
        );
        const profilePic = 'image' in userData
          ? userData.image
          : 'profileImage' in userData
            ? userData.profileImage
            : undefined;
        res
          .status(STATUS_CODES.OK)
          .json({
            success: true,
            message: MESSAGES.LOGIN_SUCCESS,
            user: {
              _id: userData._id,
              name: userData.name,
              email: userData.email,
              image: profilePic,

            },
          });
      } else {
        res
          .status(STATUS_CODES.OK)
          .json({
            success,
            message,
            user: null,       
          });
      }
    } catch (error) {
      next(error);
    }
  }

  async googleLogin(req: Request, res: Response, next: NextFunction) {
    console.log('google login - user');
    try {
      const { token, role } = req.body;
      const {
        success, message, refreshToken, accessToken, user, isNew,
      } = await this._googleAuth.execute(token, role);
      if (!isNew && accessToken && refreshToken && user) {
        const accessTokenName = 'access_token';
        const refreshTokenName = 'refresh_token';
        setAuthCookies(
          res,
          accessToken,
          refreshToken,
          accessTokenName,
          refreshTokenName,
        );
        console.log(user);
        res
          .status(STATUS_CODES.OK)
          .json({
            success: true,
            message: MESSAGES.LOGIN_SUCCESS,
            user: {
              _id: user._id,
              name: user.name,
              email: user.email,
              image: user?.image,

            },
          });
      } else {
        throw new CustomError(MESSAGES.REGISTRATION_FAILED, STATUS_CODES.BAD_REQUEST);
      }
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('log out');

      await this._tokenService.blacklistToken(
        (req as CustomRequest).user.access_token,
      );
      console.log('1');

      await this._tokenService.revokeRefreshToken(
        (req as CustomRequest).user.refresh_token,
      );
      console.log('12');
      const { user } = (req as CustomRequest);
      const accessTokenName = 'access_token';
      const refreshTokenName = 'refresh_token';
      clearAuthCookies(res, accessTokenName, refreshTokenName);
      console.log('13');
      res.status(STATUS_CODES.OK).json({
        success: true,
        message: MESSAGES.LOGOUT_SUCCESS,
      });
    } catch (error) {
      console.error(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next :NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.VALIDATION_ERROR,
        });
      }
      const result = await this._resetPassword.forgotPassword(email, 'user');

      res.status(STATUS_CODES.OK).json(result);
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next :NextFunction): Promise<void> {
    try {
      console.log('resetPassword-controller');
      const { token, password } = req.body;
      if (!token || !password) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.VALIDATION_ERROR,
        });
      }

      await this._resetPassword.resetPassword(token, password, 'user');
      res.status(STATUS_CODES.OK).json({
        success: true,
        message: MESSAGES.PASSWORD_RESET_SUCCESS,
      });
    } catch (error) {
      next(error);
    }
  }

  async handleTokenRefresh(req: Request, res: Response): Promise<void> {
    try {
      console.log('ALL COOKIES:', req.cookies);

      const refreshToken = req.cookies?.refresh_token;

      console.log('REFRESH TOKEN FROM COOKIE:', refreshToken);

      if (!refreshToken) {
        console.log('NO REFRESH TOKEN FOUND');
        res.status(401).json({
          message: 'Refresh token missing',
        });
        return;
      }

      const payload = this._jwtService.verifyToken(
        refreshToken,
        'refresh',
      );

      console.log('REFRESH PAYLOAD:', payload);

      const newTokens = await this._tokenService.refreshToken(refreshToken);

      updateCookieWithAccessToken(
        res,
        newTokens.accessToken,
        'access_token',
      );

      res.status(200).json({
        success: true,
        message: 'Token refreshed',
      });
    } catch (error) {
      console.log('REFRESH ERROR:', error);

      clearAuthCookies(res, 'access_token', 'refresh_token');

      res.status(401).json({
        message: 'Invalid refresh token',
      });
    }
  }
}
