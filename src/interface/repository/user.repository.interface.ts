import { IUser } from '../../interface/model/user.model.interface';
import { IBaseRepository } from './base.repository.interface';

export interface IUserRepository extends IBaseRepository<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
//   updatePassword(email: string, hashedPassword: string): Promise<IUser | null>;
//   verifyEmailToken(token: string): Promise<IUser | null>;
//   // updateEmailVerifiedStatus(userId: string, verified: boolean): Promise<void>;
//   // updateLoginTimestamp(userId: string): Promise<void>;

//   // Profile
//   updateProfile(userId: string, profileData: Partial<IUser>): Promise<IUser | null>;
//   updateProfileImage(userId: string, imageUrl: string): Promise<IUser | null>;

//   // Status
//   updateBlockStatus(userId: string, isBlocked: boolean): Promise<void>;
//   getBlockedUsers(): Promise<IUser[]>;

//   // Query
// //   findByRole(role: string): Promise<IUser[]>;
// //   searchByName(keyword: string): Promise<IUser[]>;
// //   countByRole(role: string): Promise<number>;
//   findCount(): Promise<number>;
// //   getRecentUsers(limit: number): Promise<IUser[]>;
}
