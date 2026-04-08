import Stripe from 'stripe';

import { createPaymentIntentResponse } from '../../dto/shared/helpers.dto';
import { PaymentStatus } from '../model/wallet.model.interface';

export interface CreatePaymentIntenServicetInput {
  amount: number;
  currency: string;
  description: string;
  receiptEmail: string;
  metadata : {
    bookingId : string;
    addressId : string;
    paymentType : string;
  }
}
export interface IStripeService {
    createPaymentIntent(input : CreatePaymentIntenServicetInput): Promise<createPaymentIntentResponse>
    updatePaymentStatus(paymentIntentId: string, status: PaymentStatus) : Promise<void>
    handleWebhookEvent(event : Stripe.Event) : Promise<void>
}
