import { IWorkingDetails } from '../model/working-details.interface';

export interface IWorkingHelper{
    rotateDayShedule(workingId: string): Promise<IWorkingDetails | null>
}
