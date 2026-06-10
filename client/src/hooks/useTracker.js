// client/src/hooks/useTracker.js

import { useState, useEffect, useRef, useCallback } from 'react';
import { getTodayLog, saveDraft, submitLog, getLogById } from '../services/logService.js';
import { useDebounce } from './useDebounce.js';

export function useTracker() {
    const [log, setLog] = useState(null);
    const [planDay, setPlanDay] = useState(null);       // ← NEW: today's plan data
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitDone, setSubmitDone] = useState(false); // ← NEW: replaces polling flag for UI
    const [error, setError] = useState(null);

    const pollIntervalRef = useRef(null);
    const lastSavedFormRef = useRef(null);

    const [formState, setFormState] = useState({
        tasksCompleted: [],
        timeSpentMinutes: 0,
        notes: '',
        difficultyRating: 3,
    });

    const stopPolling = useCallback(() => {
        if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
        }
    }, []);

    const startPolling = useCallback((logId) => {
        stopPolling();
        pollIntervalRef.current = setInterval(async () => {
            try {
                const updated = await getLogById(logId);
                setLog(updated);
                if (!updated.evaluationPending) {
                    stopPolling();
                }
            } catch {
                // continue polling on transient errors
            }
        }, 2000);
    }, [stopPolling]);

    // ── Load today's log on mount ──────────────────────────────────────────────
    useEffect(() => {
        async function loadLog() {
            try {
                setLoading(true);
                const { log: data, planDay: pd } = await getTodayLog(); // ← destructure both
                const initialFormState = {
                    tasksCompleted: data.tasksCompleted || [],
                    timeSpentMinutes: data.timeSpentMinutes || 0,
                    notes: data.notes || '',
                    difficultyRating: data.difficultyRating || 3,
                };

                setLog(data);
                setPlanDay(pd);
                setFormState(initialFormState);
                lastSavedFormRef.current = JSON.stringify(initialFormState);

                // If already submitted today, mark done and resume polling if pending
                if (data.submitted) {
                    setSubmitDone(true);
                    if (data.evaluationPending) {
                        startPolling(data._id);
                    }
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load today\'s log');
            } finally {
                setLoading(false);
            }
        }
        loadLog();
        return () => stopPolling();
    }, [startPolling, stopPolling]);

    const debouncedFormState = useDebounce(formState, 1500);

    // Auto-save on debounced change
    useEffect(() => {
        if (!log || log.submitted || loading) return;
        const serializedForm = JSON.stringify(debouncedFormState);
        if (serializedForm === lastSavedFormRef.current) return;

        async function autoSave() {
            try {
                setSaving(true);
                const updated = await saveDraft(log._id, debouncedFormState);
                setLog(updated);
                lastSavedFormRef.current = serializedForm;
            } catch {
                // silent fail
            } finally {
                setSaving(false);
            }
        }
        autoSave();
    }, [debouncedFormState, loading, log]);

    // ── Field handlers — named to match TrackerForm props ─────────────────────
    const toggleTask = useCallback((task) => {
        setFormState((prev) => {
            const already = prev.tasksCompleted.includes(task);
            return {
                ...prev,
                tasksCompleted: already
                    ? prev.tasksCompleted.filter((t) => t !== task)
                    : [...prev.tasksCompleted, task],
            };
        });
    }, []);

    const handleTimeChange = useCallback((minutes) => {    // ← matches TrackerForm
        setFormState((prev) => ({ ...prev, timeSpentMinutes: Number(minutes) }));
    }, []);

    const handleNotesChange = useCallback((notes) => {     // ← matches TrackerForm
        setFormState((prev) => ({ ...prev, notes }));
    }, []);

    const handleDifficultyChange = useCallback((rating) => { // ← matches TrackerForm
        setFormState((prev) => ({ ...prev, difficultyRating: Number(rating) }));
    }, []);

    // ── Submit ─────────────────────────────────────────────────────────────────
    const handleSubmit = useCallback(async () => {
        if (!log || log.submitted) return;
        try {
            setSubmitting(true);
            setError(null);

            await saveDraft(log._id, formState);
            lastSavedFormRef.current = JSON.stringify(formState);
            const submitted = await submitLog(log._id);
            setLog(submitted);
            setSubmitDone(true);       // ← tells Tracker.jsx to show the banner + button
            startPolling(submitted._id);
        } catch (err) {
            setError(err.response?.data?.message || 'Submission failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    }, [log, formState, startPolling]);

    // ── Return — all names match what Tracker.jsx + TrackerForm.jsx expect ─────
    return {
        log,
        planDay,               // ← used by Tracker.jsx header and TrackerForm
        loading,
        saving,
        submitting,
        submitDone,            // ← used by Tracker.jsx banner and TrackerForm submit button
        error,
        // form state
        tasksCompleted: formState.tasksCompleted,
        timeSpentMinutes: formState.timeSpentMinutes,
        notes: formState.notes,
        difficultyRating: formState.difficultyRating,
        // handlers — names match TrackerForm props exactly
        toggleTask,
        handleTimeChange,
        handleNotesChange,
        handleDifficultyChange,
        handleSubmit,
    };
}
