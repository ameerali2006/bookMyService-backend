import { IIsVerifiedResponseDTO } from '../../../dto/auth.dto';

export interface IIsVerified {
    execute(email:string):Promise<IIsVerifiedResponseDTO>
}
