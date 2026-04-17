"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateConversionService = void 0;
const date_fns_tz_1 = require("date-fns-tz");
const tsyringe_1 = require("tsyringe");
let DateConversionService = class DateConversionService {
    constructor() {
        this.IST_TIMEZONE = 'Asia/Kolkata';
    }
    utcToIST(date) {
        console.log(`utcToISt:Input:${date}`);
        console.log(`utcToISt:output:${(0, date_fns_tz_1.toZonedTime)(date, this.IST_TIMEZONE)}`);
        return (0, date_fns_tz_1.toZonedTime)(date, this.IST_TIMEZONE);
    }
    istToUTC(date) {
        const offsetMs = 5.5 * 60 * 60 * 1000;
        console.log(`istToUTC:Input:${date}`);
        console.log(`istToUTC:output:${new Date(date.getTime() - offsetMs)}`);
        return new Date(date.getTime() - offsetMs);
    }
    formatISTTime(date) {
        const istDate = (0, date_fns_tz_1.toZonedTime)(date, this.IST_TIMEZONE);
        return istDate.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });
    }
    formatIST(date, pattern = 'yyyy-MM-dd HH:mm:ssXXX') {
        const istDate = (0, date_fns_tz_1.toZonedTime)(date, this.IST_TIMEZONE);
        return (0, date_fns_tz_1.format)(istDate, pattern, { timeZone: this.IST_TIMEZONE });
    }
};
exports.DateConversionService = DateConversionService;
exports.DateConversionService = DateConversionService = __decorate([
    (0, tsyringe_1.injectable)()
], DateConversionService);
