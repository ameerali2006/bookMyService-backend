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
exports.ServiceRepository = void 0;
const service_model_1 = require("../../model/service.model");
const base_repository_1 = require("../shared/base.repository");
class ServiceRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(service_model_1.ServiceModel);
    }
    findActiveServices() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.find({ status: 'active' });
        });
    }
    findByCategory(category) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.find({ category: { $regex: `^${category.trim()}$`, $options: 'i' }, });
        });
    }
    findActiveServicesByIds(ids) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.find({ _id: { $in: ids }, status: 'active' });
        });
    }
}
exports.ServiceRepository = ServiceRepository;
