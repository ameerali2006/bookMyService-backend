import { OtpVerifyDto } from '../../../dto/shared/otp.dto';
import { IOtp } from '../../model/otp.model.interface';

export interface IOtpService{
    generate(email: string): Promise<IOtp>;
    verify(otpData:OtpVerifyDto): Promise<void>;
}
