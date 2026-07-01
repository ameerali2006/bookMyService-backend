"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerEarningsQuerySchema = void 0;
const zod_1 = require("zod");
exports.WorkerEarningsQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().min(1).default(1),
    limit: zod_1.z.coerce.number().min(1).max(100).default(10),
    search: zod_1.z.preprocess((val) => (val === '' ? undefined : val), zod_1.z.string().min(1).optional()),
    from: zod_1.z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), 'Invalid from date')
        .optional(),
    to: zod_1.z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), 'Invalid to date')
        .optional(),
});
