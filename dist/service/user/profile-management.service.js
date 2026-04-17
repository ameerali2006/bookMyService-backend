"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileManagement = void 0;
const tsyringe_1 = require("tsyringe");
const user_mapper_1 = require("../../utils/mapper/user-mapper");
const types_1 = require("../../config/constants/types");
let ProfileManagement = class ProfileManagement {
    constructor(_userRepo, _addressRepo) {
        this._userRepo = _userRepo;
        this._addressRepo = _addressRepo;
    }
    getUserProfileDetails(userId) {
        return __awaiter(this, void 0, void 0, function* () {
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
                const userData = yield this._userRepo.findById(userId);
                if (!userData) {
                    return {
                        success: false,
                        message: 'User is Not fount',
                        user: null,
                    };
                }
                const user = user_mapper_1.UserMapper.responseuserProfileDetails(userData);
                console.log('user service', user);
                return {
                    success: true,
                    message: 'user data fetch successfully',
                    user,
                };
            }
            catch (error) {
                return {
                    success: false,
                    message: 'Bad request',
                    user: null,
                };
            }
        });
    }
    updateUserProfileDetails(user, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!user || Object.keys(user).length === 0) {
                    return { success: false, message: 'User data is missing', user: null };
                }
                if (!userId) {
                    return { success: false, message: 'User ID is missing', user: null };
                }
                const userData = yield this._userRepo.updateById(userId, user);
                if (!userData) {
                    return { success: false, message: 'User not found', user: null };
                }
                const updatedUser = user_mapper_1.UserMapper.responseuserProfileDetails(userData);
                return {
                    success: true,
                    message: 'User updated successfully',
                    user: updatedUser,
                };
            }
            catch (error) {
                console.error('Error updating user:', error.message || error);
                return { success: false, message: 'Internal server error', user: null };
            }
        });
    }
    getUserAddress(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!userId) {
                    return { success: false, message: 'User ID is missing', addresses: null };
                }
                const address = yield this._addressRepo.findByUserId(userId);
                console.log(address);
                if (!address || address.length === 0) {
                    return { success: false, message: 'No addresses found', addresses: null };
                }
                const addresses = user_mapper_1.UserMapper.toDTOAddressList(address);
                return {
                    success: true,
                    message: 'Addresses retrieved successfully',
                    addresses,
                };
            }
            catch (error) {
                return {
                    success: false,
                    message: 'Internal server error',
                    addresses: null,
                };
            }
        });
    }
    addUserAddress(userId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (!userId || !data) {
                    return { success: false, message: 'somthing is missing', address: null };
                }
                const userAddress = yield this._addressRepo.findByUserId(userId);
                const isPrimary = userAddress.length == 0;
                const location = data.latitude && data.longitude ? {
                    type: 'Point',
                    coordinates: [Number(data.longitude), Number(data.latitude)],
                } : undefined;
                const newAddress = {
                    userId,
                    label: data.label,
                    buildingName: data.buildingName,
                    street: data.street,
                    area: data.area,
                    city: data.city,
                    state: data.state,
                    country: data.country,
                    pinCode: data.pinCode,
                    landmark: (_a = data.landmark) !== null && _a !== void 0 ? _a : '',
                    phone: data.phone,
                    location,
                    isPrimary,
                };
                const savedAddress = yield this._addressRepo.create(newAddress);
                const address = user_mapper_1.UserMapper.toDTOAddress(savedAddress);
                return {
                    success: true,
                    message: 'Address added successfully',
                    address,
                };
            }
            catch (error) {
                return {
                    success: false,
                    message: 'Internal server error',
                    address: null,
                };
            }
        });
    }
    setPrimaryAddress(userId, setId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!userId || !setId) {
                    return { success: false, message: 'Something is missing' };
                }
                const existingPrimary = yield this._addressRepo.findPrimaryByUserId(userId);
                console.log('existing dataaaaa', existingPrimary);
                if (existingPrimary) {
                    // Unset the old primary first
                    yield this._addressRepo.updateById(existingPrimary._id, { isPrimary: false });
                }
                console.log('existing dataaaaa', existingPrimary);
                // Now set the new primary
                yield this._addressRepo.updateById(setId, { isPrimary: true });
                return { success: true, message: 'Successfully updated' };
            }
            catch (error) {
                return {
                    success: false,
                    message: 'Internal server error',
                };
            }
        });
    }
};
exports.ProfileManagement = ProfileManagement;
exports.ProfileManagement = ProfileManagement = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(types_1.TYPES.AuthUserRepository)),
    __param(1, (0, tsyringe_1.inject)(types_1.TYPES.AddressRepository)),
    __metadata("design:paramtypes", [Object, Object])
], ProfileManagement);
