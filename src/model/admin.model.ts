import mongoose, { Document, Schema } from 'mongoose';
import { IAdmin } from '../interface/model/admin.model.interface';

const AdminSchema = new Schema<IAdmin>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: 'admin' },
);

const AdminModel = mongoose.model<IAdmin>('Admin', AdminSchema);
export default AdminModel;
