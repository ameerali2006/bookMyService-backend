import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import Stripe from 'stripe';
import { IStripeService } from '../interface/service/stripe.service.interface';
import { IStripeController } from '../interface/controller/stripe.controller.interface';
import { STATUS_CODES } from '../config/constants/status-code';
import { MESSAGES } from '../config/constants/message';
import { ENV } from '../config/env/env';
import { TYPES } from '../config/constants/types';

@injectable()
export class StripeController implements IStripeController {
  public stripe:Stripe;

  constructor(

    @inject(TYPES.StripeService) private stripeService: IStripeService,
  ) {
    this.stripe = new Stripe(
      ENV.STRIPE_SECRET_KEY,
      {
        apiVersion: '2025-09-30.clover',
      },
    );
  }

  async createPaymentIntent(req: Request, res: Response, next: NextFunction) {
    const {
      amount, currency, description, receiptEmail, metadata,
    } = req.body;

    try {
      const { success, message, paymentIntent } = await this.stripeService.createPaymentIntent({
        amount,
        currency,
        description,
        receiptEmail,
        metadata,
      });

      // Add this log
      console.log('Payment Intent created:', {
        id: paymentIntent?.id,
        status: paymentIntent?.status,
        amount: paymentIntent?.amount,
      });

      if (paymentIntent) {
        res.status(STATUS_CODES.OK).json({ success, message, clientSecret: paymentIntent.client_secret });
      } else {
        res.status(STATUS_CODES.BAD_REQUEST).json({ success, message, clientSecret: null });
      }
    } catch (err) {
      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ success: false, message: MESSAGES.SERVER_ERROR, clientSecret: null });
    }
  }

  async handleWebhook(req: Request, res: Response, next: NextFunction):Promise<void> {
    try {
      console.log('------------------------webhook triggered--------------------');

      const sig = req.headers['stripe-signature'] as string;
      if (!sig) {
        console.error('❌ Missing Stripe signature header');
        res.status(STATUS_CODES.BAD_REQUEST).send('Missing stripe-signature header');
        return;
      }

      const event = this.stripe.webhooks.constructEvent(
        req.body,
        sig,
       process.env.WEBHOOK_SECRET_KEY!,
      );

      console.log('Received event type:', event);
      console.log(`${event.data}fffffffffff${event.type}`);

      if (event.type === 'payment_intent.succeeded') {
        await this.stripeService.handleWebhookEvent(event);
      }

      res.status(STATUS_CODES.OK).json({ received: true });
    } catch (err: any) {
      console.error('⚠️ Webhook Error:', err.message);
      res.status(STATUS_CODES.BAD_REQUEST).json({ received: false, error: err.message });
    }
  }
}
