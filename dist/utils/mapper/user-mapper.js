"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserMapper = void 0;
class UserMapper {
    static toRegistrationModel(userDto) {
        return {
            googleId: userDto.googleId,
            name: userDto.name,
            email: userDto.email,
            password: userDto.password,
        };
    }
    static resposeWorkerDto(user) {
        return {
            _id: user._id.toString(),
            name: user.name,
            email: user.email,
            image: user === null || user === void 0 ? void 0 : user.image,
        };
    }
    static responseuserProfileDetails(user) {
        return {
            name: user.name,
            email: user.email,
            phone: user.phone,
            image: user === null || user === void 0 ? void 0 : user.image,
        };
    }
    static toDTOAddress(address) {
        var _a;
        return {
            _id: (_a = address._id) === null || _a === void 0 ? void 0 : _a.toString(),
            label: address.label,
            street: address.street,
            buildingName: address.buildingName,
            area: address.area,
            city: address.city,
            state: address.state,
            country: address.country,
            pinCode: address.pinCode,
            landmark: address.landmark,
            phone: address.phone,
            isPrimary: address.isPrimary,
        };
    }
    static formatAddress(address) {
        if (!address)
            return '';
        const parts = [
            address.buildingName,
            address.street,
            address.area,
            address.landmark,
            address.city,
            address.state,
            address.country,
            address.pinCode,
        ];
        return parts.filter(Boolean).join(', ');
    }
    static toDTOAddressList(addresses) {
        return addresses.map((addr) => this.toDTOAddress(addr));
    }
    static ongoingBooking(data) {
        return data.map((b) => {
            var _a;
            return ({
                id: b._id.toString(),
                serviceName: b.serviceId.category,
                workerName: (_a = b.workerId) === null || _a === void 0 ? void 0 : _a.name,
                date: b.date.toISOString(),
                time: b.startTime,
                status: b.workerResponse,
                image: b.serviceId.image,
            });
        });
    }
    static bookingDetail(b) {
        var _a, _b, _c, _d;
        return {
            id: b._id.toString(),
            serviceName: b.serviceId.category,
            description: b.description || '',
            date: b.date.toString(),
            startTime: b.startTime,
            endTime: b.endTime,
            workerName: ((_a = b.workerId) === null || _a === void 0 ? void 0 : _a.name) || '',
            workerImage: ((_b = b.workerId) === null || _b === void 0 ? void 0 : _b.profileImage) || 'https://cdn.vectorstock.com/i/1000v/06/52/dabbing-construction-worker-cartoon-vector-51110652.jpg',
            contact: ((_c = b.workerId) === null || _c === void 0 ? void 0 : _c.phone) || '',
            address: b.address,
            advanceAmount: b.advanceAmount,
            totalAmount: b.totalAmount || 0,
            remainingAmount: b.remainingAmount || 0,
            advancePaymentStatus: b.advancePaymentStatus || 'unpaid',
            finalPaymentStatus: b.finalPaymentStatus || 'unpaid',
            paymentMethod: b.paymentMethod,
            additionalItems: b.additionalItems || [],
            paymentItems: b === null || b === void 0 ? void 0 : b.paymentBreakdown,
            status: b.status,
            workerResponse: b.workerResponse,
            otp: (_d = b.otp) !== null && _d !== void 0 ? _d : undefined,
            review: b.reviewId ? {
                comment: b.reviewId.comment,
                rating: b.reviewId.rating,
                createdAt: b.reviewId.createdAt.toLocaleDateString(),
            } : undefined,
        };
    }
}
exports.UserMapper = UserMapper;
