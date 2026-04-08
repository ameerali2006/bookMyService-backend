import { Types } from 'mongoose';

export interface WorkerRegisterDTO {
  name: string;
  email: string;
  phone: string;
  password?: string;

  category: Types.ObjectId;
  experience: '0-1' | '2-5' | '6-10' | '10+';

  zone: string;
  latitude: string;
  longitude: string;

  documents?: string;
  role:'worker'

}

export interface responseDto{
  _id:string
  name:string,
  email:string,
  image?:string
  location:{
    lat:number,
    lng:number,
    address?:string,
    pincode?:string
  }
}
export interface GoogleLoginResponseDTO {
  success: boolean;
  message: string;
  accessToken:string|null;
  refreshToken:string|null;
  user: {
    _id?: string;
    name: string;
    email: string;
    googleId: string;
    image: string | null;
  }|null;
  isNew: boolean;
}
export interface ServiceRequest {
  id: string;
  serviceName: string;
  userName: string;
  date: string;
  time: string;
  location: string;
  status: 'pending' | 'approved' | 'rejected';
  userLocation: { lat: number; lng: number };
  notes: string;
  phone: string;
}
