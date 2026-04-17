"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserProfileSchema = void 0;
const zod_1 = require("zod");
exports.updateUserProfileSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(3, { message: 'Name must be at least 3 characters long' })
        .max(20, { message: 'Name must be less than 20 characters' })
        .regex(/^[A-Za-z\s]+$/, { message: 'Name can only contain alphabets and spaces' }),
    email: zod_1.z.string().email().optional(),
    phone: zod_1.z
        .string()
        .regex(/^[0-9]{10}$/, { message: 'Phone number must be exactly 10 digits' })
        .optional(),
    image: zod_1.z.string().optional(),
});
