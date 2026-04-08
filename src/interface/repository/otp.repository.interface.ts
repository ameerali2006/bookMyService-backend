import { IOtp } from '../../interface/model/otp.model.interface';

import { IBaseRepository } from './base.repository.interface';

export interface IOtpRepository extends IBaseRepository<IOtp> {

  findOtp(email: string): Promise<IOtp |null >;
}
