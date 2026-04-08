import { container } from 'tsyringe';

import { TYPES } from '../../config/constants/types';

import { HashService } from '../../service/helper/hash.service';
import { IHashService } from '../../interface/helpers/hash.interface';
import { EmailService } from '../../service/helper/email-service.service';
import { IEmailService } from '../../interface/helpers/email-service.service.interface';
import { IJwtService } from '../../interface/helpers/jwt-service.service.interface';
import { JwtService } from '../../service/helper/jwt-auth.service';
import { TokenService } from '../../service/shared/token.service';
import { ITokenservice } from '../../interface/service/token.service.interface';

import { LoginService } from '../../service/auth/login.service';
import { ILoginService } from '../../interface/service/auth/login.service.interface';

import { AuthAdminService } from '../../service/admin/auth-admin.service';
import { IAuthAdminService } from '../../interface/service/auth-admin.service.interface';
import { ICloudinaryService } from '../../interface/helpers/cloudinary.service.interface';
import { CloudinaryService } from '../../service/helper/cloudinary.service';
import { IGoogleAuthService } from '../../interface/service/google-auth.service.interface';
import { GoogleAuthService } from '../../service/shared/google-auth.service';
import { IManagementAdminService } from '../../interface/service/management-admin.service.interface';
import { ManagementAdminService } from '../../service/admin/management-admin.service';
import { IResetPassword } from '../../interface/service/reset-password.service.interface';
import { ResetPassword } from '../../service/shared/reset-password.service';
import { IWorkerHelperService } from '../../interface/service/helper-service.service.interface';
import { WorkerHelperService } from '../../service/worker/helper.service';
import { IRegisterService } from '../../interface/service/auth/register.service.interface';
import { RegisterService } from '../../service/auth/register.service';
import { IOtpService } from '../../interface/service/auth/otp.service.interface';
import { OtpService } from '../../service/auth/otp.service';
import { IGoogleService } from '../../interface/service/auth/google.service.interface';
import { GoogleService } from '../../service/auth/google-auth.service';

import { IIsVerified } from '../../interface/service/auth/is-verified.service.interface';
import { IsVerified } from '../../service/auth/is-verified.service';

import { IDateConversionService } from '../../interface/service/date-convertion.service.interface';
import { DateConversionService } from '../../service/helper/date-convertion.service';

import { IServiceDetails } from '../../interface/service/services/Service-details.service.interface';
import { ServiceDetails } from '../../service/services/service-details.service';
import { IProfileManagement } from '../../interface/service/user/profile-management.serice.interface';
import { ProfileManagement } from '../../service/user/profile-management.service';
import { IWorkingDetailsManagement } from '../../interface/service/worker/workingDetails.service.interface';
import { WorkingDetailsManagement } from '../../service/worker/working-details.service';
import { IWorkingHelper } from '../../interface/service/working-helper.service.interface';
import { WorkingHelper } from '../../service/helper/working-helper.service';
import { IAddressRepository } from '../../interface/repository/address.repository.interface';
import { AddressRepository } from '../../repository/shared/address.repository';
import { IBookingService } from '../../interface/service/services/booking-service.sevice.interface';
import { BookingService } from '../../service/services/booking-service.service';
import { IStripeService } from '../../interface/service/stripe.service.interface';
import { StripeService } from '../../service/helper/stripe.service';
import { IWorkerBookingService } from '../../interface/service/worker/worker-booking.service.interface';
import { WorkerBookingService } from '../../service/worker/worker-booking.service';
import { IChangePasswordService } from '../../interface/service/change-password.service.interface';
import { ChangePasswordService } from '../../service/shared/change-password.service';
import { BookingSocketHandler } from '../../service/helper/booking-socket.service';
import { ISocketHandler } from '../../interface/service/socket-handler.service.interface';
import { IWalletService } from '../../interface/service/wallet.service.interface';
import { WalletService } from '../../service/shared/wallet.service';
import { IBookingDetailsService } from '../../interface/service/user/booking-details.service.interface';
import { BookingDetailsService } from '../../service/user/booking-details.service';
import { RedisTokenService } from '../../repository/shared/redis.repository';
import { IRedisTokenService } from '../../interface/service/redis.service.interface';
import { ITransactionService } from '../../interface/service/transaction.service.interface';
import { TransactionService } from '../../service/shared/transaction.service';
import { IChatService } from '../../interface/service/chat.service.interface';
import { ChatService } from '../../service/shared/chat.service';
import { IReviewService } from '../../interface/service/review.service.Interface';
import { ReviewService } from '../../service/shared/review.service';
import { io, onlineUsers } from '../socketServer';
import { INotificationService } from '../../interface/service/notification.service.interface';
import { NotificationService } from '../../service/shared/notification.service';
import { IWorkerPayoutService } from '../../interface/service/worker/worker-payout.service.interface';
import { WorkerPayoutService } from '../../service/worker/worker-payout.service';

export class ServiceRegistery {
  static registerService():void {
    container.register<IHashService>(TYPES.PasswordService, { useClass: HashService });
    container.register<IEmailService>(TYPES.EmailService, { useClass: EmailService });
    container.register<IJwtService>(TYPES.JwtService, { useClass: JwtService });
    container.register<IAuthAdminService>(TYPES.AuthAdminService, { useClass: AuthAdminService });
    container.register<ITokenservice>(TYPES.TokenService, { useClass: TokenService });
    container.register<ICloudinaryService>(TYPES.CloudinaryService, { useClass: CloudinaryService });
    container.register<IGoogleAuthService>(TYPES.GoogleAuthService, { useClass: GoogleAuthService });
    container.register<IManagementAdminService>(TYPES.ManagementAdminService, { useClass: ManagementAdminService });
    container.register<IResetPassword>(TYPES.ResetPassword, { useClass: ResetPassword });
    container.register<IWorkerHelperService>(TYPES.WorkerHelperService, { useClass: WorkerHelperService });

    container.register<ILoginService>(TYPES.LoginService, { useClass: LoginService });
    container.register<IRegisterService>(TYPES.RegisterService, { useClass: RegisterService });
    container.register<IOtpService>(TYPES.OtpService, { useClass: OtpService });
    container.register<IGoogleService>(TYPES.GoogleService, { useClass: GoogleService });
    container.register<IAddressRepository>(TYPES.AddressRepository, { useClass: AddressRepository });

    container.register<IIsVerified>(TYPES.IsVerified, { useClass: IsVerified });
    container.register<IRedisTokenService>(TYPES.RedisTokenService, { useClass: RedisTokenService });
    container.register<IDateConversionService>(TYPES.DateConversionService, { useClass: DateConversionService });
    container.register<IWorkerBookingService>(TYPES.WorkerBookingService, { useClass: WorkerBookingService });
    container.register<IProfileManagement>(TYPES.ProfileManagement, { useClass: ProfileManagement });
    container.register<IServiceDetails>(TYPES.ServiceDetails, { useClass: ServiceDetails });
    container.register<IWorkingDetailsManagement>(TYPES.WorkingDetailsManagement, { useClass: WorkingDetailsManagement });
    container.register<IWorkingHelper>(TYPES.WorkingHelper, { useClass: WorkingHelper });
    container.register<IBookingService>(TYPES.BookingService, { useClass: BookingService });
    container.register<IStripeService>(TYPES.StripeService, { useClass: StripeService });
    container.register<IChangePasswordService>(TYPES.ChangePasswordService, { useClass: ChangePasswordService });
    container.register<IWalletService>(TYPES.WalletService, { useClass: WalletService });
    container.register<IBookingDetailsService>(TYPES.BookingDetailsService, { useClass: BookingDetailsService });
    container.register<ITransactionService>(TYPES.TransactionService, { useClass: TransactionService });
    container.register<ISocketHandler>(TYPES.BookingSocketHandler, { useClass: BookingSocketHandler });
    container.register<IChatService>(TYPES.ChatService, { useClass: ChatService });
    container.register<IReviewService>(TYPES.ReviewService, { useClass: ReviewService });
    container.register<INotificationService>(TYPES.NotificationService, { useClass: NotificationService });
    container.register<IWorkerPayoutService>(TYPES.WorkerPayoutService, { useClass: WorkerPayoutService });
  }
}
