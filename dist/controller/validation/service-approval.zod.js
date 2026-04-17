"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApprovalSchema = void 0;
const zod_1 = require("zod");
exports.ApprovalSchema = zod_1.z.object({
    bookingId: zod_1.z.string().min(1),
    serviceName: zod_1.z.string().min(1),
    durationHours: zod_1.z.number().min(1),
    distance: zod_1.z.number().min(1),
    additionalItems: zod_1.z
        .array(zod_1.z.object({
        name: zod_1.z.string().min(1),
        price: zod_1.z.number().min(0),
    }))
        .optional(),
    additionalNotes: zod_1.z.string().optional(),
});
