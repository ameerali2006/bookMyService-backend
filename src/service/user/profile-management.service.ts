import { inject, injectable } from 'tsyringe';
import { userInfo } from 'node:os';
import { fa } from 'zod/v4/locales';
import { AddAddressDto, Address, ProfileDetails } from '../../dto/user/auth/profile.dto';
import { IProfileManagement } from '../../interface/service/user/profile-management.serice.interface';
import { updateUserProfileDetailsResponseDto, getUserAddressResponseDto, addUserAddressResponseDto } from '../../dto/user/booking-details.dto';
import { responsePart } from '../../dto/shared/responsePart';
import { UserMapper } from '../../utils/mapper/user-mapper';
import { TYPES } from '../../config/constants/types';
import { IUserRepository } from '../../interface/repository/user.repository.interface';
import { IAddressRepository } from '../../interface/repository/address.repository.interface';
import { IAddress } from '../../interface/model/address.model.interface';

@injectable()
export class ProfileManagement implements IProfileManagement {
  constructor(
        @inject(TYPES.AuthUserRepository) private _userRepo:IUserRepository,
        @inject(TYPES.AddressRepository) private _addressRepo:IAddressRepository,
  ) {}

  async getUserProfileDetails(userId: string): Promise<updateUserProfileDetailsResponseDto> {
    try {
      console.log('user service');
      console.log(userId);
      if (!userId) {
        return {
          success: false,
          message: 'user is Not fount',
          user: null,
        };
      }
      console.log('get Profile Details', userId);
      const userData = await this._userRepo.findById(userId);
      if (!userData) {
        return {
          success: false,
          message: 'User is Not fount',
          user: null,
        };
      }
      const user = UserMapper.responseuserProfileDetails(userData);
      console.log('user service', user);
      return {
        success: true,
        message: 'user data fetch successfully',
        user,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Bad request',
        user: null,
      };
    }
  }

  async updateUserProfileDetails(
    user: Partial<ProfileDetails>,
    userId: string,
  ): Promise<updateUserProfileDetailsResponseDto> {
    try {
      if (!user || Object.keys(user).length === 0) {
        return { success: false, message: 'User data is missing', user: null };
      }

      if (!userId) {
        return { success: false, message: 'User ID is missing', user: null };
      }

      const userData = await this._userRepo.updateById(userId, user);

      if (!userData) {
        return { success: false, message: 'User not found', user: null };
      }

      const updatedUser = UserMapper.responseuserProfileDetails(userData);

      return {
        success: true,
        message: 'User updated successfully',
        user: updatedUser,
      };
    } catch (error: any) {
      console.error('Error updating user:', error.message || error);
      return { success: false, message: 'Internal server error', user: null };
    }
  }

  async getUserAddress(userId: string): Promise<getUserAddressResponseDto> {
    try {
      if (!userId) {
        return { success: false, message: 'User ID is missing', addresses: null };
      }
      const address = await this._addressRepo.findByUserId(userId);
      console.log(address);
      if (!address || address.length === 0) {
        return { success: false, message: 'No addresses found', addresses: null };
      }
      const addresses = UserMapper.toDTOAddressList(address);
      return {
        success: true,
        message: 'Addresses retrieved successfully',
        addresses,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Internal server error',
        addresses: null,
      };
    }
  }

  async addUserAddress(userId: string, data: AddAddressDto): Promise<addUserAddressResponseDto> {
    try {
      if (!userId || !data) {
        return { success: false, message: 'somthing is missing', address: null };
      }
      const userAddress = await this._addressRepo.findByUserId(userId);
      const isPrimary = userAddress.length == 0;
      const location = data.latitude && data.longitude ? {
        type: 'Point' as const,
        coordinates: [Number(data.longitude), Number(data.latitude)] as [number, number],
      } : undefined;
      const newAddress:Partial<IAddress> = {
        userId,
        label: data.label,
        buildingName: data.buildingName,
        street: data.street,
        area: data.area,
        city: data.city,
        state: data.state,
        country: data.country,
        pinCode: data.pinCode,
        landmark: data.landmark ?? '',
        phone: data.phone,
        location,
        isPrimary,
      };
      const savedAddress = await this._addressRepo.create(newAddress);
      const address = UserMapper.toDTOAddress(savedAddress);

      return {
        success: true,
        message: 'Address added successfully',
        address,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Internal server error',
        address: null,
      };
    }
  }

  async setPrimaryAddress(userId: string, setId: string): Promise<responsePart> {
    try {
      if (!userId || !setId) {
        return { success: false, message: 'Something is missing' };
      }

      const existingPrimary = await this._addressRepo.findPrimaryByUserId(userId);
      console.log('existing dataaaaa', existingPrimary);
      if (existingPrimary) {
        // Unset the old primary first
        await this._addressRepo.updateById(existingPrimary._id as string, { isPrimary: false });
      }
      console.log('existing dataaaaa', existingPrimary);
      // Now set the new primary
      await this._addressRepo.updateById(setId, { isPrimary: true });

      return { success: true, message: 'Successfully updated' };
    } catch (error) {
      return {
        success: false,
        message: 'Internal server error',

      };
    }
  }
}
