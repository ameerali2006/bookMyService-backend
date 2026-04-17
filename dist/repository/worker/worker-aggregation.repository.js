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
exports.WorkerAggregation = void 0;
const inversify_1 = require("inversify");
const mongoose_1 = require("mongoose");
const worker_model_1 = require("../../model/worker.model");
const base_repository_1 = require("../shared/base.repository");
let WorkerAggregation = class WorkerAggregation extends base_repository_1.BaseRepository {
    constructor() {
        super(worker_model_1.WorkerModel);
    }
    findNearbyWorkers(lat, lng, maxDistance) {
        return __awaiter(this, void 0, void 0, function* () {
            return worker_model_1.WorkerModel.aggregate([
                {
                    $geoNear: {
                        near: { type: 'Point', coordinates: [lng, lat] },
                        distanceField: 'distance',
                        maxDistance,
                        spherical: true,
                        query: { isVerified: 'approved' },
                    },
                },
                {
                    $group: {
                        _id: '$category',
                        workers: { $push: '$$ROOT' },
                    },
                },
            ]);
        });
    }
    findNearbyWorkersByServiceId(serviceId_1, lat_1, lng_1, search_1, sort_1, page_1, pageSize_1) {
        return __awaiter(this, arguments, void 0, function* (serviceId, lat, lng, search, sort, page, pageSize, maxDistance = 20000) {
            var _a;
            const skip = (page - 1) * pageSize;
            const serviceObjectId = new mongoose_1.Types.ObjectId(serviceId);
            const pipeline = [
                {
                    $geoNear: {
                        near: { type: 'Point', coordinates: [lng, lat] },
                        distanceField: 'distance',
                        spherical: true,
                        maxDistance,
                        query: Object.assign({ category: serviceObjectId, isVerified: 'approved' }, (search && { name: { $regex: search, $options: 'i' } })),
                    },
                },
                {
                    $lookup: {
                        from: 'reviews',
                        localField: '_id',
                        foreignField: 'workerId',
                        as: 'reviews',
                    },
                },
                {
                    $addFields: {
                        avgRating: { $ifNull: [{ $avg: '$reviews.rating' }, 0] },
                        totalReviews: { $size: '$reviews' },
                    },
                },
                {
                    $project: {
                        reviews: 0,
                    },
                },
                {
                    $sort: sort === 'rating'
                        ? { avgRating: -1 }
                        : sort === 'price'
                            ? { fees: 1 }
                            : { distance: 1 },
                },
                { $skip: skip },
                { $limit: pageSize },
            ];
            const workers = yield worker_model_1.WorkerModel.aggregate(pipeline);
            const countPipeline = [
                {
                    $geoNear: {
                        near: {
                            type: 'Point',
                            coordinates: [lng, lat],
                        },
                        distanceField: 'distance',
                        spherical: true,
                        maxDistance,
                        query: {
                            category: serviceObjectId,
                            isVerified: 'approved',
                        },
                    },
                },
                { $count: 'totalCount' },
            ];
            const count = yield worker_model_1.WorkerModel.aggregate(countPipeline);
            return {
                workers,
                totalCount: ((_a = count[0]) === null || _a === void 0 ? void 0 : _a.totalCount) || 0,
            };
        });
    }
};
exports.WorkerAggregation = WorkerAggregation;
exports.WorkerAggregation = WorkerAggregation = __decorate([
    (0, inversify_1.injectable)(),
    __metadata("design:paramtypes", [])
], WorkerAggregation);
