"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserProfileSchema = void 0;
const message_1 = require("../../config/constants/message");
const zod_1 = require("zod");
exports.updateUserProfileSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(3, { message: message_1.MESSAGES.NAME_MUST_BE_AT_LEAST_3_CHARACTERS_LONG })
        .max(20, { message: message_1.MESSAGES.NAME_MUST_BE_LESS_THAN_20_CHARACTERS })
        .regex(/^[A-Za-z\s]+$/, { message: message_1.MESSAGES.NAME_CAN_ONLY_CONTAIN_ALPHABETS_AND_SPAC }),
    email: zod_1.z.string().email().optional(),
    phone: zod_1.z
        .string()
        .regex(/^[0-9]{10}$/, { message: message_1.MESSAGES.PHONE_NUMBER_MUST_BE_EXACTLY_10_DIGITS })
        .optional(),
    image: zod_1.z.string().optional(),
});
