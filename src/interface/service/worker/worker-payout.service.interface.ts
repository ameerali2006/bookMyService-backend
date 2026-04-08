export interface IWorkerPayoutService {
  processPayouts(): Promise<void>;
}
