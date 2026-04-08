import { Document, Types } from 'mongoose';

export interface IUser extends Document{
    _id:Types.ObjectId;
    name:string;
    email:string;
    password:string;
    phone:string;
    image:string;
    googleId:string;
    address:Types.ObjectId[];
    isBlocked:boolean;
    createdAt: Date;

}
