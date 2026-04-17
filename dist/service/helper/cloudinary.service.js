"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudinaryService = void 0;
const tsyringe_1 = require("tsyringe");
const cloudinary_1 = __importDefault(require("../../config/cloudinary"));
const env_1 = require("../../config/env/env");
let CloudinaryService = class CloudinaryService {
    generateSignature(folder) {
        const timestamp = Math.floor(Date.now() / 1000);
        const signature = cloudinary_1.default.utils.api_sign_request({ timestamp, folder }, env_1.ENV.CLOUDINARY_API_SECRET);
        return {
            timestamp,
            signature,
            apiKey: env_1.ENV.CLOUDINARY_API_KEY,
            cloudName: env_1.ENV.CLOUDINARY_CLOUD_NAME,
            folder,
        };
    }
};
exports.CloudinaryService = CloudinaryService;
exports.CloudinaryService = CloudinaryService = __decorate([
    (0, tsyringe_1.injectable)()
], CloudinaryService);
