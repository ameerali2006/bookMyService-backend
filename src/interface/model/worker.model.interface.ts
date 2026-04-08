import { Document, Types } from 'mongoose';
import { IService } from './service.model.interface';

export interface IWorker extends Document{
  _id: Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  password: string;
  profileImage?: string;
  googleId?: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  }
  zone: string;
  experience: '0-1' | '2-5' | '6-10' | '10+';
  category: Types.ObjectId
  description?:string,
  skills?:string[]
  fees: number;
  isBlocked: boolean;
  isActive: boolean;
  isVerified: 'pending'|'approved'| 'rejected';
  documents?: string;
  createdAt: Date;
  updatedAt: Date;
}
