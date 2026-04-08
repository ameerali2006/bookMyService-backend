export interface ProfileDetails{
    name:string,
    email:string,
    phone:string,
    image?:string
}
export interface Address{
    _id:string
    label?: string;
    street?: string;
    buildingName?:string;
    area: string;
    city: string;
    state: string;
    country: string;
    pinCode: string;
    landmark?: string;
    phone:string;
    isPrimary?: boolean;

}
export interface AddAddressDto extends Omit<Address, '_id'>{
    latitude?:number;
    longitude?:number;
}
