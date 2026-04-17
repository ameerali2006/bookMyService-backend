"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.envSchema = void 0;
const zod_1 = require("zod");
exports.envSchema = zod_1.z.object({
    PORT: zod_1.z.string().min(1, 'PORT is required'),
    MONGO_URI: zod_1.z.string().url('MONGO_URI must be a valid MongoDB URL'),
    REDIS_HOST: zod_1.z.string().min(1, 'REDIS_HOST is required'),
    REDIS_PORT: zod_1.z.string().regex(/^\d+$/, 'REDIS_PORT must be a number'),
    REDIS_PASSWORD: zod_1.z.string().min(1, 'REDIS_PASSWORD is required'),
    REDIS_URL: zod_1.z.string().min(1, 'REDIS_URL is required'),
    FRONTEND_URI: zod_1.z.string().url('FRONTEND_URI must be a valid URL'),
    ACCESS_TOKEN_SECRET: zod_1.z.string().min(1, 'ACCESS_TOKEN_SECRET is required'),
    ACCESS_TOKEN_EXPIRY: zod_1.z.string().min(1, 'ACCESS_TOKEN_EXPIRY is required'),
    REFRESH_TOKEN_SECRET: zod_1.z.string().min(1, 'REFRESH_TOKEN_SECRET is required'),
    REFRESH_TOKEN_EXPIRY: zod_1.z.string().min(1, 'REFRESH_TOKEN_EXPIRY is required'),
    RESET_SECRET_KEY: zod_1.z.string().min(1, 'RESET_SECRET_KEY is required'),
    RESET_EXPIRES_IN: zod_1.z.string().min(1, 'RESET_EXPIRES_IN is required'),
    BCRYPT_SALT_ROUNDS: zod_1.z.string().regex(/^\d+$/, 'BCRYPT_SALT_ROUNDS must be a number'),
    GOOGLE_CLIENT_ID: zod_1.z.string().min(10, 'Client ID is too short').regex(/^[0-9a-z-]+\.apps\.googleusercontent\.com$/, 'Invalid Google Client ID format'),
    GOOGLE_AUTH_SECRET: zod_1.z.string().min(20, 'Secret is too short').startsWith('GOCSPX', 'Secret must start with GOCSPX'),
    EMAIL_USER: zod_1.z.string().email('EMAIL_USER must be a valid email'),
    EMAIL_PASS: zod_1.z.string().min(1, 'EMAIL_PASS is required'),
    NODE_ENV: zod_1.z.string().min(1, 'NODE_ENV required'),
    CLOUDINARY_CLOUD_NAME: zod_1.z.string().min(1, 'CLOUDINARY_CLOUD_NAME is required'),
    CLOUDINARY_API_KEY: zod_1.z.string().min(1, 'CLOUDINARY_API_KEY is required'),
    CLOUDINARY_API_SECRET: zod_1.z.string().min(1, 'CLOUDINARY_API_SECRET is required'),
    STRIPE_SECRET_KEY: zod_1.z.string().min(1, 'STRIPE_SECRET_KEY is required'),
    WEBHOOK_SECRET_KEY: zod_1.z.string().min(1, 'WEBHOOK_SECRET_KEY is required'),
    LOGGER_STATUS: zod_1.z.string().min(1, 'LOGGER_STATUS is required'),
    CRON_JOB_DURATION: zod_1.z.string().min(1, 'CRON_JOB_DURATION is required'),
});
