import { ObjectId, Document, HydratedDocument } from 'mongoose';

export interface IRefreshTokenDocument extends Document {
  token: string;
  user: ObjectId;
  userType: 'admin' | 'user' | 'worker';
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// export type RefreshTokenDocument = HydratedDocument<IRefreshTokenEntity>;
// export interface IRefreshTokenModel
//   extends Omit<IRefreshTokenEntity, "id" | "user">,
//     Document {
//   _id: ObjectId;
//   user: ObjectId;
// }
