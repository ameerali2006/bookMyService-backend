import { Document } from 'mongoose';

export interface IAddress extends Document {
  _id:string
  label?: string;
  userId?:string
  street?: string;
  buildingName?:string;
  area: string;
  city: string;
  state: string;
  country: string;
  pinCode: string;
  landmark?: string;
  formattedAddress?: string;
  phone:string;
  isPrimary?: boolean;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };

  createdAt: Date;
  updatedAt: Date;
}
