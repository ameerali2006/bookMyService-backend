export interface IResetPassword{
    forgotPassword(email:string, role:'worker'|'user'): Promise<{success:boolean, message:string}>;
    resetPassword(token:string, password:string, role:'worker'|'user'):Promise<void>

}
