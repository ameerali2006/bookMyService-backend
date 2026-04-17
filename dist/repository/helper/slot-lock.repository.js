"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlotLockRepository = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const tsyringe_1 = require("tsyringe");
const slot_lock_model_1 = require("../../model/slot-lock.model");
const time_Intervals_1 = require("../../utils/time&Intervals");
let SlotLockRepository = class SlotLockRepository {
    acquireLock(workerId, date, startTime, endTime, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield mongoose_1.default.startSession();
            session.startTransaction();
            try {
                const bookingDay = (0, time_Intervals_1.normalizeDay)(date);
                const conflict = yield slot_lock_model_1.SlotLockModel.findOne({
                    workerId,
                    date: bookingDay,
                    startTime: { $lt: endTime },
                    endTime: { $gt: startTime },
                }).session(session);
                if (conflict) {
                    yield session.abortTransaction();
                    return false;
                }
                /* 🔐 LOCK SLOT */
                yield slot_lock_model_1.SlotLockModel.create([{
                        workerId,
                        date: bookingDay,
                        startTime,
                        endTime,
                        lockedBy: userId,
                        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
                    }], { session });
                yield session.commitTransaction();
                return true;
            }
            catch (err) {
                yield session.abortTransaction();
                throw err;
            }
            finally {
                session.endSession();
            }
        });
    }
    releaseLock(workerId, startTime) {
        return __awaiter(this, void 0, void 0, function* () {
            yield slot_lock_model_1.SlotLockModel.deleteOne({ workerId, startTime });
        });
    }
};
exports.SlotLockRepository = SlotLockRepository;
exports.SlotLockRepository = SlotLockRepository = __decorate([
    (0, tsyringe_1.injectable)()
], SlotLockRepository);
