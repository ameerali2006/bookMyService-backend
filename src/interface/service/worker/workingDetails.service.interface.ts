import {
  getCalenderDetailsResponseDto, getProfileDetailsResponseDto, updateCalenderDetailsResponseDto, updateWorkerProfileResponseDto, updateWorkingDetailsResponseDto, WorkerProfileDTO,
} from '../../../dto/worker/working-details.dto';
import {
  ICustomSlot, IDaySchedule, IHoliday, IWorkingDetailsDocument,
} from '../../model/working-details.interface';

export interface updateWorker{
  name: string
  phone: string
  description:string
  skills:string[]
  experience:'0-1' | '2-5' | '6-10' | '10+'
  fees: number
  image:string
}
export interface IWorkingDetailsManagement{
    updateWorkingDetails(email:string, payload:IDaySchedule):Promise<updateWorkingDetailsResponseDto>
    getWorkingDetails(email: string): Promise<IWorkingDetailsDocument>
    getProfileDetails(workerId: string): Promise<getProfileDetailsResponseDto>
    updateWorkerProfile(workerId: string, updateData:Partial<updateWorker>): Promise<updateWorkerProfileResponseDto>
    getCalenderDetails(workerId: string): Promise<getCalenderDetailsResponseDto>
    updateCalenderDetails(workerId: string, customSlots:ICustomSlot[], holidays:IHoliday[]): Promise<updateCalenderDetailsResponseDto>

}
