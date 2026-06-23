import { Document, FilterQuery } from 'mongoose';

export interface IBaseRepository<T extends Document> {
  create(data: Partial<T>): Promise<T>;
  findById(id: string): Promise<T | null>;
  findAll(
    filter?: FilterQuery<T>,
    skip?: number,
    limit?: number,
    sort?: Record<string, 1 | -1>
  ): Promise<{ items: T[]; total: number }>;
  updateById(id: string, data: Partial<T>): Promise<T | null>;
  deleteById(id: string): Promise<T | null>;
  findOne(query: FilterQuery<T>): Promise<T | null>;
  find(query: FilterQuery<T>): Promise<T[]>;
  update(filter: FilterQuery<T>, updateData: Partial<T>): Promise<T>;
  findWithPopulate<TReturn = T>(
    filter: FilterQuery<T>,
    populateFields: { path: string; select?: string; match?: FilterQuery<unknown> }[],
    skip?: number,
    limit?: number
  ): Promise<{ data: TReturn[]; total: number }>;
  findByIdAndPopulate<TReturn = T>(
    id: string,
    populateFields: { path: string; select?: string; match?: FilterQuery<unknown> }[]
  ): Promise<TReturn | null>
  countDocuments(filter?: FilterQuery<T>): Promise<number>
}
