"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerRegisterSchema = void 0;
const zod_1 = require("zod");
exports.WorkerRegisterSchema = zod_1.z
    .object({
    name: zod_1.z.string().min(1, 'Name is required'),
    email: zod_1.z.string().email('Invalid email'),
    phone: zod_1.z.string().min(1, 'Phone is required'),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: zod_1.z.string().min(1, 'Confirm password is required'),
    category: zod_1.z.string().min(1, 'Category is required'),
    experience: zod_1.z.enum(['0-1', '2-5', '6-10', '10+']),
    documents: zod_1.z.string().url('Document must be a valid URL'),
    latitude: zod_1.z.string(),
    longitude: zod_1.z.string(),
    zone: zod_1.z.string(),
})
    .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});
