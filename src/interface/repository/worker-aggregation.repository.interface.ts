import { IWorkerListItem } from '../../dto/user/worker-listing-home.dto';
import { IWorker } from '../model/worker.model.interface';

export interface IWorkerAggregation{
    findNearbyWorkers(lat: number, lng: number, maxDistance: number):Promise<{_id:string, workers:IWorker[]}[]>
    findNearbyWorkersByServiceId(
  serviceId: string,
  lat: number,
  lng: number,
  search: string,
  sort: string,
  page: number,
  pageSize: number
): Promise<{
  workers: IWorkerListItem[]
  totalCount: number
}>
}
