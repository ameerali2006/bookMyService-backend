export interface OtpVerifyDto{
    otp:string,
    email:string,
    role:'user'|'worker'

}
