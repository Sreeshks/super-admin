import { apiClient } from "./client";
import { AuditLog, DashboardStats, StandardResponse } from "@/types";

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const res = await apiClient.get<StandardResponse<DashboardStats>>("/console/dashboard/stats");
    return res.data.data;
  },

  getRecentActivity: async (limit = 20): Promise<AuditLog[]> => {
    const res = await apiClient.get<StandardResponse<AuditLog[]>>(
      `/console/dashboard/recent-activity?limit=${limit}`
    );
    return res.data.data;
  },
};

