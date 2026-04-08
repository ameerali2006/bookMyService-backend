import { NextFunction, Request, Response } from 'express';

export interface IAdminManagementController {

    getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void>
    updateUserStatus(req: Request, res: Response, next: NextFunction): Promise<void>
    getAllWorkers(req: Request, res: Response, next: NextFunction): Promise<void>
    updateWorkerStatus(req: Request, res: Response, next: NextFunction): Promise<void>
    verifyWorker(req: Request, res: Response, next: NextFunction): Promise<void>
    unVerifiedWorkers(req: Request, res: Response, next: NextFunction): Promise<void>
    getAllServices(req: Request, res: Response, next: NextFunction): Promise<void>
    serviceRegister(req: Request, res: Response, next: NextFunction): Promise<void>
    updateServiceStatus(req: Request, res: Response, next: NextFunction): Promise<void>
    getBookings(req: Request, res: Response, next: NextFunction): Promise<void>
    getBookingDetailPage(req: Request, res: Response, next: NextFunction): Promise<void>
    getWalletData(req: Request, res: Response, next: NextFunction): Promise<void>
    getTransactions(req: Request, res: Response, next: NextFunction): Promise<void>
    getDashboard(req: Request, res: Response, next: NextFunction): Promise<void>

}
