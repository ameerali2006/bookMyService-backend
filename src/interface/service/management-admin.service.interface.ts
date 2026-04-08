import { IAdminDashboardResponse } from '../../dto/admin/admin-dashboard.dto';
import {
  AdminBookingDto,
  IbookingDetailPageResponse,
  serviceCreateDto, serviceManageDto, userManageDto, workerManageDto,
} from '../../dto/admin/management.dto';
import {
  getAllBookingsResponse, getAllServicesResponse, getAllUsersResponse, getUnverifiedWorkersResponse, serviceRegisterResponse, updateServiceStatusResponse, verifyWorkerResponse,
} from '../../dto/shared/helpers.dto';
import { IUser } from '../model/user.model.interface';
import { IWorker } from '../model/worker.model.interface';

export interface IManagementAdminService{

    getAllUsers(role:'worker'|'user', page:number, limit:number, search:string, sortBy:string, sortOrder:string): Promise<getAllUsersResponse>;
    updateStatus(userId:string, status:boolean, role:'worker'|'user'):Promise<IUser|IWorker|null>
    verifyWorker(userId:string, status:'approved'|'rejected'):Promise<verifyWorkerResponse>
    getUnverifiedWorkers(page:number, pageSize:number, status:string):Promise<getUnverifiedWorkersResponse>
    getAllServices(search:string, sort:string, page:number, limit:number,): Promise<getAllServicesResponse>;
    serviceRegister(data:serviceCreateDto):Promise<serviceRegisterResponse>
    updateServiceStatus(serviceId:string, status:'inactive' |'active'):Promise<updateServiceStatusResponse>
    getAllBookings(search:string, status:string, limit:number, page:number):Promise<getAllBookingsResponse>
    getBookingDetail(bookingId:string):Promise<IbookingDetailPageResponse>
    getDashboard(): Promise<{success:boolean, message:string, data:IAdminDashboardResponse}>
}
