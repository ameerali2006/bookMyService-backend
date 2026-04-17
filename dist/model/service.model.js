"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceModel = void 0;
const mongoose_1 = require("mongoose");
const serviceSchema = new mongoose_1.Schema({
    category: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    priceUnit: { type: String, enum: ['per hour', 'per job', 'per item'], required: true },
    duration: { type: Number, required: true },
    image: [{ type: String, required: true }],
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, {
    timestamps: true,
});
exports.ServiceModel = (0, mongoose_1.model)('Service', serviceSchema);
