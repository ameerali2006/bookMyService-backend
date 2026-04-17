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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeController = void 0;
const tsyringe_1 = require("tsyringe");
const stripe_1 = __importDefault(require("stripe"));
const status_code_1 = require("../config/constants/status-code");
const message_1 = require("../config/constants/message");
const env_1 = require("../config/env/env");
const types_1 = require("../config/constants/types");
let StripeController = class StripeController {
    constructor(stripeService) {
        this.stripeService = stripeService;
        this.stripe = new stripe_1.default(env_1.ENV.STRIPE_SECRET_KEY, {
            apiVersion: '2025-09-30.clover',
        });
    }
    createPaymentIntent(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { amount, currency, description, receiptEmail, metadata, } = req.body;
            try {
                const { success, message, paymentIntent } = yield this.stripeService.createPaymentIntent({
                    amount,
                    currency,
                    description,
                    receiptEmail,
                    metadata,
                });
                // Add this log
                console.log('Payment Intent created:', {
                    id: paymentIntent === null || paymentIntent === void 0 ? void 0 : paymentIntent.id,
                    status: paymentIntent === null || paymentIntent === void 0 ? void 0 : paymentIntent.status,
                    amount: paymentIntent === null || paymentIntent === void 0 ? void 0 : paymentIntent.amount,
                });
                if (paymentIntent) {
                    res.status(status_code_1.STATUS_CODES.OK).json({ success, message, clientSecret: paymentIntent.client_secret });
                }
                else {
                    res.status(status_code_1.STATUS_CODES.BAD_REQUEST).json({ success, message, clientSecret: null });
                }
            }
            catch (err) {
                res.status(status_code_1.STATUS_CODES.INTERNAL_SERVER_ERROR).json({ success: false, message: message_1.MESSAGES.SERVER_ERROR, clientSecret: null });
            }
        });
    }
    handleWebhook(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('------------------------webhook triggered--------------------');
                const sig = req.headers['stripe-signature'];
                if (!sig) {
                    console.error('❌ Missing Stripe signature header');
                    res.status(status_code_1.STATUS_CODES.BAD_REQUEST).send('Missing stripe-signature header');
                    return;
                }
                const event = this.stripe.webhooks.constructEvent(req.body, sig, process.env.WEBHOOK_SECRET_KEY);
                console.log('Received event type:', event);
                console.log(`${event.data}fffffffffff${event.type}`);
                if (event.type === 'payment_intent.succeeded') {
                    yield this.stripeService.handleWebhookEvent(event);
                }
                res.status(status_code_1.STATUS_CODES.OK).json({ received: true });
            }
            catch (err) {
                console.error('⚠️ Webhook Error:', err.message);
                res.status(status_code_1.STATUS_CODES.BAD_REQUEST).json({ received: false, error: err.message });
            }
        });
    }
};
exports.StripeController = StripeController;
exports.StripeController = StripeController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(types_1.TYPES.StripeService)),
    __metadata("design:paramtypes", [Object])
], StripeController);
