import { AdminDataDTO } from '../../../dto/admin/admin.dto';
import { UserRegisterDTO } from '../../../dto/user/auth/user-register.dto';
import { UserDataDTO } from '../../../dto/user/auth/user-data.dto';
import { responseDto, WorkerRegisterDTO } from '../../../dto/worker/auth/worker-register.dto';
import { RegisterResponseDTO } from '../../../dto/auth.dto';

export interface IRegisterService{
    execute(user:WorkerRegisterDTO|UserRegisterDTO):Promise<RegisterResponseDTO>
}
