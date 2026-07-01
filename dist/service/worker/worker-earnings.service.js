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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerEarningsService = void 0;
const tsyringe_1 = require("tsyringe");
const types_1 = require("../../config/constants/types");
const stream_1 = require("stream");
const pdfkit_1 = __importDefault(require("pdfkit"));
const date_fns_1 = require("date-fns");
let WorkerEarningsService = class WorkerEarningsService {
    constructor(earningsRepo, workerRepo) {
        this.earningsRepo = earningsRepo;
        this.workerRepo = workerRepo;
    }
    calculateWorkerAmount(booking) {
        var _a;
        const commissionRate = 0.1;
        const base = booking.totalAmount || 0;
        const additional = ((_a = booking.additionalItems) === null || _a === void 0 ? void 0 : _a.reduce((sum, item) => sum + item.price, 0)) || 0;
        const total = base + additional;
        return Number((total - total * commissionRate).toFixed(2));
    }
    getDuration(start, end) {
        if (!end)
            return 'N/A';
        try {
            const [sh, sm] = start.split(':').map(Number);
            const [eh, em] = end.split(':').map(Number);
            const diff = eh * 60 + em - (sh * 60 + sm);
            if (diff <= 0)
                return '0m';
            const hours = Math.floor(diff / 60);
            const minutes = diff % 60;
            if (hours > 0) {
                return `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`;
            }
            return `${minutes}m`;
        }
        catch (_a) {
            return 'N/A';
        }
    }
    getEarningsSummary(workerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const bookings = yield this.earningsRepo.findEarningsSummary(workerId);
            const now = new Date();
            const intervalToday = { start: (0, date_fns_1.startOfDay)(now), end: (0, date_fns_1.endOfDay)(now) };
            const intervalWeek = {
                start: (0, date_fns_1.startOfWeek)(now, { weekStartsOn: 1 }),
                end: (0, date_fns_1.endOfWeek)(now, { weekStartsOn: 1 }),
            };
            const intervalMonth = { start: (0, date_fns_1.startOfMonth)(now), end: (0, date_fns_1.endOfMonth)(now) };
            let lifetimeEarnings = 0;
            let todayEarnings = 0;
            let thisWeekEarnings = 0;
            let thisMonthEarnings = 0;
            for (const booking of bookings) {
                const amount = this.calculateWorkerAmount(booking);
                const bookingDate = new Date(booking.date);
                lifetimeEarnings += amount;
                if ((0, date_fns_1.isWithinInterval)(bookingDate, intervalToday)) {
                    todayEarnings += amount;
                }
                if ((0, date_fns_1.isWithinInterval)(bookingDate, intervalWeek)) {
                    thisWeekEarnings += amount;
                }
                if ((0, date_fns_1.isWithinInterval)(bookingDate, intervalMonth)) {
                    thisMonthEarnings += amount;
                }
            }
            const totalCompletedJobs = bookings.length;
            const averageEarnings = totalCompletedJobs > 0 ? Number((lifetimeEarnings / totalCompletedJobs).toFixed(2)) : 0;
            return {
                success: true,
                data: {
                    lifetimeEarnings: Number(lifetimeEarnings.toFixed(2)),
                    todayEarnings: Number(todayEarnings.toFixed(2)),
                    thisWeekEarnings: Number(thisWeekEarnings.toFixed(2)),
                    thisMonthEarnings: Number(thisMonthEarnings.toFixed(2)),
                    totalCompletedJobs,
                    averageEarnings,
                },
            };
        });
    }
    getEarningsList(workerId, query) {
        return __awaiter(this, void 0, void 0, function* () {
            const fromDate = query.from ? new Date(query.from) : undefined;
            const toDate = query.to ? new Date(query.to) : undefined;
            const { bookings, total } = yield this.earningsRepo.findEarningsList(workerId, {
                page: query.page,
                limit: query.limit,
                from: fromDate,
                to: toDate,
                search: query.search,
            });
            const formatted = bookings.map((b) => {
                const workerAmount = this.calculateWorkerAmount(b);
                const customer = typeof b.userId === 'object' && b.userId !== null
                    ? b.userId.name
                    : 'N/A';
                const service = typeof b.serviceId === 'object' && b.serviceId !== null
                    ? b.serviceId.category
                    : 'N/A';
                return {
                    bookingId: b._id.toString(),
                    customerName: customer || 'N/A',
                    serviceName: service || 'N/A',
                    date: b.date,
                    startTime: b.startTime,
                    endTime: b.endTime || '',
                    duration: this.getDuration(b.startTime, b.endTime),
                    totalAmount: b.totalAmount || 0,
                    workerEarnings: workerAmount,
                    paymentStatus: b.finalPaymentStatus || 'unpaid',
                };
            });
            return {
                success: true,
                data: {
                    bookings: formatted,
                    total,
                    page: query.page,
                    limit: query.limit,
                },
            };
        });
    }
    generateEarningsPdf(workerId, query) {
        return __awaiter(this, void 0, void 0, function* () {
            const worker = yield this.workerRepo.findById(workerId);
            const workerName = (worker === null || worker === void 0 ? void 0 : worker.name) || 'Worker';
            const fromDate = query.from ? new Date(query.from) : undefined;
            const toDate = query.to ? new Date(query.to) : undefined;
            // Retrieve all bookings matching conditions (unpaginated)
            const { bookings } = yield this.earningsRepo.findEarningsList(workerId, {
                page: 1,
                limit: 10000,
                from: fromDate,
                to: toDate,
                search: query.search,
            });
            const doc = new pdfkit_1.default({ margin: 40, size: 'A4' });
            const stream = new stream_1.PassThrough();
            doc.pipe(stream);
            // Decorative colors
            const primaryColor = '#1e3a8a'; // Deep blue
            const darkGray = '#1e293b';
            const lightGray = '#f8fafc';
            const borderColor = '#cbd5e1';
            // Header Title
            doc.fillColor(primaryColor).fontSize(20).text('BookMyService Payout Report', { align: 'left' });
            doc.moveDown(0.2);
            doc.fillColor(darkGray).fontSize(10).text(`Generated on: ${new Date().toLocaleDateString()}`);
            doc.moveDown(1.5);
            // Document Meta Table
            doc.fontSize(10);
            doc.fillColor(darkGray).font('Helvetica-Bold').text(`Worker Name: `, { continued: true }).font('Helvetica').fillColor('#334155').text(workerName);
            doc.fillColor(darkGray).font('Helvetica-Bold').text(`Email: `, { continued: true }).font('Helvetica').fillColor('#334155').text((worker === null || worker === void 0 ? void 0 : worker.email) || 'N/A');
            doc.fillColor(darkGray).font('Helvetica-Bold').text(`Period: `, { continued: true }).font('Helvetica').fillColor('#334155').text(`${query.from ? new Date(query.from).toLocaleDateString() : 'Lifetime'} - ${query.to ? new Date(query.to).toLocaleDateString() : 'Present'}`);
            doc.moveDown(2);
            // Summary Boxes
            let totalWorkerEarnings = 0;
            let totalBookingAmount = 0;
            bookings.forEach((b) => {
                totalWorkerEarnings += this.calculateWorkerAmount(b);
                totalBookingAmount += b.totalAmount || 0;
            });
            const boxY = doc.y;
            doc.rect(40, boxY, 160, 50).fill(lightGray).stroke(borderColor);
            doc.rect(215, boxY, 160, 50).fill(lightGray).stroke(borderColor);
            doc.rect(390, boxY, 165, 50).fill(lightGray).stroke(borderColor);
            doc.fillColor(primaryColor).fontSize(10).text('TOTAL COMPLETED JOBS', 50, boxY + 10);
            doc.fillColor(darkGray).fontSize(14).text(bookings.length.toString(), 50, boxY + 25);
            doc.fillColor(primaryColor).fontSize(10).text('GROSS BOOKINGS VALUE', 225, boxY + 10);
            doc.fillColor(darkGray).fontSize(14).text(`${totalBookingAmount.toFixed(2)}`, 225, boxY + 25);
            doc.fillColor(primaryColor).fontSize(10).text('NET WORKER EARNINGS', 400, boxY + 10);
            doc.fillColor(darkGray).fontSize(14).text(`${totalWorkerEarnings.toFixed(2)}`, 400, boxY + 25);
            doc.y = boxY + 70;
            doc.moveDown(1);
            // Table Header
            const tableHeaderY = doc.y;
            doc.rect(40, tableHeaderY, 515, 20).fill(primaryColor);
            doc.fillColor('#ffffff').fontSize(9);
            doc.text('Date', 45, tableHeaderY + 6);
            doc.text('Service', 115, tableHeaderY + 6);
            doc.text('Customer', 215, tableHeaderY + 6);
            doc.text('Job Status', 315, tableHeaderY + 6);
            doc.text('Gross Amount', 390, tableHeaderY + 6, { width: 70, align: 'right' });
            doc.text('Net Earnings', 475, tableHeaderY + 6, { width: 75, align: 'right' });
            let currentY = tableHeaderY + 20;
            // Table Body
            bookings.forEach((b, index) => {
                // Page break check
                if (currentY > 730) {
                    doc.addPage();
                    currentY = 40;
                }
                // Zebra striping
                if (index % 2 === 0) {
                    doc.rect(40, currentY, 515, 20).fill('#f1f5f9');
                }
                doc.fillColor(darkGray).fontSize(8.5);
                const customer = typeof b.userId === 'object' && b.userId !== null
                    ? b.userId.name
                    : 'N/A';
                const service = typeof b.serviceId === 'object' && b.serviceId !== null
                    ? b.serviceId.name
                    : 'N/A';
                const bookingDate = new Date(b.date).toLocaleDateString();
                const grossAmount = (b.totalAmount || 0).toFixed(2);
                const netEarnings = this.calculateWorkerAmount(b).toFixed(2);
                doc.text(bookingDate, 45, currentY + 6);
                doc.text(service || 'N/A', 115, currentY + 6, { width: 95, lineBreak: false });
                doc.text(customer || 'N/A', 215, currentY + 6, { width: 95, lineBreak: false });
                doc.text(b.status, 315, currentY + 6);
                doc.text(`${grossAmount}`, 390, currentY + 6, { width: 70, align: 'right' });
                doc.text(`${netEarnings}`, 475, currentY + 6, { width: 75, align: 'right' });
                currentY += 20;
            });
            // Payout details footer
            doc.end();
            const rangeStr = query.from && query.to
                ? `${query.from}_to_${query.to}`
                : 'all_time';
            const filename = `Earnings_Report_${workerName.replace(/\s+/g, '_')}_${rangeStr}.pdf`;
            return {
                pdfStream: stream,
                filename,
            };
        });
    }
};
exports.WorkerEarningsService = WorkerEarningsService;
exports.WorkerEarningsService = WorkerEarningsService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(types_1.TYPES.WorkerEarningsRepository)),
    __param(1, (0, tsyringe_1.inject)(types_1.TYPES.WorkerRepository)),
    __metadata("design:paramtypes", [Object, Object])
], WorkerEarningsService);
