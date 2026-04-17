"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serviceRegistrationSchema = void 0;
const zod_1 = require("zod");
exports.serviceRegistrationSchema = zod_1.z
    .object({
    category: zod_1.z.string().min(2),
    description: zod_1.z.string().min(5),
    price: zod_1.z.number().positive(),
    priceUnit: zod_1.z.enum(['per hour', 'per job', 'per item']),
    duration: zod_1.z.number().positive(),
    image: zod_1.z.string().url(),
    status: zod_1.z.enum(['active', 'inactive']).default('active'),
});
