"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerMapper = void 0;
const isCategoryObj = (val) => typeof val === 'object' && val !== null && 'category' in val;
class WorkerMapper {
    static responseWorkerDto(worker) {
        const { _id, location } = worker, rest = __rest(worker, ["_id", "location"]);
        return {
            _id: _id.toString(),
            name: rest.name,
            email: rest.email,
            image: rest.profileImage,
            location: {
                lat: location.coordinates[1],
                lng: location.coordinates[0],
                address: rest.zone,
            },
        };
    }
    static serviceRequest(booking) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x;
        const { _id } = booking;
        return {
            userName: (_b = (_a = booking.userId) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : 'Unknown',
            serviceName: (_d = (_c = booking.serviceId) === null || _c === void 0 ? void 0 : _c.category) !== null && _d !== void 0 ? _d : 'Unknown',
            date: (_f = (_e = booking.date) === null || _e === void 0 ? void 0 : _e.toDateString()) !== null && _f !== void 0 ? _f : '',
            id: (_g = _id === null || _id === void 0 ? void 0 : _id.toString()) !== null && _g !== void 0 ? _g : '',
            location: (_j = (_h = booking === null || booking === void 0 ? void 0 : booking.address) === null || _h === void 0 ? void 0 : _h.city) !== null && _j !== void 0 ? _j : 'Unknown',
            notes: (_k = booking === null || booking === void 0 ? void 0 : booking.description) !== null && _k !== void 0 ? _k : '',
            phone: (_m = (_l = booking.userId) === null || _l === void 0 ? void 0 : _l.phone) !== null && _m !== void 0 ? _m : '',
            status: (_o = booking.workerResponse) !== null && _o !== void 0 ? _o : 'pending',
            time: (_p = booking.startTime) !== null && _p !== void 0 ? _p : '',
            userLocation: {
                lat: (_t = (_s = (_r = (_q = booking === null || booking === void 0 ? void 0 : booking.address) === null || _q === void 0 ? void 0 : _q.location) === null || _r === void 0 ? void 0 : _r.coordinates) === null || _s === void 0 ? void 0 : _s[1]) !== null && _t !== void 0 ? _t : 0,
                lng: (_x = (_w = (_v = (_u = booking === null || booking === void 0 ? void 0 : booking.address) === null || _u === void 0 ? void 0 : _u.location) === null || _v === void 0 ? void 0 : _v.coordinates) === null || _w === void 0 ? void 0 : _w[0]) !== null && _x !== void 0 ? _x : 0,
            },
        };
    }
    static mapServiceRequest(booking) {
        return booking.map((b) => this.serviceRequest(b));
    }
    static toAllWorkerBookingDto(booking) {
        var _a, _b, _c, _d, _e, _f;
        const { _id } = booking;
        const { _id: userId } = booking.userId;
        return {
            id: _id.toString(),
            userId: userId.toString(),
            userName: booking.userId.name,
            serviceName: booking.serviceId.category,
            date: booking.date.toISOString().split('T')[0],
            time: booking.startTime,
            address: typeof booking.address === 'string'
                ? booking.address
                : ((_f = (_d = (_b = (_a = booking.address) === null || _a === void 0 ? void 0 : _a.buildingName) !== null && _b !== void 0 ? _b : (_c = booking.address) === null || _c === void 0 ? void 0 : _c.street) !== null && _d !== void 0 ? _d : (_e = booking.address) === null || _e === void 0 ? void 0 : _e.area) !== null && _f !== void 0 ? _f : ''),
            status: booking.status,
            workerResponse: booking.workerResponse,
        };
    }
}
exports.WorkerMapper = WorkerMapper;
WorkerMapper.mapWorkerToProfileDTO = (worker) => {
    var _a, _b, _c;
    return ({
        id: (_a = worker._id) === null || _a === void 0 ? void 0 : _a.toString(),
        name: worker.name,
        email: worker.email,
        phone: worker.phone || '',
        profileImage: worker.profileImage || '',
        experience: worker.experience,
        zone: worker.zone,
        category: isCategoryObj(worker.category)
            ? worker.category.category
            : typeof worker.category === 'string'
                ? worker.category
                : '',
        fees: worker.fees,
        isActive: worker.isActive,
        isVerified: worker.isVerified,
        description: worker.description || '',
        skills: worker.skills || [],
        location: {
            lat: ((_b = worker.location) === null || _b === void 0 ? void 0 : _b.coordinates[1]) || 0,
            lng: ((_c = worker.location) === null || _c === void 0 ? void 0 : _c.coordinates[0]) || 0,
        },
        documents: worker.documents || '',
    });
};
WorkerMapper.ApprovedService = (b) => {
    const { _id } = b;
    return {
        id: _id.toString(),
        customerName: b.userId.name,
        serviceName: b.serviceId.category,
        date: b.date,
        startTime: b.startTime,
        endTime: b.endTime,
        status: b.status,
    };
};
