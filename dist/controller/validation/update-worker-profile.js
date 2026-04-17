"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workerProfileUpdateSchema = void 0;
const zod_1 = require("zod");
exports.workerProfileUpdateSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .trim()
        .min(2, 'Name must be at least 2 characters long')
        .optional(),
    phone: zod_1.z
        .string()
        .regex(/^[0-9]{10}$/, 'Phone must be 10 digits')
        .optional(),
    experience: zod_1.z
        .enum(['0-1', '2-5', '6-10', '10+'], {
        message: 'Invalid experience range',
    })
        .optional(),
    fees: zod_1.z
        .number()
        .min(0, 'Fees cannot be negative')
        .max(10000, 'Fees cannot exceed ₹10,000')
        .optional(),
    profileImage: zod_1.z
        .string()
        .optional(),
    description: zod_1.z
        .string()
        .trim()
        .max(500, 'Description cannot exceed 500 characters')
        .optional(),
    skills: zod_1.z
        .array(zod_1.z.string().trim().min(2, 'Skill must be at least 2 characters'))
        .max(20, 'Maximum 20 skills allowed')
        .optional(),
});
