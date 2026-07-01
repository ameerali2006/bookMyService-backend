import { injectable } from 'tsyringe';
import { Types } from 'mongoose';
import { BaseRepository } from '../shared/base.repository';
import { Booking } from '../../model/booking.model';
import { IBooking, IBookingPopulated } from '../../interface/model/booking.model.interface';
import { IWorkerEarningsRepository, IEarningsListQuery } from '../../interface/repository/worker-earnings.repository.interface';

@injectable()
export class WorkerEarningsRepository
  extends BaseRepository<IBooking>
  implements IWorkerEarningsRepository {
  constructor() {
    super(Booking);
  }

  async findEarningsSummary(workerId: string): Promise<IBooking[]> {
    return await Booking.find({
      workerId: new Types.ObjectId(workerId),
      status: 'completed',
      finalPaymentStatus: 'paid',
      advancePaymentStatus: { $ne: 'refunded' },
    }).populate('userId serviceId');
  }

  async findEarningsList(
    workerId: string,
    query: IEarningsListQuery,
  ): Promise<{ bookings: IBookingPopulated[]; total: number }> {
    const { page, limit, from, to, search } = query;
    const skip = (page - 1) * limit;

    const match: any = {
      workerId: new Types.ObjectId(workerId),
      status: 'completed',
      finalPaymentStatus: 'paid',
      advancePaymentStatus: { $ne: 'refunded' },
    };

    if (from || to) {
      match.date = {};
      if (from) {
        match.date.$gte = new Date(from);
      }
      if (to) {
        match.date.$lte = new Date(to);
      }
    }

    const pipeline: any[] = [
      { $match: match },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userId',
        },
      },
      { $unwind: '$userId' },
      {
        $lookup: {
          from: 'services',
          localField: 'serviceId',
          foreignField: '_id',
          as: 'serviceId',
        },
      },
      { $unwind: '$serviceId' },
      {
        $lookup: {
          from: 'addresses',
          localField: 'address',
          foreignField: '_id',
          as: 'address',
        },
      },
      {
        $unwind: {
          path: '$address',
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      pipeline.push({
        $match: {
          $or: [
            { 'userId.name': { $regex: searchRegex } },
            { 'serviceId.name': { $regex: searchRegex } },
          ],
        },
      });
    }

    // Get total count
    const countPipeline = [...pipeline, { $count: 'total' }];
    const countResult = await Booking.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    // Get paginated data
    pipeline.push(
      { $sort: { date: -1, createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    );

    const bookings = (await Booking.aggregate(pipeline)) as IBookingPopulated[];

    return { bookings, total };
  }
}
