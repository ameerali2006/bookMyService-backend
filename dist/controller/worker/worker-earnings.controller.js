"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
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
exports.WorkerEarningsController = void 0;
const tsyringe_1 = require("tsyringe");
const types_1 = require("../../config/constants/types");
const worker_earnings_zod_1 = require("../validation/worker-earnings.zod");
const status_code_1 = require("../../config/constants/status-code");
let WorkerEarningsController = class WorkerEarningsController {
    constructor(earningsService) {
        this.earningsService = earningsService;
    }
    getSummary(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const workerId = req.user._id;
                const response = yield this.earningsService.getEarningsSummary(workerId);
                res.status(status_code_1.STATUS_CODES.OK).json(response);
            }
            catch (error) {
                next(error);
            }
        });
    }
    getList(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const workerId = req.user._id;
                const query = worker_earnings_zod_1.WorkerEarningsQuerySchema.parse(req.query);
                const response = yield this.earningsService.getEarningsList(workerId, query);
                res.status(status_code_1.STATUS_CODES.OK).json(response);
            }
            catch (error) {
                next(error);
            }
        });
    }
    exportPdf(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const workerId = req.user._id;
                const query = worker_earnings_zod_1.WorkerEarningsQuerySchema.parse(req.query);
                const { pdfStream, filename } = yield this.earningsService.generateEarningsPdf(workerId, query);
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
                pdfStream.pipe(res);
            }
            catch (error) {
                next(error);
            }
        });
    }
};
exports.WorkerEarningsController = WorkerEarningsController;
exports.WorkerEarningsController = WorkerEarningsController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(types_1.TYPES.WorkerEarningsService)),
    __metadata("design:paramtypes", [Object])
], WorkerEarningsController);
