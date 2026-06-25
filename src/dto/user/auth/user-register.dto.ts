import { Role } from '../../../config/constants/role';
export interface UserRegisterDTO {
  name: string;
  email: string;
  password?: string;
  phone?:string;
  googleId?:string;

}
export interface UserDataRegisterDto extends UserRegisterDTO{
  role:Role.USER
}
export interface userResponse{
  _id:string;
  name:string;
  email:string;
  image?:string;
}
