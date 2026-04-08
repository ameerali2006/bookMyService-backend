import { NextFunction, Request, Response } from 'express';

export interface IWorkerBookingController{
    approveService(req: Request, res: Response, next: NextFunction): Promise<void>
    rejectService(req: Request, res: Response, next: NextFunction): Promise<void>
    getServiceRequests(req: Request, res: Response, next: NextFunction): Promise<void>
    getServiceApprovals(req: Request, res: Response, next: NextFunction): Promise<void>
    getApprovalsDetails(req: Request, res: Response, next: NextFunction): Promise<void>
    reachLocation(req: Request, res: Response, next: NextFunction): Promise<void>
    verifyWorker(req: Request, res: Response, next: NextFunction): Promise<void>
    workComplated(req: Request, res: Response, next: NextFunction): Promise<void>
    allBookings(req: Request, res: Response, next: NextFunction): Promise<void>
}
