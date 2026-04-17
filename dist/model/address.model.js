"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressModel = void 0;
const mongoose_1 = require("mongoose");
const addressSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    label: { type: String, trim: true, default: 'Home' },
    buildingName: { type: String, trim: true },
    street: { type: String, trim: true },
    area: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    pinCode: { type: String, required: true, trim: true },
    landmark: { type: String, trim: true },
    formattedAddress: { type: String, trim: true, default: '' },
    isPrimary: { type: Boolean, default: false },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
        },
        coordinates: {
            type: [Number],
            required: true,
            index: '2dsphere',
        },
    },
}, { timestamps: true });
exports.AddressModel = (0, mongoose_1.model)('Address', addressSchema);
