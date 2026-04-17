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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initWorkerPayoutJob = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const tsyringe_1 = require("tsyringe");
const worker_payout_service_1 = require("../service/worker/worker-payout.service");
const env_1 = require("../config/env/env");
const initWorkerPayoutJob = () => {
    const payoutService = tsyringe_1.container.resolve(worker_payout_service_1.WorkerPayoutService);
    let isRunning = false;
    const schedule = env_1.ENV.CRON_JOB_DURATION;
    node_cron_1.default.schedule(schedule, () => __awaiter(void 0, void 0, void 0, function* () {
        if (isRunning) {
            console.log('Payout job already running, skipping...');
            return;
        }
        isRunning = true;
        console.log('Running worker payout job...');
        try {
            yield payoutService.processPayouts();
            console.log('Payout job completed');
        }
        catch (error) {
            console.error('Payout job failed:', error);
        }
        finally {
            isRunning = false;
        }
    }), {
        timezone: 'Asia/Kolkata',
    });
};
exports.initWorkerPayoutJob = initWorkerPayoutJob;
