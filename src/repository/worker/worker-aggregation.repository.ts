import { injectable } from 'inversify';
import { Types } from 'mongoose';
import { WorkerModel } from '../../model/worker.model';
import { BaseRepository } from '../shared/base.repository';
import { IWorker } from '../../interface/model/worker.model.interface';
import { IWorkerAggregation } from '../../interface/repository/worker-aggregation.repository.interface';
import { IWorkerListItem } from '../../dto/user/worker-listing-home.dto';

@injectable()
export class WorkerAggregation
  extends BaseRepository<IWorker>
  implements IWorkerAggregation {
  constructor() {
    super(WorkerModel);
  }

  async findNearbyWorkers(lat: number, lng: number, maxDistance: number) {
    return WorkerModel.aggregate([
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
  }

  async findNearbyWorkersByServiceId(
    serviceId: string,
    lat: number,
    lng: number,
    search: string,
    sort: string,
    page: number,
    pageSize: number,
    maxDistance: number = 20000,
  ): Promise<{ workers: IWorkerListItem[]; totalCount: number }> {
    const skip = (page - 1) * pageSize;
    const serviceObjectId = new Types.ObjectId(serviceId);

    const pipeline: any[] = [
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [lng, lat] },
          distanceField: 'distance',
          spherical: true,
          maxDistance,
          query: {
            category: serviceObjectId,
            isVerified: 'approved',
            ...(search && { name: { $regex: search, $options: 'i' } }),
          },
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
        $sort:
          sort === 'rating'
            ? { avgRating: -1 }
            : sort === 'price'
              ? { fees: 1 }
              : { distance: 1 },
      },

      { $skip: skip },
      { $limit: pageSize },
    ];

    const workers = await WorkerModel.aggregate(pipeline);

    const countPipeline = [
      {
        $geoNear: {
          near: {
            type: 'Point' as const,
            coordinates: [lng, lat] as [number, number],
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

    const count = await WorkerModel.aggregate(countPipeline);

    return {
      workers,
      totalCount: count[0]?.totalCount || 0,
    };
  }
}
