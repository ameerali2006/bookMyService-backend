export interface IServiceRejectedPayload {
  email: string;
  userName: string;
  serviceName: string;
  reason?: string;
  refundAmount?: number;
}
export interface IEmailService {
	sendEmail(toEmail: string, subject: string, content: string): Promise<void>;
	generateOtpEmailContent(otp: string): string;
	sendResetEmail(
		to: string,
		subject: string,
		resetLink: string
	): Promise<void>
	sendServiceRejectedEmail(payload: IServiceRejectedPayload): Promise<void>;

}
