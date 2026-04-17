"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schemasByRole = exports.WorkerRegisterSchema = exports.UserRegisterSchema = void 0;
const zod_1 = require("zod");
exports.UserRegisterSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required'),
    email: zod_1.z.string().email('Invalid email'),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters').optional(),
    phone: zod_1.z.string(),
    googleId: zod_1.z.string().optional(),
    role: zod_1.z.enum(['user', 'worker']),
});
exports.WorkerRegisterSchema = exports.UserRegisterSchema.extend({
    category: zod_1.z.string().min(1, 'Category is required'),
    experience: zod_1.z.enum(['0-1', '2-5', '6-10', '10+']),
    documents: zod_1.z.string().url('Document must be a valid URL'),
    latitude: zod_1.z.string(),
    longitude: zod_1.z.string(),
    zone: zod_1.z.string().min(1, 'Zone is required'),
    isVerified: zod_1.z.boolean().optional(),
});
exports.schemasByRole = {
    user: exports.UserRegisterSchema,
    worker: exports.WorkerRegisterSchema,
};
