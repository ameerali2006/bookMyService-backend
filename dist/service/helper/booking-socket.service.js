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
exports.BookingSocketHandler = void 0;
const tsyringe_1 = require("tsyringe");
const types_1 = require("../../config/constants/types");
const worker_mapper_1 = require("../../utils/mapper/worker-mapper");
let BookingSocketHandler = class BookingSocketHandler {
    constructor(_bookingUseCase, _bookingRepo, _workerHelper) {
        this._bookingUseCase = _bookingUseCase;
        this._bookingRepo = _bookingRepo;
        this._workerHelper = _workerHelper;
    }
    registerEvents(io, onlineWorkers) {
        io.on('connection', (socket) => {
            const customSocket = socket;
            if (customSocket.userType !== 'Worker')
                return;
            console.log(`⚙️ Registering BookingSocket for worker ${customSocket.userId}`);
            socket.on('get-pending-bookings', () => __awaiter(this, void 0, void 0, function* () {
                const pending = yield this._bookingRepo.findPendingAdvanceBookings(customSocket.userId);
                console.log(pending);
                if (pending.length)
                    socket.emit('receive-pending-bookings', pending);
            }));
            socket.on('submit-worker-details', (data) => __awaiter(this, void 0, void 0, function* () {
                const updated = yield this._bookingUseCase.updateWorkerDetails(Object.assign(Object.assign({}, data), { workerId: customSocket.userId }));
                console.log(`✅ Worker ${customSocket.userId} submitted details for booking ${data.bookingId}`);
            }));
        });
    }
    emitBookingToWorker(io, onlineWorkers, workerId, booking) {
        return __awaiter(this, void 0, void 0, function* () {
            const worker = onlineWorkers.get(workerId._id.toString());
            if (worker) {
                console.log(booking);
                const service = worker_mapper_1.WorkerMapper.serviceRequest(booking);
                const nextAvailable = yield this._workerHelper.getWorkerAvailableTime(booking.workerId._id.toString(), booking.date, booking.startTime);
                console.log(Object.assign(Object.assign({}, service), { availableTime: nextAvailable.availableTime }));
                io.to(worker.socketId).emit('receive-pending-booking', Object.assign(Object.assign({}, service), { availableTime: nextAvailable.availableTime }));
                console.log(booking);
                console.log(`📨 Booking emitted to worker ${workerId}`);
            }
            else {
                console.log(`🕓 Worker ${workerId} offline. Booking stored for later.`);
            }
        });
    }
};
exports.BookingSocketHandler = BookingSocketHandler;
exports.BookingSocketHandler = BookingSocketHandler = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(types_1.TYPES.BookingService)),
    __param(1, (0, tsyringe_1.inject)(types_1.TYPES.BookingRepository)),
    __param(2, (0, tsyringe_1.inject)(types_1.TYPES.WorkerHelperService)),
    __metadata("design:paramtypes", [Object, Object, Object])
], BookingSocketHandler);
