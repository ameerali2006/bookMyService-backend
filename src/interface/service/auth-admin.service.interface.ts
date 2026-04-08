import { adminloginResponse } from '../../dto/admin/admin.dto';
import { LoginDto } from '../../dto/shared/login.dto';
import { IUser } from '../../interface/model/user.model.interface';

export interface IAuthAdminService {
  login(
    userCredential: LoginDto
  ): Promise<adminloginResponse>;

}
