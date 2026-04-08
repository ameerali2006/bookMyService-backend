import type { Server as IOServer } from 'socket.io';
import { inject, injectable } from 'tsyringe';
import { IBookingService } from '../../interface/service/services/booking-service.sevice.interface';

import { CustomSocket } from '../../types/socket';

import { TYPES } from '../../config/constants/types';
import { IBookingDetailsDTO } from '../../dto/shared/booking.dto';
import { IBookingRepository } from '../../interface/repository/booking.repository.interface';
import { ISocketHandler } from '../../interface/service/socket-handler.service.interface';
import { IBooking, IBookingPopulated } from '../../interface/model/booking.model.interface';
import { IWorker } from '../../interface/model/worker.model.interface';
import { WorkerMapper } from '../../utils/mapper/worker-mapper';
import { IWorkerHelperService } from '../../interface/service/helper-service.service.interface';

@injectable()
export class BookingSocketHandler implements ISocketHandler {
  constructor(
    @inject(TYPES.BookingService) private _bookingUseCase: IBookingService,
    @inject(TYPES.BookingRepository) private _bookingRepo:IBookingRepository,
    @inject(TYPES.WorkerHelperService) private _workerHelper:IWorkerHelperService,

  ) {}

  public registerEvents(io: IOServer, onlineWorkers: Map<string, { socketId: string; userType: string }>) {
    io.on('connection', (socket) => {
      const customSocket = socket as CustomSocket;
      if (customSocket.userType !== 'Worker') return;

      console.log(`⚙️ Registering BookingSocket for worker ${customSocket.userId}`);

      socket.on('get-pending-bookings', async () => {
        const pending = await this._bookingRepo.findPendingAdvanceBookings(customSocket.userId);
        console.log(pending);
        if (pending.length) socket.emit('receive-pending-bookings', pending);
      });

      socket.on('submit-worker-details', async (data: IBookingDetailsDTO) => {
        const updated = await this._bookingUseCase.updateWorkerDetails({
          ...data,
          workerId: customSocket.userId,
        });
        console.log(`✅ Worker ${customSocket.userId} submitted details for booking ${data.bookingId}`);
      });
    });
  }

  public async emitBookingToWorker(
    io: IOServer,
    onlineWorkers: Map<string, { socketId: string; userType: string }>,
    workerId: IWorker,
    booking: IBookingPopulated,

  ) {
    const worker = onlineWorkers.get(workerId._id.toString());
    if (worker) {
      console.log(booking);
      const service = WorkerMapper.serviceRequest(booking);
      const nextAvailable = await this._workerHelper.getWorkerAvailableTime(
        booking.workerId._id.toString(),
        booking.date,
        booking.startTime,
      );
      console.log({ ...service, availableTime: nextAvailable.availableTime });
      io.to(worker.socketId).emit('receive-pending-booking', { ...service, availableTime: nextAvailable.availableTime });
      console.log(booking);
      console.log(`📨 Booking emitted to worker ${workerId}`);
    } else {
      console.log(`🕓 Worker ${workerId} offline. Booking stored for later.`);
    }
  }
}
