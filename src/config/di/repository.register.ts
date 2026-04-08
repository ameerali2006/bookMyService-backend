import { container } from 'tsyringe';

import { IUserRepository } from '../../interface/repository/user.repository.interface';
import { UserRepository } from '../../repository/user/user.repository';
import { TYPES } from '../../config/constants/types';
import { OtpRepository } from '../../repository/shared/otp-repository.reposiory';
import { IOtpRepository } from '../../interface/repository/otp.repository.interface';
import { IAdminRepository } from '../../interface/repository/admin.repository.interface';
import { AdminRepository } from '../../repository/admin/admin.repository';
import { RefreshTokenRepository } from '../../repository/shared/refresh-token.repository';
import { IRefreshTokenRepository } from '../../interface/repository/refresh-token.repository.interface';
import { IWorkerRepository } from '../../interface/repository/worker.repository.interface';
import { WorkerRepository } from '../../repository/worker/worker.repository';
import { IServiceRepository } from '../../interface/repository/service.repository.interface';
import { ServiceRepository } from '../../repository/helper/service.repository';
import { IWorkingDetailsRepository } from '../../interface/repository/working-details.interface';
import { WorkingDetailsRepository } from '../../repository/shared/working-details.repository';
import { IWorkerAggregation } from '../../interface/repository/worker-aggregation.repository.interface';
import { WorkerAggregation } from '../../repository/worker/worker-aggregation.repository';
import { IBookingRepository } from '../../interface/repository/booking.repository.interface';
import { BookingRepository } from '../../repository/shared/booking-details.repository';

import { IWalletRepository } from '../../interface/repository/wallet.repository.interface';
import { WalletRepository } from '../../repository/shared/wallet.respository';
import { ITransactionRepository } from '../../interface/repository/transaction.repository.interface';
import { TransactionRepository } from '../../repository/shared/transaction.repository';
import { ISlotLockRepository } from '../../interface/repository/slot-lock.repository.interface';
import { SlotLockRepository } from '../../repository/helper/slot-lock.repository';
import { IChatRepository } from '../../interface/repository/chat.repository.interface';
import { ChatRepository } from '../../repository/shared/chat.repoository';
import { IMessageRepository } from '../../interface/repository/message.repoository.interface';
import { MessageRepository } from '../../repository/shared/message.repository';
import { IReviewRepository } from '../../interface/repository/review.repository.interface';
import { ReviewRepository } from '../../repository/shared/review.repository';
import { INotificationRepository } from '../../interface/repository/notification.repository.interface';
import { NotificationRepository } from '../../repository/shared/notification.repository';

export class RepositoryRegistery {
  static registerRepository():void {
    container.register<IUserRepository>(TYPES.AuthUserRepository, { useClass: UserRepository });
    container.register<IOtpRepository>(TYPES.OtpRepository, { useClass: OtpRepository });
    container.register<IAdminRepository>(TYPES.AdminRepository, { useClass: AdminRepository });
    container.register<IWorkerRepository>(TYPES.WorkerRepository, { useClass: WorkerRepository });
    container.register<ISlotLockRepository>(TYPES.SlotLockRepository, { useClass: SlotLockRepository });
    container.register<IRefreshTokenRepository>(TYPES.RefreshTokenRepository, { useClass: RefreshTokenRepository });
    container.register<IServiceRepository>(TYPES.ServiceRepository, { useClass: ServiceRepository });
    container.register<IWorkingDetailsRepository>(TYPES.WorkingDetailsRepository, { useClass: WorkingDetailsRepository });
    container.register<IWorkerAggregation>(TYPES.WorkerAggregation, { useClass: WorkerAggregation });
    container.register<IBookingRepository>(TYPES.BookingRepository, { useClass: BookingRepository });

    container.register<IWalletRepository>(TYPES.WalletRepository, { useClass: WalletRepository });
    container.register<ITransactionRepository>(TYPES.TransactionRepository, { useClass: TransactionRepository });
    container.register<IChatRepository>(TYPES.ChatRepository, { useClass: ChatRepository });
    container.register<IMessageRepository>(TYPES.MessageRepository, { useClass: MessageRepository });
    container.register<INotificationRepository>(TYPES.NotificationRepository, { useClass: NotificationRepository });
    container.register<IReviewRepository>(TYPES.ReviewRepository, { useClass: ReviewRepository });
  }
}
