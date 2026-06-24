import { MESSAGES } from '../../config/constants/message';
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
          message: MESSAGES.USER_IS_NOT_FOUNT,
          user: null,
        };
      }
      console.log('get Profile Details', userId);
      const userData = await this._userRepo.findById(userId);
      if (!userData) {
        return {
          success: false,
          message: MESSAGES.USER_IS_NOT_FOUNT,
          user: null,
        };
      }
      const user = UserMapper.responseuserProfileDetails(userData);
      console.log('user service', user);
      return {
        success: true,
        message: MESSAGES.USER_DATA_FETCH_SUCCESSFULLY,
        user,
      };
    } catch (error) {
      return {
        success: false,
        message: MESSAGES.BAD_REQUEST,
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
        return { success: false, message: MESSAGES.USER_DATA_IS_MISSING, user: null };
      }

      if (!userId) {
        return { success: false, message: MESSAGES.USER_ID_IS_MISSING, user: null };
      }

      const userData = await this._userRepo.updateById(userId, user);

      if (!userData) {
        return { success: false, message: MESSAGES.USER_NOT_FOUND, user: null };
      }

      const updatedUser = UserMapper.responseuserProfileDetails(userData);

      return {
        success: true,
        message: MESSAGES.USER_UPDATED_SUCCESSFULLY,
        user: updatedUser,
      };
    } catch (error) {
      console.error('Error updating user:', error instanceof Error ? error.message : error);
      return { success: false, message: MESSAGES.INTERNAL_SERVER_ERROR, user: null };
    }
  }

  async getUserAddress(userId: string): Promise<getUserAddressResponseDto> {
    try {
      if (!userId) {
        return { success: false, message: MESSAGES.USER_ID_IS_MISSING, addresses: null };
      }
      const address = await this._addressRepo.findByUserId(userId);
      console.log(address);
      if (!address || address.length === 0) {
        return { success: false, message: MESSAGES.NO_ADDRESSES_FOUND, addresses: null };
      }
      const addresses = UserMapper.toDTOAddressList(address);
      return {
        success: true,
        message: MESSAGES.ADDRESSES_RETRIEVED_SUCCESSFULLY,
        addresses,
      };
    } catch (error) {
      return {
        success: false,
        message: MESSAGES.INTERNAL_SERVER_ERROR,
        addresses: null,
      };
    }
  }

  async addUserAddress(userId: string, data: AddAddressDto): Promise<addUserAddressResponseDto> {
    try {
      if (!userId || !data) {
        return { success: false, message: MESSAGES.SOMTHING_IS_MISSING, address: null };
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
        message: MESSAGES.ADDRESS_ADDED_SUCCESSFULLY,
        address,
      };
    } catch (error) {
      return {
        success: false,
        message: MESSAGES.INTERNAL_SERVER_ERROR,
        address: null,
      };
    }
  }

  async setPrimaryAddress(userId: string, setId: string): Promise<responsePart> {
    try {
      if (!userId || !setId) {
        return { success: false, message: MESSAGES.SOMETHING_IS_MISSING };
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

      return { success: true, message: MESSAGES.SUCCESSFULLY_UPDATED };
    } catch (error) {
      return {
        success: false,
        message: MESSAGES.INTERNAL_SERVER_ERROR,

      };
    }
  }
}
