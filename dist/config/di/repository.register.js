"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepositoryRegistery = void 0;
const tsyringe_1 = require("tsyringe");
const user_repository_1 = require("../../repository/user/user.repository");
const types_1 = require("../../config/constants/types");
const otp_repository_reposiory_1 = require("../../repository/shared/otp-repository.reposiory");
const admin_repository_1 = require("../../repository/admin/admin.repository");
const refresh_token_repository_1 = require("../../repository/shared/refresh-token.repository");
const worker_repository_1 = require("../../repository/worker/worker.repository");
const service_repository_1 = require("../../repository/helper/service.repository");
const working_details_repository_1 = require("../../repository/shared/working-details.repository");
const worker_aggregation_repository_1 = require("../../repository/worker/worker-aggregation.repository");
const booking_details_repository_1 = require("../../repository/shared/booking-details.repository");
const wallet_respository_1 = require("../../repository/shared/wallet.respository");
const transaction_repository_1 = require("../../repository/shared/transaction.repository");
const slot_lock_repository_1 = require("../../repository/helper/slot-lock.repository");
const chat_repoository_1 = require("../../repository/shared/chat.repoository");
const message_repository_1 = require("../../repository/shared/message.repository");
const review_repository_1 = require("../../repository/shared/review.repository");
const notification_repository_1 = require("../../repository/shared/notification.repository");
class RepositoryRegistery {
    static registerRepository() {
        tsyringe_1.container.register(types_1.TYPES.AuthUserRepository, { useClass: user_repository_1.UserRepository });
        tsyringe_1.container.register(types_1.TYPES.OtpRepository, { useClass: otp_repository_reposiory_1.OtpRepository });
        tsyringe_1.container.register(types_1.TYPES.AdminRepository, { useClass: admin_repository_1.AdminRepository });
        tsyringe_1.container.register(types_1.TYPES.WorkerRepository, { useClass: worker_repository_1.WorkerRepository });
        tsyringe_1.container.register(types_1.TYPES.SlotLockRepository, { useClass: slot_lock_repository_1.SlotLockRepository });
        tsyringe_1.container.register(types_1.TYPES.RefreshTokenRepository, { useClass: refresh_token_repository_1.RefreshTokenRepository });
        tsyringe_1.container.register(types_1.TYPES.ServiceRepository, { useClass: service_repository_1.ServiceRepository });
        tsyringe_1.container.register(types_1.TYPES.WorkingDetailsRepository, { useClass: working_details_repository_1.WorkingDetailsRepository });
        tsyringe_1.container.register(types_1.TYPES.WorkerAggregation, { useClass: worker_aggregation_repository_1.WorkerAggregation });
        tsyringe_1.container.register(types_1.TYPES.BookingRepository, { useClass: booking_details_repository_1.BookingRepository });
        tsyringe_1.container.register(types_1.TYPES.WalletRepository, { useClass: wallet_respository_1.WalletRepository });
        tsyringe_1.container.register(types_1.TYPES.TransactionRepository, { useClass: transaction_repository_1.TransactionRepository });
        tsyringe_1.container.register(types_1.TYPES.ChatRepository, { useClass: chat_repoository_1.ChatRepository });
        tsyringe_1.container.register(types_1.TYPES.MessageRepository, { useClass: message_repository_1.MessageRepository });
        tsyringe_1.container.register(types_1.TYPES.NotificationRepository, { useClass: notification_repository_1.NotificationRepository });
        tsyringe_1.container.register(types_1.TYPES.ReviewRepository, { useClass: review_repository_1.ReviewRepository });
    }
}
exports.RepositoryRegistery = RepositoryRegistery;
