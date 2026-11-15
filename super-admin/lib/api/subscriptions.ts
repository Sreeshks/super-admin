import { apiClient } from "./client";
import {
  StandardResponse,
  SubscriptionPlan,
  SubscriptionPlanCreate,
  SubscriptionPlanUpdate,
  TenantSubscription,
} from "@/types";

export const subscriptionsApi = {
  listPlans: async (includeInactive = false): Promise<SubscriptionPlan[]> => {
    const res = await apiClient.get<StandardResponse<SubscriptionPlan[]>>(
      "/console/subscriptions/plans",
      {
        params: { include_inactive: includeInactive },
      }
    );
    return res.data.data;
  },

  createPlan: async (payload: SubscriptionPlanCreate): Promise<SubscriptionPlan> => {
    const res = await apiClient.post<StandardResponse<SubscriptionPlan>>(
      "/console/subscriptions/plans",
      payload
    );
    return res.data.data;
  },

  updatePlan: async (
    id: string,
    payload: SubscriptionPlanUpdate
  ): Promise<SubscriptionPlan> => {
    const res = await apiClient.put<StandardResponse<SubscriptionPlan>>(
      `/console/subscriptions/plans/${id}`,
      payload
    );
    return res.data.data;
  },

  deletePlan: async (id: string): Promise<void> => {
    await apiClient.delete(`/console/subscriptions/plans/${id}`);
  },

  assignPlan: async (payload: {
    tenant_id: string;
    plan_id: string;
    auto_renew?: boolean;
    duration_months?: number;
  }): Promise<TenantSubscription> => {
    const res = await apiClient.post<StandardResponse<TenantSubscription>>(
      "/console/subscriptions/assign",
      payload
    );
    return res.data.data;
  },
};

