import { Server as IOServer, Socket } from 'socket.io';
import { IBookingPopulated } from '../model/booking.model.interface';
import { IWorker } from '../model/worker.model.interface';

export interface ISocketHandler {
  registerEvents(io: IOServer, onlineUsers: Map<string, { socketId: string; userType: string }>): void;
  // emitBookingToWorker(
  //     io: IOServer,
  //     onlineWorkers: Map<string, { socketId: string; userType: string }>,
  //     workerId: IWorker,
  //     booking: IBookingPopulated,

  //   ):Promise<void>
}
