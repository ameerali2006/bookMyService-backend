import { injectable } from 'inversify';
import { IUserRepository } from '../../interface/repository/user.repository.interface';
import { UserModel } from '../../model/user.model';
import { BaseRepository } from '../../repository/shared/base.repository';
import { IUser } from '../../interface/model/user.model.interface';

@injectable()
export class UserRepository
  extends BaseRepository<IUser>
  implements IUserRepository {
  constructor() {
    super(UserModel);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return await UserModel.findOne({ email });
  }
}
