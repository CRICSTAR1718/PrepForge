import api from "./api.js";

// GET /api/logs/today — fetch or create today's log + planDay
export const getTodayLog = async () => {
    const res = await api.get("/logs/today");
    return res.data; // { success, data: log, planDay }
};

// PUT /api/logs/:id — save draft (partial update)
export const saveDraft = async (id, payload) => {
    const res = await api.put(`/logs/${id}`, payload);
    return res.data; // { success, data: log }
};

// POST /api/logs/:id/submit — lock in the log
export const submitLog = async (id) => {
    const res = await api.post(`/logs/${id}/submit`);
    return res.data; // { success, data: log }
};

// GET /api/logs — all logs for dashboard
export const getAllLogs = async () => {
    const res = await api.get("/logs");
    return res.data; // { success, data: logs[] }
};