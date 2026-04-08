import type { Server as IOServer } from 'socket.io';
import { IBookingPopulated } from '../model/booking.model.interface';
import { IWorker } from '../model/worker.model.interface';

export interface IBookingSocketHandler {
  emitBookingToWorker(
    io: IOServer,
    onlineWorkers: Map<string, { socketId: string; userType: string }>,
    workerId: IWorker,
    booking: IBookingPopulated
  ): Promise<void>;
}
