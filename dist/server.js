"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const db_1 = require("./config/db");
const redis_1 = require("./config/redis");
const env_1 = require("./config/env/env");
const socketServer_1 = require("./config/socketServer");
const worker_payout_1 = require("./jobs/worker-payout");
const port = env_1.ENV.PORT || 5000;
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, db_1.connectDB)();
        yield (0, redis_1.connectRedis)();
        socketServer_1.socketServer.listen(port, () => {
            console.log(`🚀 Server running on port ${port}`);
            (0, worker_payout_1.initWorkerPayoutJob)();
        });
    }
    catch (error) {
        console.error('❌ Server startup error:', error);
    }
});
startServer();
