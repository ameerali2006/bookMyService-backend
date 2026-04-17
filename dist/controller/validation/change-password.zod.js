"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordSchema = void 0;
const zod_1 = require("zod");
exports.changePasswordSchema = zod_1.z.object({
    oldPassword: zod_1.z.string().min(6, 'Old password must be at least 6 characters.'),
    newPassword: zod_1.z
        .string()
        .min(8, 'New password must be at least 8 characters.')
        .regex(/[a-z]/, 'Must include at least one lowercase letter.')
        .regex(/[0-9]/, 'Must include at least one number.'),
    confirmPassword: zod_1.z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});
