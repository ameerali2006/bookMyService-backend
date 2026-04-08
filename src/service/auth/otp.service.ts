import { inject, injectable } from 'tsyringe';
import { IOtp } from '../../interface/model/otp.model.interface';
import { IOtpService } from '../../interface/service/auth/otp.service.interface';
import { TYPES } from '../../config/constants/types';
import { IEmailService } from '../../interface/helpers/email-service.service.interface';
import { IHashService } from '../../interface/helpers/hash.interface';
import { IOtpRepository } from '../../interface/repository/otp.repository.interface';
import { CustomError } from '../../utils/custom-error';
import { MESSAGES } from '../../config/constants/message';
import { STATUS_CODES } from '../../config/constants/status-code';
import { IUserRepository } from '../../interface/repository/user.repository.interface';
import { IWorkerRepository } from '../../interface/repository/worker.repository.interface';
import { IUser } from '../../interface/model/user.model.interface';
import { IWorker } from '../../interface/model/worker.model.interface';
import { OtpVerifyDto } from '../../dto/shared/otp.dto';

@injectable()
export class OtpService implements IOtpService {
  constructor(
        @inject(TYPES.EmailService) private _emailService:IEmailService,
        @inject(TYPES.PasswordService) private _hash:IHashService,
        @inject(TYPES.OtpRepository) private _otpRepo:IOtpRepository,
        @inject(TYPES.AuthUserRepository) private _userRepo:IUserRepository,
        @inject(TYPES.WorkerRepository) private _workerRepo:IWorkerRepository,
  ) {}

  async generate(email: string): Promise<IOtp> {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expireAt: Date = new Date(Date.now() + 2 * 60 * 1000);
    console.log('otp', otp);
    const hashedOtp = await this._hash.hash(String(otp));

    const otpdata: Partial<IOtp> = {
      email,
      otp: hashedOtp,
      expireAt,
    };
    const content: string = this._emailService.generateOtpEmailContent(otp);
    const subject: string = 'OTP Verification';
    console.log('otp anooo');

    await this._emailService.sendEmail(email, subject, content);
    console.log('sathanamm');
    return await this._otpRepo.create(otpdata);
  }

  async verify(otpData: OtpVerifyDto): Promise<void> {
    try {
      const data: IOtp | null = await this._otpRepo.findOtp(otpData.email);
      if (!data) {
        throw new CustomError(MESSAGES.OTP_INVALID, STATUS_CODES.UNAUTHORIZED);
      }

      const currentTime = new Date();
      const otpExpiryTime = new Date(data.expireAt);
      let repository;
      if (otpData.role == 'user') {
        repository = this._userRepo;
      } else if (otpData.role == 'worker') {
        repository = this._workerRepo;
      } else {
        throw new CustomError(MESSAGES.OTP_INVALID, STATUS_CODES.NOT_FOUND);
      }

      const user: IUser|IWorker | null = await repository.findByEmail(otpData.email);
      if (user) {
        throw new CustomError('Email already exists', STATUS_CODES.CONFLICT);
      }

      const isValid = await this._hash.compare(
        String(otpData.otp),
        data.otp,
      );
      if (!isValid) {
        throw new CustomError(MESSAGES.OTP_INVALID, STATUS_CODES.UNAUTHORIZED);
      }

      if (currentTime > otpExpiryTime) {
        throw new CustomError(MESSAGES.OTP_INVALID, STATUS_CODES.UNAUTHORIZED);
      }
    } catch (error) {
      console.error('verify otp :', error);
      throw new CustomError(MESSAGES.OTP_INVALID, STATUS_CODES.BAD_REQUEST);
    }
  }
}
