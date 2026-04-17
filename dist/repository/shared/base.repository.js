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
exports.BaseRepository = void 0;
class BaseRepository {
    constructor(model) {
        this.model = model;
    }
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const newRecord = new this.model(data);
            return yield newRecord.save();
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.findById(id);
        });
    }
    findAll() {
        return __awaiter(this, arguments, void 0, function* (filter = {}, skip = 0, limit = 10, sort = {}) {
            const [items, total] = yield Promise.all([
                this.model.find(filter).sort(sort).skip(skip).limit(limit)
                    .lean(),
                this.model.countDocuments(filter),
            ]);
            return { items, total };
        });
    }
    updateById(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.findByIdAndUpdate(id, data, { new: true });
        });
    }
    deleteById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.findByIdAndDelete(id);
        });
    }
    findOne(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.findOne(query);
        });
    }
    find(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.find(query);
        });
    }
    update(filter, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.model
                .findOneAndUpdate(filter, updateData, { new: true })
                .lean();
        });
    }
    countDocuments() {
        return __awaiter(this, arguments, void 0, function* (filter = {}) {
            return yield this.model.countDocuments(filter);
        });
    }
    findWithPopulate(filter_1, populateFields_1) {
        return __awaiter(this, arguments, void 0, function* (filter, populateFields, skip = 0, limit = 10) {
            const total = yield this.model.countDocuments(filter);
            let query = this.model.find(filter).skip(skip).limit(limit);
            for (const { path, select, match } of populateFields) {
                query = query.populate(path, select, match);
            }
            const data = (yield query.lean());
            return { data, total };
        });
    }
    findByIdAndPopulate(id_1) {
        return __awaiter(this, arguments, void 0, function* (id, populateFields = []) {
            let query = this.model.findById(id);
            for (const { path, select, match } of populateFields) {
                query = query.populate(path, select, match);
            }
            const data = (yield query.lean());
            return data;
        });
    }
}
exports.BaseRepository = BaseRepository;
