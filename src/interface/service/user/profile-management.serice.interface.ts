import { responsePart } from '../../../dto/shared/responsePart';
import { AddAddressDto, Address, ProfileDetails } from '../../../dto/user/auth/profile.dto';
import { addUserAddressResponseDto, getUserAddressResponseDto, updateUserProfileDetailsResponseDto } from '../../../dto/user/booking-details.dto';
import { IAddress } from '../../model/address.model.interface';

export interface IProfileManagement{
    updateUserProfileDetails(user:Partial<ProfileDetails>, userId:string):Promise<updateUserProfileDetailsResponseDto>
    getUserProfileDetails(userId:string):Promise<updateUserProfileDetailsResponseDto>
    getUserAddress(userId:string):Promise<getUserAddressResponseDto>
    addUserAddress(userId:string, data:AddAddressDto):Promise<addUserAddressResponseDto>
    setPrimaryAddress(userId:string, setId:string):Promise<responsePart>
}
