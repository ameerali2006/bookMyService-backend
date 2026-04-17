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
exports.EmailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const chalk_1 = __importDefault(require("chalk"));
const tsyringe_1 = require("tsyringe");
const email_1 = require("../../config/constants/email");
const env_1 = require("../../config/env/env");
let EmailService = class EmailService {
    constructor() {
        this.transporter = nodemailer_1.default.createTransport({
            service: 'gmail',
            auth: {
                user: env_1.ENV.EMAIL_USER,
                pass: env_1.ENV.EMAIL_PASS,
            },
            tls: { rejectUnauthorized: false },
        });
        // verify transporter at startup
        this.transporter.verify((error) => {
            if (error) {
                console.error(chalk_1.default.redBright('❌ Email transporter verification failed:'), error);
            }
            else {
                console.log(chalk_1.default.greenBright('✅ Email transporter ready to send emails.'));
            }
        });
    }
    sendServiceRejectedEmail(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, userName, serviceName, reason, refundAmount, } = payload;
            const subject = `Service Rejected — ${serviceName} — bookMyService`;
            const html = (0, email_1.SERVICE_REJECTED_MAIL_CONTENT)(userName, serviceName, reason, refundAmount);
            yield this.sendEmail(email, subject, html);
            // optional logs for audit / debugging
            console.log(`📨 Service rejection email sent to ${email} for service ${serviceName}. Refund: ${typeof refundAmount === 'number' ? refundAmount : 'N/A'}`);
        });
    }
    sendEmail(to, subject, html) {
        return __awaiter(this, void 0, void 0, function* () {
            const mailOptions = {
                from: `"bookMyService" <${env_1.ENV.EMAIL_USER}>`,
                to,
                subject,
                html,
            };
            yield this._sendMail(mailOptions);
        });
    }
    /** OTP email generator (interface-required) */
    generateOtpEmailContent(otp) {
        return (0, email_1.VERIFICATION_MAIL_CONTENT)(otp);
    }
    sendOtpEmail(to, subject, otp) {
        return __awaiter(this, void 0, void 0, function* () {
            const html = this.generateOtpEmailContent(otp);
            yield this.sendEmail(to, subject, html);
        });
    }
    sendResetEmail(to, subject, resetLink) {
        return __awaiter(this, void 0, void 0, function* () {
            const html = (0, email_1.PASSWORD_RESET_MAIL_CONTENT)(resetLink);
            yield this.sendEmail(to, subject, html);
            console.log(chalk_1.default.bgYellowBright.bold('🔁 Reset Password Link:'), chalk_1.default.cyanBright.bold(resetLink));
        });
    }
    sendRejectionEmail(to, reason, retryUrl, entityLabel) {
        return __awaiter(this, void 0, void 0, function* () {
            const subject = `${entityLabel} Application Rejected - bookMyService`;
            const html = (0, email_1.SENT_REJECTION_EMAIL)(entityLabel, reason, retryUrl);
            yield this.sendEmail(to, subject, html);
            console.log(chalk_1.default.bgRedBright.bold('❌ Rejection Email Sent:'), chalk_1.default.yellowBright(`${entityLabel} - ${to}`));
        });
    }
    sendGoogleRegistrationEmail(to, fullName, tempPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            const subject = 'Welcome to bookMyService 🎉';
            const html = (0, email_1.GOOGLE_REGISTRATION_MAIL_CONTENT)(fullName, tempPassword);
            yield this.sendEmail(to, subject, html);
        });
    }
    /** private helper */
    _sendMail(mailOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            const info = yield this.transporter.sendMail(mailOptions);
            console.log(chalk_1.default.bgGreenBright.bold('📧 Email sent:'), info.response);
        });
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], EmailService);
