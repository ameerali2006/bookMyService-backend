"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENV = void 0;
const dotenv_1 = require("dotenv");
const env_schema_1 = require("./env.schema");
(0, dotenv_1.config)();
const parsed = env_schema_1.envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error('Invalid env variable');
    console.error(parsed.error.format());
    process.exit(1);
}
else {
    console.log('success env var  ');
}
exports.ENV = parsed.data;
