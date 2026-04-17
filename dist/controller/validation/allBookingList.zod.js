"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerBookingListRequestDto = exports.workerResponseEnum = exports.bookingStatusEnum = void 0;
const zod_1 = require("zod");
exports.bookingStatusEnum = zod_1.z.enum([
    'pending',
    'confirmed',
    'in-progress',
    'awaiting-final-payment',
    'completed',
    'cancelled',
]);
exports.workerResponseEnum = zod_1.z.enum([
    'accepted',
    'rejected',
    'pending',
]);
exports.WorkerBookingListRequestDto = zod_1.z.object({
    page: zod_1.z.coerce.number().min(1).default(1),
    limit: zod_1.z.coerce.number().min(1).max(50).default(10),
    search: zod_1.z.preprocess((val) => (val === '' ? undefined : val), zod_1.z.string().min(1).optional()),
    statuses: zod_1.z.preprocess((val) => {
        if (val === '' || val == null)
            return undefined;
        if (typeof val === 'string')
            return [val];
        if (Array.isArray(val)) {
            const cleaned = val.filter((v) => v !== '');
            return cleaned.length ? cleaned : undefined;
        }
        return undefined;
    }, zod_1.z.array(exports.bookingStatusEnum).optional()),
    workerResponses: zod_1.z.preprocess((val) => {
        if (val === '' || val == null)
            return undefined;
        if (typeof val === 'string')
            return [val];
        if (Array.isArray(val)) {
            const cleaned = val.filter((v) => v !== '');
            return cleaned.length ? cleaned : undefined;
        }
        return undefined;
    }, zod_1.z.array(exports.workerResponseEnum).optional()),
    from: zod_1.z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), 'Invalid from date')
        .optional(),
    to: zod_1.z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), 'Invalid to date')
        .optional(),
});
