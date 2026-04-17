"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminMapper = void 0;
class AdminMapper {
    static resAdminData(admin) {
        return {
            _id: admin._id.toString(),
            name: admin.name,
            email: admin.email,
        };
    }
    static resUserDetails(users) {
        return users.map((user) => ({
            _id: user._id.toString(),
            name: user.name,
            email: user.email,
            phone: user.phone,
            image: user.image,
            isBlocked: user.isBlocked,
            createdAt: user.createdAt,
        }));
    }
    static resWorkersDetails(workers) {
        return workers.map((w) => ({
            _id: w._id.toString(),
            name: w.name,
            email: w.email,
            phone: w.phone,
            isBlocked: w.isBlocked,
            isVerified: w.isVerified,
            category: w.category.toString(),
            experience: w.experience,
            profileImage: (w === null || w === void 0 ? void 0 : w.profileImage) || undefined,
            createdAt: w.createdAt,
        }));
    }
    static resServiceDetails(services) {
        return services.map((w) => ({
            _id: String(w._id),
            category: w.category,
            description: w.description,
            price: w.price,
            priceUnit: w.priceUnit,
            duration: w.duration,
            image: w.image,
            status: w.status,
            createdAt: w.createdAt,
        }));
    }
    static resBookingDetails(booking) {
        var _a, _b, _c, _d, _e;
        return {
            id: booking._id.toString(),
            status: booking.status,
            bookingDate: booking.date,
            timeSlot: `${booking.startTime} - ${(_a = booking.endTime) !== null && _a !== void 0 ? _a : ''}`,
            customer: {
                name: booking.userId.name,
                phone: booking.userId.phone,
                avatar: booking.userId.image,
            },
            worker: {
                name: booking.workerId.name,
                phone: booking.workerId.phone,
                email: booking.workerId.email,
                avatar: booking.workerId.profileImage,
                response: booking.workerResponse,
            },
            service: {
                name: booking.serviceId.category,
                category: booking.serviceId.category,
                duration: booking.serviceId.duration,
            },
            address: {
                street: booking.address.street,
                city: booking.address.city,
                state: booking.address.state,
                pinCode: booking.address.pinCode,
                phone: booking.address.phone,
                lat: booking.address.location.coordinates[1],
                lng: booking.address.location.coordinates[0],
            },
            description: booking.description,
            additionalItems: (_b = booking.additionalItems) !== null && _b !== void 0 ? _b : [],
            payment: {
                advanceAmount: booking.advanceAmount,
                remainingAmount: (_c = booking.remainingAmount) !== null && _c !== void 0 ? _c : 0,
                totalAmount: (_d = booking.totalAmount) !== null && _d !== void 0 ? _d : 0,
                advancePaid: booking.advancePaymentStatus === 'paid',
                finalPaid: booking.finalPaymentStatus === 'paid',
                paymentMethod: booking.paymentMethod,
                breakdown: booking.paymentBreakdown,
            },
            rating: booking.reviewId
                ? {
                    stars: (_e = booking.reviewId.rating) !== null && _e !== void 0 ? _e : 0,
                    review: booking.reviewId.comment,
                }
                : undefined,
            timeline: [
                { status: 'confirmed', completed: booking.status !== 'pending' },
                {
                    status: 'in-progress',
                    completed: booking.status === 'in-progress' || booking.status === 'completed',
                },
                { status: 'completed', completed: booking.status === 'completed' },
            ],
        };
    }
}
exports.AdminMapper = AdminMapper;
