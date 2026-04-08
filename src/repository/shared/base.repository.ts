import { Model, Document, FilterQuery } from 'mongoose';
import { IBaseRepository } from '../../interface/repository/base.repository.interface';

export class BaseRepository<T extends Document> implements IBaseRepository<T> {
  private model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async create(data: Partial<T>): Promise<T> {
    const newRecord = new this.model(data);
    return await newRecord.save();
  }

  async findById(id: string): Promise<T | null> {
    return await this.model.findById(id);
  }

  async findAll(filter: FilterQuery<T> = {}, skip = 0, limit = 10, sort: Record<string, 1 | -1> = {}) {
    const [items, total] = await Promise.all([
      this.model.find(filter).sort(sort).skip(skip).limit(limit)
        .lean() as Promise<T[]>,
      this.model.countDocuments(filter),
    ]);
    return { items, total };
  }

  async updateById(id: string, data: Partial<T>): Promise<T | null> {
    return await this.model.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteById(id: string): Promise<T | null> {
    return await this.model.findByIdAndDelete(id);
  }

  async findOne(query: any): Promise<T | null> {
    return await this.model.findOne(query);
  }

  async find(query: any): Promise<T[]> {
    return await this.model.find(query);
  }

  async update(filter: FilterQuery<T>, updateData: Partial<T>) {
    return this.model
      .findOneAndUpdate(filter, updateData, { new: true })
      .lean() as Promise<T>;
  }

  async countDocuments(filter: FilterQuery<T> = {}): Promise<number> {
    return await this.model.countDocuments(filter);
  }

  async findWithPopulate<TReturn = T>(
    filter: FilterQuery<T>,
    populateFields: { path: string; select?: string; match?: any }[],
    skip: number = 0,
    limit: number = 10,
  ): Promise<{ data: TReturn[]; total: number }> {
    const total = await this.model.countDocuments(filter);
    let query = this.model.find(filter).skip(skip).limit(limit);
    for (const { path, select, match } of populateFields) {
      query = query.populate(path, select, match);
    }
    const data = (await query.lean()) as TReturn[];
    return { data, total };
  }

  async findByIdAndPopulate<TReturn = T>(
    id: string,
    populateFields: { path: string; select?: string; match?: any }[] = [],
  ): Promise<TReturn | null> {
    let query = this.model.findById(id);

    for (const { path, select, match } of populateFields) {
      query = query.populate(path, select, match);
    }

    const data = (await query.lean()) as TReturn | null;
    return data;
  }
}
