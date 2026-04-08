export interface IAdminDashboardRaw {
  bookingStats: {
    totalBookings: number;
    completedBookings: number;
    cancelledBookings: number;
  }[];

  totalRevenue: {
    revenue: number;
  }[];

  revenueChart: {
    _id: {
      year: number;
      month: number;
    };
    revenue: number;
  }[];

  serviceDistribution: {
    service: string; // serviceId
    count: number;
  }[];

  currentMonth: {
    count: number;
  }[];

  lastMonth: {
    count: number;
  }[];
}

export interface IAdminDashboardResponse {
  stats: {
    totalBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    totalRevenue: number;
    activeServices: number;
    approvedWorkers: number;
    totalUsers: number;

    bookingGrowth: number;
    revenueGrowth: number;
  };

  revenueChart: {
    month: string;
    revenue: number;
  }[];

  serviceDistribution: {
    service: string;
    count: number;
  }[];
}
