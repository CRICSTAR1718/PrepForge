import api from "./api";

// Generate a new plan (calls OpenAI on the backend)
export const createPlan = async (domain, durationDays) => {
    const { data } = await api.post("/plans", { domain, durationDays });
    return data.plan;
};

// Fetch a plan by ID
export const getPlanById = async (planId) => {
    const { data } = await api.get(`/plans/${planId}`);
    return data.plan;
};

// Fetch the current user's active plan
export const getMyPlan = async () => {
    const { data } = await api.get("/plans/my");
    return data.plan;
};
