"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addressSchema = void 0;
const message_1 = require("../../config/constants/message");
const zod_1 = require("zod");
exports.addressSchema = zod_1.z.object({
    label: zod_1.z.enum(['Home', 'Work', 'Shop']).refine((val) => !!val, {
        message: message_1.MESSAGES.PLEASE_SELECT_AN_ADDRESS_LABEL,
    }),
    buildingName: zod_1.z
        .string()
        .trim()
        .min(1, { message: message_1.MESSAGES.BUILDING_NAME_OR_FLAT_NUMBER_IS_REQUIRED }),
    street: zod_1.z
        .string()
        .trim()
        .min(1, { message: message_1.MESSAGES.STREET_IS_REQUIRED }),
    area: zod_1.z
        .string()
        .trim()
        .min(1, { message: message_1.MESSAGES.AREA_IS_REQUIRED }),
    city: zod_1.z
        .string()
        .trim()
        .min(1, { message: message_1.MESSAGES.CITY_IS_REQUIRED }),
    state: zod_1.z
        .string()
        .trim()
        .min(1, { message: message_1.MESSAGES.STATE_IS_REQUIRED }),
    country: zod_1.z
        .string()
        .trim()
        .min(1, { message: message_1.MESSAGES.COUNTRY_IS_REQUIRED }),
    phone: zod_1.z
        .string()
        .trim()
        .regex(/^[6-9]\d{9}$/, { message: message_1.MESSAGES.ENTER_A_VALID_10DIGIT_PHONE_NUMBER }),
    pinCode: zod_1.z
        .string()
        .trim()
        .regex(/^\d{6}$/, { message: message_1.MESSAGES.ENTER_A_VALID_6DIGIT_PIN_CODE }),
    landmark: zod_1.z
        .string()
        .trim()
        .optional()
        .default(''),
    latitude: zod_1.z
        .number()
        .optional()
        .refine((val) => val === undefined || (val >= -90 && val <= 90), {
        message: message_1.MESSAGES.INVALID_LATITUDE_VALUE,
    }),
    longitude: zod_1.z
        .number()
        .optional()
        .refine((val) => val === undefined || (val >= -180 && val <= 180), {
        message: message_1.MESSAGES.INVALID_LONGITUDE_VALUE,
    }),
});
