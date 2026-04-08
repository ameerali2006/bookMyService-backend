export interface LoginDto{
    email:string,
    password:string
    role:'admin'|'worker'|'user'
}
export interface requestGoogleAuth{
    token:string, role:'user'|'worker'
}
