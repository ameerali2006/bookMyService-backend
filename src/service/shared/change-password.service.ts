import { inject, injectable } from 'tsyringe';
import { IWorkerRepository } from '../../interface/repository/worker.repository.interface';
import { IUserRepository } from '../../interface/repository/user.repository.interface';
import { TYPES } from '../../config/constants/types';
import { ChangePasswordDTO } from '../../controller/validation/change-password.zod';
import { CustomError } from '../../utils/custom-error';
import { MESSAGES } from '../../config/constants/message';
import { STATUS_CODES } from '../../config/constants/status-code';
import { IHashService } from '../../interface/helpers/hash.interface';
import { IChangePasswordService } from '../../interface/service/change-password.service.interface';
import { responsePart } from '../../dto/shared/responsePart';

@injectable()
export class ChangePasswordService implements IChangePasswordService {
  constructor(
    @inject(TYPES.PasswordService) private hash:IHashService,
    @inject(TYPES.WorkerRepository) private workerRepo: IWorkerRepository,
    @inject(TYPES.AuthUserRepository) private userRepo: IUserRepository,
  ) {}

  async changePassword(role: 'worker' | 'user', userId: string, dto: ChangePasswordDTO): Promise<responsePart> {
    const repo = role === 'worker' ? this.workerRepo : this.userRepo;
    const user = await repo.findById(userId);

    if (!user) throw new CustomError(MESSAGES.USER_NOT_FOUND, STATUS_CODES.NOT_FOUND);

    const isMatch = await this.hash.compare(dto.oldPassword, user.password);
    if (!isMatch) { return { success: false, message: 'Old password is incorrect' }; }

    const hashedPassword = await this.hash.hash(dto.newPassword);
    user.password = hashedPassword;

    await repo.updateById(user._id.toString(), { password: hashedPassword });
    return { success: true, message: 'Password changed successfully' };
  }
}
