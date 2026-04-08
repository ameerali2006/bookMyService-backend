import { AdminDataDTO } from '../../../dto/admin/admin.dto';
import { ILoginResponseDto } from '../../../dto/auth.dto';
import { LoginDto } from '../../../dto/shared/login.dto';
import { UserDataDTO } from '../../../dto/user/auth/user-data.dto';
import { responseDto } from '../../../dto/worker/auth/worker-register.dto';
import { IAdmin } from '../../model/admin.model.interface';
import { IUser } from '../../model/user.model.interface';
import { IWorker } from '../../model/worker.model.interface';

export interface ILoginService{
    execute(user:LoginDto):Promise<ILoginResponseDto>
}
