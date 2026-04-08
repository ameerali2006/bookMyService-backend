import { GoogleLoginResponseDTO } from '../../../dto/worker/auth/worker-register.dto';

export interface IGoogleService{
    execute(token:string, role:'user'|'worker'):Promise<GoogleLoginResponseDTO>
}
