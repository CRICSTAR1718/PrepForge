// client/src/services/logService.js
// All API calls related to daily logs

import api from './api.js';


// Get or create today's log
export async function getTodayLog() {
    const res = await api.get('/logs/today');
    // Return both the log AND the planDay so useTracker can store them separately
    return { log: res.data.data, planDay: res.data.planDay };
}

// Save draft
export async function saveDraft(logId, payload) {
    const res = await api.put(`/logs/${logId}`, payload);
    return res.data.data;
}

// Submit the log
export async function submitLog(logId) {
    const res = await api.post(`/logs/${logId}/submit`);
    return res.data.data;
}

// Get a single log by ID — used for polling
export async function getLogById(logId) {
    const res = await api.get(`/logs/${logId}`);
    return res.data.data;
}

export async function getLatestEvaluation() {
    const res = await api.get("/logs/latest-evaluation");
    return res.data.data;
}

// Get all submitted logs for dashboard
export async function getAllLogs() {
    const res = await api.get('/logs');
    return res.data.data;
}

