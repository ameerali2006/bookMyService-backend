"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addressSchema = void 0;
const zod_1 = require("zod");
exports.addressSchema = zod_1.z.object({
    label: zod_1.z.enum(['Home', 'Work', 'Shop']).refine((val) => !!val, {
        message: 'Please select an address label',
    }),
    buildingName: zod_1.z
        .string()
        .trim()
        .min(1, { message: 'Building name or flat number is required' }),
    street: zod_1.z
        .string()
        .trim()
        .min(1, { message: 'Street is required' }),
    area: zod_1.z
        .string()
        .trim()
        .min(1, { message: 'Area is required' }),
    city: zod_1.z
        .string()
        .trim()
        .min(1, { message: 'City is required' }),
    state: zod_1.z
        .string()
        .trim()
        .min(1, { message: 'State is required' }),
    country: zod_1.z
        .string()
        .trim()
        .min(1, { message: 'Country is required' }),
    phone: zod_1.z
        .string()
        .trim()
        .regex(/^[6-9]\d{9}$/, { message: 'Enter a valid 10-digit phone number' }),
    pinCode: zod_1.z
        .string()
        .trim()
        .regex(/^\d{6}$/, { message: 'Enter a valid 6-digit PIN code' }),
    landmark: zod_1.z
        .string()
        .trim()
        .optional()
        .default(''),
    latitude: zod_1.z
        .number()
        .optional()
        .refine((val) => val === undefined || (val >= -90 && val <= 90), {
        message: 'Invalid latitude value',
    }),
    longitude: zod_1.z
        .number()
        .optional()
        .refine((val) => val === undefined || (val >= -180 && val <= 180), {
        message: 'Invalid longitude value',
    }),
});
