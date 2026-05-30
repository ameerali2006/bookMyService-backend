// src/repository/implementation/booking.repository.ts
import { injectable } from "tsyringe";
import { FilterQuery, Types } from "mongoose";
import {
  IBookingRepository,
  IWorkerDashboardRepoResult,
} from "../../interface/repository/booking.repository.interface";
import {
  IBooking,
  IBookingPopulated,
} from "../../interface/model/booking.model.interface";
import { BaseRepository } from "./base.repository";
import { Booking } from "../../model/booking.model";

import { IRequestFilters } from "../../interface/service/worker/worker-booking.service.interface";
import { PaymentStatus } from "../../interface/model/wallet.model.interface";
import { IAdminDashboardRaw } from "../../dto/admin/admin-dashboard.dto";
import { PipelineStage } from "mongoose";

@injectable()
export class BookingRepository
  extends BaseRepository<IBooking>
  implements IBookingRepository
{
  constructor() {
    super(Booking);
  }

  async createBooking(data: Partial<IBooking>): Promise<IBooking> {
    return await Booking.create(data);
  }

  async findByIdPopulated(id: string): Promise<IBookingPopulated | null> {
    const result = await Booking.findById(id)
      .populate("userId", "name email phone ")
      .populate("workerId", "name email phone category fees")
      .populate("serviceId", "category price")
      .populate("address")
      .populate("reviewId")
      .exec();

    return result as unknown as IBookingPopulated | null;
  }

  async findByUserId(userId: string): Promise<IBookingPopulated[]> {
    const result = await Booking.find({ userId })
      .sort({ createdAt: -1 })
      .populate("workerId", "name category")
      .populate("serviceId", "category price")
      .populate("address")
      .exec();

    return result as unknown as IBookingPopulated[];
  }

  async findByWorkerId(workerId: string): Promise<IBookingPopulated[]> {
    const result = await Booking.find({ workerId })
      .sort({ createdAt: -1 })
      .populate("userId", "name email phone")
      .populate("serviceId", "category price")
      .populate("address")
      .exec();

    return result as unknown as IBookingPopulated[];
  }

  async updateStatus(id: string, status: string): Promise<IBooking | null> {
    return await Booking.findByIdAndUpdate(id, { status }, { new: true });
  }

  async updateWorkerResponse(
    id: string,
    response: string,
  ): Promise<IBooking | null> {
    return await Booking.findByIdAndUpdate(
      id,
      { workerResponse: response },
      { new: true },
    );
  }

  async updateStatusWithOTP(
    id: string,
    status:
      | "pending"
      | "confirmed"
      | "in-progress"
      | "awaiting-final-payment"
      | "completed"
      | "cancelled",
  ): Promise<IBooking | null> {
    return await Booking.findByIdAndUpdate(
      id,
      { status, $unset: { otp: "" } },
      { new: true },
    );
  }

  async updatePaymentStatus(
    id: string,
    paymentStatus: string,
    paymentId?: string,
  ): Promise<IBooking | null> {
    return await Booking.findByIdAndUpdate(
      id,
      { paymentStatus, paymentId },
      { new: true },
    );
  }

  async addRating(
    id: string,
    score: number,
    review?: string,
  ): Promise<IBooking | null> {
    return await Booking.findByIdAndUpdate(
      id,
      { rating: { score, review }, status: "completed" },
      { new: true },
    );
  }

  async cancelBooking(id: string): Promise<IBooking | null> {
    return await Booking.findByIdAndUpdate(
      id,
      { status: "cancelled" },
      { new: true },
    );
  }

  async findByWorkerAndDate(workerId: string, date: Date): Promise<IBooking[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await Booking.find({
      workerId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: "cancelled" },
    })
      .select("startTime endTime date status")
      .lean();
  }

  async findBookingWithinTimeRange(
    workerId: string,
    date: Date,
    startTime: Date,
    endTime: Date,
  ): Promise<IBooking | null> {
    return await Booking.findOne({
      workerId,
      date: {
        $eq: new Date(new Date(date).toDateString()),
      },
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
      status: { $nin: ["cancelled", "completed"] },
    });
  }

  async findByIdWithDetails(id: string): Promise<IBooking | null> {
    return await Booking.findById(id)
      .populate("workerId", "name")
      .populate("serviceId", "category")
      .populate("userId", "name");
  }

  async findByWorkerAndRange(
    workerId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<
    Array<{
      date: Date;
      startTime: string;
      endTime?: string | null;
      advancePaymentStatus?: "unpaid" | "paid" | "failed" | "refunded";
    }>
  > {
    return Booking.find(
      {
        workerId,
        date: { $gte: startDate, $lt: endDate },
        status: { $ne: "cancelled" },
      },
      {
        date: 1,
        startTime: 1,
        endTime: 1,
        advancePaymentStatus: 1,
        _id: 0,
      },
    )
      .sort({ date: 1, startTime: 1 })
      .lean();
  }

  async updateAdvancePaymentStatus(
    bookingId: string,
    paymentIntentId: string,
    status: PaymentStatus,
    addressId: string,
  ): Promise<IBooking | null> {
    return await Booking.findByIdAndUpdate(bookingId, {
      advancePaymentId: paymentIntentId,
      advancePaymentStatus: status === "succeeded" ? "paid" : status,
      status: status === "succeeded" ? "confirmed" : "pending",
      address: addressId,
      totalAmount: 100,
    });
  }

  async updateFinalPaymentStatus(
    bookingId: string,
    paymentIntentId: string,
    status: PaymentStatus,
  ): Promise<IBooking | null> {
    return await Booking.findByIdAndUpdate(bookingId, {
      finalPaymentId: paymentIntentId,
      finalPaymentStatus: status === "succeeded" ? "paid" : status,
      status: status === "succeeded" ? "completed" : "awaiting-final-payment",
      remainingAmount: status === "succeeded" ? 0 : undefined,
    });
  }

  async findPendingAdvanceBookings(workerId: string): Promise<IBooking[]> {
    return await Booking.find({
      workerId,
      advancePaymentStatus: "succeeded",
      workerResponse: "pending",
    }).populate("userId serviceId workerId");
  }

  async findUnsettledCompleted(): Promise<IBooking[]> {
    return await Booking.find({
      status: "completed",
      finalPaymentStatus: "paid",
      $or: [{ isSettled: false }, { isSettled: { $exists: false } }],
    });
  }

  async markAsSettled(ids: string[]): Promise<void> {
    const objectIds = ids.map((id) => new Types.ObjectId(id));

    await Booking.updateMany(
      { _id: { $in: objectIds } },
      {
        $set: {
          isSettled: true,
          updatedAt: new Date(),
        },
      },
    );
  }

  async findServiceRequests(
    filters: IRequestFilters,
  ): Promise<{ data: IBookingPopulated[]; total: number }> {
    const { workerId, search, status, page, limit } = filters;

    // ✅ Start of today (00:00)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const query: Record<string, unknown> = {
      workerId,
      date: { $gte: todayStart }, // ✅ only upcoming from today
    };

    if (status) query.workerResponse = status;

    if (search) {
      query.$or = [{ "userId.name": { $regex: search, $options: "i" } }];
    }

    const skip = (page - 1) * limit;

    const booking = await Booking.find(query)
      .populate("userId", "name phone")
      .populate("serviceId", "category")
      .populate("workerId", "name")
      .populate("address")
      .sort({ date: 1 }) // ✅ nearest upcoming first
      .skip(skip)
      .limit(limit)
      .lean<IBookingPopulated[]>()
      .exec();

    const total = await Booking.countDocuments(query);

    return { data: booking, total };
  }

  async findBookingListByUserId(
    userId: string,
    status: string[] = [],
    workerResponse: string[] = [],
    limit: number,
    skip: number,
    search: string,
  ): Promise<{ bookings: IBookingPopulated[] | null; total: number }> {
    const query: FilterQuery<IBooking> = {};
    query.userId = userId;
    if (status.length > 0) {
      query.status = { $in: status };
    }
    if (workerResponse.length) {
      query.workerResponse = { $in: workerResponse };
    }
    if (search && search.trim() !== "") {
      query.$or = [
        { "serviceId.category": { $regex: search, $options: "i" } },
        { "workerId.name": { $regex: search, $options: "i" } },
      ];
    }
    console.log(query);

    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate("workerId")
      .populate("serviceId")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean<IBookingPopulated[]>();
    console.log({ bookings, total });

    return { bookings, total };
  }

  async findWorkerApprovedBookings({
    workerId,
    page,
    limit,
    search,
    status,
  }: {
    workerId: string;
    page: number;
    limit: number;
    search?: string;
    status?: "approved" | "in-progress" | "awaiting-final-payment";
  }): Promise<{ items: IBookingPopulated[] | null; total: number }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const query: FilterQuery<IBooking> = {
      workerId,
      workerResponse: "accepted",
      status: status || {
        $in: ["confirmed", "in-progress", "awaiting-final-payment"],
      },
      date: { $gte: today },
    };

    if (search) {
      query.$or = [{ bookingId: { $regex: search, $options: "i" } }];
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Booking.find(query)
        .populate("userId", "name")
        .populate("serviceId", "name")
        .sort({ date: 1, startTime: 1 })
        .skip(skip)
        .limit(limit)
        .lean<IBookingPopulated[]>(),

      Booking.countDocuments(query),
    ]);

    return { items, total };
  }

  //   async getAllBookings(params: {
  //     search?: string;
  //     status?: string;
  //     service?: string;
  //     limit?: number;
  //     page?: number;
  //   }): Promise<{
  //     data: IBookingPopulated[];
  //     total: number;
  //     page: number;
  //     limit: number;
  //   }> {
  //     const { search, status, service, page = 1, limit = 10 } = params;

  //     const query: FilterQuery<IBooking> = {};

  //     // Status filter
  //     if (status && status !== "all") {
  //       query.status = status;
  //     }

  //     // Search filter
  //     if (search || service) {
  //       query.$or = [];
  //       console.log("Search is : ",search)
  //       // Global search
  //       if (search) {
  //         query.$or.push(
  //           { "userId.name": { $regex: search, $options: "i" } },
  //           { "workerId.name": { $regex: search, $options: "i" } },
  //           { "serviceId.category": { $regex: search, $options: "i" } },
  //         );
  //       }

  //       // Service filter

  //     }
  //     console.log("Query : ",query)
  //     const skip = (page - 1) * limit;

  //     const [data, total] = await Promise.all([
  //       Booking.find(query)
  //         .populate("userId")
  //         .populate("workerId")
  //         .populate("serviceId")
  //         .populate("address")
  //         .sort({ createdAt: -1 })
  //         .skip(skip)
  //         .limit(limit)
  //         .lean<IBookingPopulated[]>(),

  //       Booking.countDocuments(query),
  //     ]);
  // console.log("response : ", {
  //   data,
  //   total,
  //   page,
  //   limit,
  // })
  //     return {
  //       data,
  //       total,
  //       page,
  //       limit,
  //     };
  //   }

  async getAllBookings(params: {
    search?: string;
    status?: string;
    service?: string;
    limit?: number;
    page?: number;
  }): Promise<{
    data: IBookingPopulated[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { search = "", status, service, page = 1, limit = 10 } = params;

    const skip = (page - 1) * limit;

    // Base match stage
    const matchStage: Record<string, unknown> = {};

    if (status && status !== "all") {
      matchStage.status = status;
    }

    // Search conditions after lookup
    const searchConditions: Record<string, unknown>[] = [];

    if (search) {
      searchConditions.push(
        { "userId.name": { $regex: search, $options: "i" } },
        { "workerId.name": { $regex: search, $options: "i" } },
        { "serviceId.category": { $regex: search, $options: "i" } },
      );
    }

    // Separate service filter
    if (service) {
      searchConditions.push({
        "serviceId.category": { $regex: service, $options: "i" },
      });
    }

    // Aggregation pipeline
    const pipeline: PipelineStage[] = [
      // Match booking fields first
      { $match: matchStage },

      // Lookup user
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userId",
        },
      },
      {
        $unwind: {
          path: "$userId",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Lookup worker
      {
        $lookup: {
          from: "workers",
          localField: "workerId",
          foreignField: "_id",
          as: "workerId",
        },
      },
      {
        $unwind: {
          path: "$workerId",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Lookup service
      {
        $lookup: {
          from: "services",
          localField: "serviceId",
          foreignField: "_id",
          as: "serviceId",
        },
      },
      {
        $unwind: {
          path: "$serviceId",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Lookup address
      {
        $lookup: {
          from: "addresses",
          localField: "address",
          foreignField: "_id",
          as: "addressId",
        },
      },
      {
        $unwind: {
          path: "$addressId",
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    // Apply search after lookups
    if (searchConditions.length > 0) {
      pipeline.push({
        $match: {
          $or: searchConditions,
        },
      });
    }

    // Get paginated data and total count in one query
    pipeline.push({
      $facet: {
        data: [
          { $sort: { createdAt: -1 } },
          { $skip: skip },
          { $limit: limit },
        ],
        totalCount: [{ $count: "count" }],
      },
    });

    const result = await Booking.aggregate(pipeline);

    const data = (result[0]?.data || []) as IBookingPopulated[];
    const total = result[0]?.totalCount?.[0]?.count || 0;

    return {
      data,
      total,
      page,
      limit,
    };
  }
  async allBookingList(params: {
    workerId: string;
    page: number;
    limit: number;
    search?: string;
    statuses?: string[];
    workerResponses?: string[];
    from?: Date;
    to?: Date;
  }) {
    const {
      workerId,
      page,
      limit,
      search,
      statuses,
      workerResponses,
      from,
      to,
    } = params;

    const match: Record<string, any> = {
      workerId: new Types.ObjectId(workerId),
    };

    if (statuses?.length) {
      match.status = { $in: statuses };
    }

    if (workerResponses?.length) {
      match.workerResponse = { $in: workerResponses };
    }

    if (from || to) {
      match.date = {};

      if (from) {
        const start = new Date(from);
        start.setHours(0, 0, 0, 0);
        match.date.$gte = start;
      }

      if (to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        match.date.$lte = end;
      }
    }

    const searchMatch = search?.trim()
      ? {
          $or: [
            { "user.name": { $regex: search, $options: "i" } },
            { "service.category": { $regex: search, $options: "i" } },
            { "address.city": { $regex: search, $options: "i" } },
            { "address.street": { $regex: search, $options: "i" } },
            { "address.buildingName": { $regex: search, $options: "i" } },
            { "address.area": { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const skip = (page - 1) * limit;

    const pipeline: PipelineStage[] = [
      { $match: match },

      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $lookup: {
          from: "services",
          localField: "serviceId",
          foreignField: "_id",
          as: "service",
        },
      },
      {
        $unwind: {
          path: "$service",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $lookup: {
          from: "addresses",
          localField: "address",
          foreignField: "_id",
          as: "address",
        },
      },
      {
        $unwind: {
          path: "$address",
          preserveNullAndEmptyArrays: true,
        },
      },

      ...(search ? [{ $match: searchMatch }] : []),

      {
        $facet: {
          items: [
            { $sort: { date: -1, startTime: 1 } },
            { $skip: skip },
            { $limit: limit },
          ],
          total: [{ $count: "count" }],
        },
      },
      
    ];

    const result = await Booking.aggregate(pipeline);
    console.log(JSON.stringify(result[0], null, 2));

    return {
      items: result[0]?.items ?? [],
      total: result[0]?.total?.[0]?.count ?? 0,
    };
  }
  async getWorkerDashboardStats(
    workerId: string,
  ): Promise<IWorkerDashboardRepoResult> {
    const workerObjectId = new Types.ObjectId(workerId);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const monthStart = new Date(
      todayStart.getFullYear(),
      todayStart.getMonth(),
      1,
    );

    // 1️⃣ Total Jobs
    const totalJobs = await Booking.countDocuments({ workerId });

    // 2️⃣ Completed Jobs
    const completedJobs = await Booking.countDocuments({
      workerId,
      status: "completed",
    });

    // 3️⃣ Monthly Earnings
    const monthlyEarningsAgg = await Booking.aggregate([
      {
        $match: {
          workerId: workerObjectId,
          status: "completed",
          date: { $gte: monthStart },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
        },
      },
    ]);

    const monthlyEarnings = monthlyEarningsAgg[0]?.total || 0;

    // 4️⃣ Upcoming Jobs
    const upcomingJobs = await Booking.countDocuments({
      workerId,
      status: { $in: ["confirmed", "in-progress"] },
      date: { $gte: todayStart },
    });

    // 5️⃣ Rating Aggregation
    const ratingAgg = await Booking.aggregate([
      {
        $match: {
          workerId: workerObjectId,
          "rating.score": { $exists: true },
        },
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating.score" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    const avgRating = ratingAgg[0]?.avgRating || 0;
    const totalReviews = ratingAgg[0]?.totalReviews || 0;

    // 6️⃣ Today Schedule
    const todaySchedule = await Booking.find({
      workerId,
      date: { $gte: todayStart, $lte: todayEnd },
    })
      .populate("workerId")
      .populate("userId")
      .populate("serviceId")
      .populate("address")
      .lean<IBookingPopulated[]>();
    return {
      totalJobs,
      completedJobs,
      monthlyEarnings,
      upcomingJobs,
      avgRating,
      totalReviews,
      todaySchedule,
    };
  }

  async getDashboardRawData(): Promise<IAdminDashboardRaw[]> {
    const now = new Date();

    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    return Booking.aggregate([
      {
        $facet: {
          // 📊 Booking Stats
          bookingStats: [
            {
              $group: {
                _id: null,
                totalBookings: { $sum: 1 },
                completedBookings: {
                  $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
                },
                cancelledBookings: {
                  $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
                },
              },
            },
          ],

          // 💰 Revenue
          totalRevenue: [
            {
              $match: {
                status: "completed",
                finalPaymentStatus: "paid",
              },
            },
            {
              $group: {
                _id: null,
                revenue: { $sum: "$totalAmount" },
              },
            },
          ],

          // 📈 Monthly Revenue Chart (Last 6 Months)
          revenueChart: [
            {
              $match: {
                status: "completed",
                finalPaymentStatus: "paid",
              },
            },
            {
              $group: {
                _id: {
                  year: { $year: "$createdAt" },
                  month: { $month: "$createdAt" },
                },
                revenue: { $sum: "$totalAmount" },
              },
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
          ],

          // 🥧 Service Distribution
          serviceDistribution: [
            {
              $lookup: {
                from: "services",
                localField: "serviceId",
                foreignField: "_id",
                as: "service",
              },
            },
            { $unwind: "$service" },

            {
              $group: {
                _id: "$service.category",
                count: { $sum: 1 },
              },
            },

            {
              $project: {
                _id: 0,
                service: "$_id",
                count: 1,
              },
            },
          ],

          // 📅 Current Month
          currentMonth: [
            {
              $match: { createdAt: { $gte: startOfCurrentMonth } },
            },
            { $count: "count" },
          ],

          // 📅 Last Month
          lastMonth: [
            {
              $match: {
                createdAt: {
                  $gte: startOfLastMonth,
                  $lt: startOfCurrentMonth,
                },
              },
            },
            { $count: "count" },
          ],
        },
      },
    ]);
  }
}
