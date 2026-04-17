"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeService = void 0;
const tsyringe_1 = require("tsyringe");
const stripe_1 = require("stripe");
const env_1 = require("../../config/env/env");
const types_1 = require("../../config/constants/types");
const socketServer_1 = require("../../config/socketServer");
const resolver_1 = require("../../config/di/resolver");
let StripeService = class StripeService {
    constructor(_bookingRepository, _walletService) {
        this._bookingRepository = _bookingRepository;
        this._walletService = _walletService;
        this._apiKey = env_1.ENV.STRIPE_SECRET_KEY;
        this._stripe = new stripe_1.Stripe(this._apiKey, {
            apiVersion: '2025-09-30.clover',
        });
    }
    createPaymentIntent(input) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { amount, currency, description, receiptEmail, metadata, } = input;
                console.log(input);
                const paymentIntent = yield this._stripe.paymentIntents.create({
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
            }
            catch (error) {
                console.error(error);
                return {
                    success: false,
                    message: 'internal error',
                    paymentIntent: null,
                };
            }
        });
    }
    updatePaymentStatus(paymentIntentId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            const paymentIntent = yield this._stripe.paymentIntents.retrieve(paymentIntentId);
            console.log(paymentIntent);
            console.log('object');
            const { bookingId, addressId, paymentType } = paymentIntent.metadata || {};
            if (!bookingId || !paymentType) {
                console.warn(' Missing bookingId or paymentType in metadata');
                return;
            }
            console.log(`🧾 Updating ${paymentType} payment for booking ${bookingId} → ${status}`);
            if (paymentType === 'advance') {
                console.log('advance update');
                yield this._bookingRepository.updateAdvancePaymentStatus(bookingId, paymentIntentId, status, addressId);
            }
            else if (paymentType === 'final') {
                yield this._bookingRepository.updateFinalPaymentStatus(bookingId, paymentIntentId, status);
            }
            if (status === 'succeeded') {
                console.log('sambavam entho indddu');
                const wall = yield this._walletService.creditAdminWallet(paymentIntent.amount / 100, paymentIntentId.toString());
                console.log(wall);
            }
        });
    }
    handleWebhookEvent(event) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('working', event);
            switch (event.type) {
                case 'payment_intent.succeeded': {
                    const successfulPayment = event.data.object;
                    const { bookingId, paymentType } = successfulPayment.metadata;
                    console.log(`✅ Stripe: ${paymentType} payment succeeded for booking ${bookingId}`);
                    const updatebooking = yield this.updatePaymentStatus(successfulPayment.id, 'succeeded');
                    console.log(updatebooking);
                    if (paymentType === 'advance') {
                        const booking = yield this._bookingRepository.findByIdPopulated(bookingId);
                        console.log(`booking${booking}`);
                        if (booking && booking.workerId) {
                            console.log(`📢 Emitting booking to worker: ${booking.workerId}`);
                            yield resolver_1.bookingSocketHandler.emitBookingToWorker(socketServer_1.io, socketServer_1.onlineUsers, booking.workerId, booking);
                        }
                        else {
                            console.log(`⚠️ Booking not found or worker missing for ${bookingId}`);
                        }
                    }
                    break;
                }
                case 'payment_intent.payment_failed': {
                    const failedPayment = event.data.object;
                    yield this.updatePaymentStatus(failedPayment.id, 'failed');
                    break;
                }
                case 'payment_intent.created': {
                    const createdPayment = event.data.object;
                    yield this.updatePaymentStatus(createdPayment.id, 'pending');
                    break;
                }
                case 'payment_intent.processing': {
                    const processingPayment = event.data.object;
                    yield this.updatePaymentStatus(processingPayment.id, 'processing');
                    break;
                }
                case 'payment_intent.canceled': {
                    const canceledPayment = event.data.object;
                    yield this.updatePaymentStatus(canceledPayment.id, 'failed');
                    break;
                }
                case 'charge.refunded': {
                    const refundedCharge = event.data.object;
                    if (refundedCharge.amount_refunded < refundedCharge.amount) {
                        yield this.updatePaymentStatus(refundedCharge.payment_intent, 'partially_refunded');
                    }
                    else {
                        yield this.updatePaymentStatus(refundedCharge.payment_intent, 'refunded');
                    }
                    break;
                }
            }
        });
    }
};
exports.StripeService = StripeService;
exports.StripeService = StripeService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(types_1.TYPES.BookingRepository)),
    __param(1, (0, tsyringe_1.inject)(types_1.TYPES.WalletService)),
    __metadata("design:paramtypes", [Object, Object])
], StripeService);
