import { container } from 'tsyringe';

import { DependencyInjection } from './index';

import { AuthUserController } from '../../controller/user/auth-user';
import { IAuthController } from '../../interface/controller/auth-user.controller.interface';

import { AuthAdminController } from '../../controller/admin/auth-admin';
import { IAdminController } from '../../interface/controller/auth-admin.controller.interface';

import { IWorkerAuthController } from '../../interface/controller/auth-worker.controller.interface';
import { AuthWorkerController } from '../../controller/worker/auth-worker';
import { CloudinaryController } from '../../controller/worker/helper-worker.controller';
import { ICloudinaryController } from '../../interface/controller/helper-worker.controller.interface';
import { IAdminManagementController } from '../../interface/controller/management-admin.controller.interface';
import { ManagementAdmin } from '../../controller/admin/management-admin';
import { IServiceConroller } from '../../interface/controller/services.controller.interface';
import { ServiceController } from '../../controller/services.controller';
import { ITokenController } from '../../interface/controller/token.controller.interface';
import { TokenController } from '../../controller/token.controller';
import { BlockStatusMiddleware } from '../../middleware/block-status.middleware';
import { IWorkingDetailsController } from '../../interface/controller/working-details.controller.interface';
import { WorkingDetailsController } from '../../controller/worker/working-details.controller';
import { IUserController } from '../../interface/controller/user-controller.controller.interface';
import { UserController } from '../../controller/user/user-controller';
import { IBookingController } from '../../interface/controller/booking-controller.controller.interface';
import { BookingController } from '../../controller/booking.controller';
import { IStripeController } from '../../interface/controller/stripe.controller.interface';
import { StripeController } from '../../controller/stripe.controller';
import { IWorkerBookingController } from '../../interface/controller/worker-booking.controller.interface';
import { WorkerBookingController } from '../../controller/worker/worker-booking.controller';
import { TYPES } from '../constants/types';
import { ISocketHandler } from '../../interface/service/socket-handler.service.interface';
import { BookingSocketHandler } from '../../service/helper/booking-socket.service';
import { ChatSocketHandler } from '../../service/helper/chat-socket.service';
import { IChatController } from '../../interface/controller/chat.controller.interface';
import { ChatController } from '../../controller/chat.controller';
import { IWorkerController } from '../../interface/controller/worker-controller.controller.interface';
import { WorkerController } from '../../controller/worker/worker-controller.controller';
import { IReviewController } from '../../interface/controller/review.controller.interface';
import { ReviewController } from '../../controller/review.controller';
import { io, onlineUsers } from '../socketServer';
import { NotificationController } from '../../controller/notification.controller';
import { INotificationController } from '../../interface/controller/notification.controller.interface';

DependencyInjection.registerAll();

export const blockStatusMiddleware = container.resolve(BlockStatusMiddleware);
export const bookingSocket = container.resolve<ISocketHandler>(TYPES.BookingSocketHandler);

export const authController = container.resolve<IAuthController>(AuthUserController);
export const authAdminController = container.resolve<IAdminController>(AuthAdminController);
export const authWorkerController = container.resolve<IWorkerAuthController>(AuthWorkerController);
export const cloudinaryController = container.resolve<ICloudinaryController>(CloudinaryController);
export const managementAdminController = container.resolve<IAdminManagementController>(ManagementAdmin);
export const serviceController = container.resolve<IServiceConroller>(ServiceController);
export const tokenController = container.resolve<ITokenController>(TokenController);
export const workingDetailsController = container.resolve<IWorkingDetailsController>(WorkingDetailsController);
export const userController = container.resolve<IUserController>(UserController);
export const bookingController = container.resolve<IBookingController>(BookingController);
export const stripeController = container.resolve<IStripeController>(StripeController);
export const workerbookingController = container.resolve<IWorkerBookingController>(WorkerBookingController);
export const bookingSocketHandler = container.resolve(BookingSocketHandler);
export const chatSocketHandler = container.resolve(ChatSocketHandler);
export const notificationController = container.resolve<INotificationController>(NotificationController);
export const chatController = container.resolve<IChatController>(ChatController);
export const workerController = container.resolve<IWorkerController>(WorkerController);
export const reviewController = container.resolve<IReviewController>(ReviewController);
