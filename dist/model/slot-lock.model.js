"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlotLockModel = void 0;
const mongoose_1 = require("mongoose");
const SlotLockSchema = new mongoose_1.Schema({
    workerId: { type: mongoose_1.Types.ObjectId, required: true },
    date: { type: Date, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    lockedBy: { type: mongoose_1.Types.ObjectId, required: true },
    expiresAt: { type: Date, required: true },
}, { timestamps: true });
SlotLockSchema.index({ workerId: 1, startTime: 1, endTime: 1 });
SlotLockSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
exports.SlotLockModel = (0, mongoose_1.model)('SlotLock', SlotLockSchema);
