import { injectable } from 'tsyringe';
import { Types } from 'mongoose';
import { BaseRepository } from './base.repository';
import { ChatModel } from '../../model/chat.model';
import { IChat } from '../../interface/model/chat.model.interface';
import { IChatRepository } from '../../interface/repository/chat.repository.interface';
import { ChatInboxDTO } from '../../dto/shared/chat.dto';

@injectable()
export class ChatRepository
  extends BaseRepository<IChat>
  implements IChatRepository {
  constructor() {
    super(ChatModel);
  }

  async createChat(data: Partial<IChat>): Promise<IChat> {
    return await ChatModel.create(data);
  }

  async findById(chatId: string): Promise<IChat | null> {
    return await ChatModel.findById(chatId);
  }

  async findByBookingId(bookingId: string): Promise<IChat | null> {
    return await ChatModel.findOne({ bookingId });
  }

  async findByUserAndWorker(
    userId: string,
    workerId: string,
  ): Promise<IChat | null> {
    return await ChatModel.findOne({ userId, workerId });
  }

  async getInboxWithAggregation(userId: string): Promise<ChatInboxDTO[]> {
    const objectUserId = new Types.ObjectId(userId);

    return await ChatModel.aggregate([
      {
        $match: {
          $or: [{ userId: objectUserId }, { workerId: objectUserId }],
        },
      },

      // 🔥 Last message
      {
        $lookup: {
          from: 'messages',
          let: { chatId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$chatId', '$$chatId'] },
              },
            },
            { $sort: { createdAt: -1 } },
            { $limit: 1 },
          ],
          as: 'lastMessage',
        },
      },
      { $unwind: { path: '$lastMessage', preserveNullAndEmptyArrays: true } },

      // 🔥 Unread count (correct readBy logic)
      {
        $lookup: {
          from: 'messages',
          let: { chatId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$chatId', '$$chatId'] },
                    { $ne: ['$senderId', objectUserId] },
                    {
                      $not: {
                        $in: [objectUserId, '$readBy'],
                      },
                    },
                  ],
                },
              },
            },
            { $count: 'count' },
          ],
          as: 'unread',
        },
      },

      // 🔥 User lookup
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },

      // 🔥 Worker lookup
      {
        $lookup: {
          from: 'workers',
          localField: 'workerId',
          foreignField: '_id',
          as: 'worker',
        },
      },
      { $unwind: '$worker' },

      // 🔥 Final projection
      {
        $project: {
          id: '$_id',

          participantId: {
            $cond: [
              { $eq: ['$userId', objectUserId] },
              '$worker._id',
              '$user._id',
            ],
          },

          participantName: {
            $cond: [
              { $eq: ['$userId', objectUserId] },
              '$worker.name',
              '$user.name',
            ],
          },

          participantAvatar: {
            $cond: [
              { $eq: ['$userId', objectUserId] },
              '$worker.profileImage', // ✅ fixed
              '$user.image', // ✅ fixed
            ],
          },

          lastMessage: '$lastMessage.content',
          lastMessageTime: '$lastMessage.createdAt',

          unreadCount: {
            $ifNull: [{ $arrayElemAt: ['$unread.count', 0] }, 0],
          },
        },
      },

      { $sort: { lastMessageTime: -1 } },
    ]);
  }
}
