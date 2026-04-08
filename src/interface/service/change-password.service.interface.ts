import { ChangePasswordDTO } from '../../controller/validation/change-password.zod';
import { responsePart } from '../../dto/shared/responsePart';

export interface IChangePasswordService{
    changePassword(role: 'worker' | 'user', userId: string, dto: ChangePasswordDTO): Promise<responsePart>
}
