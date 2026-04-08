import { inject, injectable } from 'tsyringe';
import { Stripe } from 'stripe';

import { IBookingRepository } from '../../interface/repository/booking.repository.interface';

import {
  CreatePaymentIntenServicetInput,
  IStripeService,
} from '../../interface/service/stripe.service.interface';
import { ENV } from '../../config/env/env';
import { TYPES } from '../../config/constants/types';
import { BookingSocketHandler } from './booking-socket.service';
import { io, onlineUsers } from '../../config/socketServer';
import { IWorker } from '../../interface/model/worker.model.interface';
import { IBookingPopulated } from '../../interface/model/booking.model.interface';
import { bookingSocketHandler } from '../../config/di/resolver';
import { IWalletService } from '../../interface/service/wallet.service.interface';
import { PaymentStatus } from '../../interface/model/wallet.model.interface';
import { INotificationService } from '../../interface/service/notification.service.interface';

@injectable()
export class StripeService implements IStripeService {
  private _stripe: Stripe;

  private _apiKey: string;

  constructor(
    @inject(TYPES.BookingRepository)
    private _bookingRepository: IBookingRepository,
    @inject(TYPES.WalletService)
    private _walletService:IWalletService,

  ) {
    this._apiKey = ENV.STRIPE_SECRET_KEY;
    this._stripe = new Stripe(this._apiKey, {
      apiVersion: '2025-09-30.clover',
    });
  }

  async createPaymentIntent(
    input: CreatePaymentIntenServicetInput,
  ): Promise<{
    success: boolean;
    message: string;
    paymentIntent: Stripe.PaymentIntent | null;
  }> {
    try {
      const {
        amount, currency, description, receiptEmail, metadata,
      } = input;
      console.log(input);
      const paymentIntent = await this._stripe.paymentIntents.create({
        amount,
        currency,
        automatic_payment_methods: {
          enabled: true,
        },
        description,
        receipt_email: receiptEmail,
        metadata,
      });
      console.log(paymentIntent);
      return {
        success: true,
        message: 'Successfully Payment created',
        paymentIntent,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: 'internal error',
        paymentIntent: null,
      };
    }
  }

  async updatePaymentStatus(
    paymentIntentId: string,
    status: PaymentStatus,
  ): Promise<void> {
    const paymentIntent = await this._stripe.paymentIntents.retrieve(paymentIntentId);
    console.log(paymentIntent);
    console.log('object');
    const { bookingId, addressId, paymentType } = paymentIntent.metadata || {};

    if (!bookingId || !paymentType) {
      console.warn(' Missing bookingId or paymentType in metadata');
      return;
    }

    console.log(
      `🧾 Updating ${paymentType} payment for booking ${bookingId} → ${status}`,
    );

    if (paymentType === 'advance') {
      console.log('advance update');
      await this._bookingRepository.updateAdvancePaymentStatus(
        bookingId,
        paymentIntentId,
        status,
        addressId,
      );
    } else if (paymentType === 'final') {
      await this._bookingRepository.updateFinalPaymentStatus(
        bookingId,
        paymentIntentId,
        status,
      );
    }
    if (status === 'succeeded') {
      console.log('sambavam entho indddu');
      const wall = await this._walletService.creditAdminWallet(paymentIntent.amount / 100, paymentIntentId.toString());
      console.log(wall);
    }
  }

  async handleWebhookEvent(event: Stripe.Event): Promise<void> {
    console.log('working', event);
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const successfulPayment = event.data.object as Stripe.PaymentIntent;
        const { bookingId, paymentType } = successfulPayment.metadata;

        console.log(`✅ Stripe: ${paymentType} payment succeeded for booking ${bookingId}`);

        const updatebooking = await this.updatePaymentStatus(successfulPayment.id!, 'succeeded');
        console.log(updatebooking);
        if (paymentType === 'advance') {
          const booking = await this._bookingRepository.findByIdPopulated(bookingId) as IBookingPopulated|null;
          console.log(`booking${booking}`);

          if (booking && booking.workerId) {
            console.log(`📢 Emitting booking to worker: ${booking.workerId}`);

            await bookingSocketHandler.emitBookingToWorker(io, onlineUsers, booking.workerId as IWorker, booking);
          } else {
            console.log(`⚠️ Booking not found or worker missing for ${bookingId}`);
          }
        }

        break;
      }
      case 'payment_intent.payment_failed': {
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        await this.updatePaymentStatus(failedPayment.id, 'failed');
        break;
      }
      case 'payment_intent.created': {
        const createdPayment = event.data.object as Stripe.PaymentIntent;
        await this.updatePaymentStatus(createdPayment.id, 'pending');
        break;
      }
      case 'payment_intent.processing': {
        const processingPayment = event.data.object as Stripe.PaymentIntent;
        await this.updatePaymentStatus(processingPayment.id, 'processing');
        break;
      }
      case 'payment_intent.canceled': {
        const canceledPayment = event.data.object as Stripe.PaymentIntent;
        await this.updatePaymentStatus(canceledPayment.id, 'failed');
        break;
      }
      case 'charge.refunded': {
        const refundedCharge = event.data.object as Stripe.Charge;
        if (refundedCharge.amount_refunded < refundedCharge.amount) {
          await this.updatePaymentStatus(
            refundedCharge.payment_intent as string,
            'partially_refunded',
          );
        } else {
          await this.updatePaymentStatus(
            refundedCharge.payment_intent as string,
            'refunded',
          );
        }
        break;
      }
    }
  }
}
