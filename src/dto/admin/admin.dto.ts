export interface AdminDataDTO {
  _id: string;
  name: string;
  email: string;
  image?: string;
}
export interface adminloginResponse {
  accessToken: string;
  refreshToken: string;
  admin: { name: string; email: string };
}
