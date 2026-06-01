import { useState, useEffect, useRef, useCallback } from "react";
import { getTodayLog, saveDraft, submitLog } from "../services/logService";

export const useTracker = () => {
    const [log, setLog] = useState(null);
    const [planDay, setPlanDay] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [submitDone, setSubmitDone] = useState(false);
    const [error, setError] = useState(null);

    // Form state — mirrors the log fields
    const [tasksCompleted, setTasksCompleted] = useState([]);
    const [timeSpentMinutes, setTimeSpentMinutes] = useState(0);
    const [notes, setNotes] = useState("");
    const [difficultyRating, setDifficultyRating] = useState(null);

    // Auto-save debounce ref
    const autoSaveTimer = useRef(null);
    const isDirty = useRef(false);

    // Load today's log on mount
    useEffect(() => {
        (async () => {
            try {
                const { data, planDay: pd } = await getTodayLog();
                setLog(data);
                setPlanDay(pd);
                // Pre-fill form from existing log
                setTasksCompleted(data.tasksCompleted || []);
                setTimeSpentMinutes(data.timeSpentMinutes || 0);
                setNotes(data.notes || "");
                setDifficultyRating(data.difficultyRating || null);
                if (data.submitted) setSubmitDone(true);
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load today's log.");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // Auto-save: fires 1 second after user stops typing / interacting
    const scheduleAutoSave = useCallback(
        (newState) => {
            if (!log || submitDone) return;
            isDirty.current = true;
            clearTimeout(autoSaveTimer.current);
            autoSaveTimer.current = setTimeout(async () => {
                if (!isDirty.current) return;
                setSaving(true);
                try {
                    const { data } = await saveDraft(log._id, newState);
                    setLog(data);
                    isDirty.current = false;
                } catch {
                    // silent fail on auto-save
                } finally {
                    setSaving(false);
                }
            }, 1000);
        },
        [log, submitDone]
    );

    // Handlers — each updates state AND triggers auto-save
    const toggleTask = useCallback(
        (task) => {
            setTasksCompleted((prev) => {
                const next = prev.includes(task)
                    ? prev.filter((t) => t !== task)
                    : [...prev, task];
                scheduleAutoSave({ tasksCompleted: next, timeSpentMinutes, notes, difficultyRating });
                return next;
            });
        },
        [timeSpentMinutes, notes, difficultyRating, scheduleAutoSave]
    );

    const handleTimeChange = useCallback(
        (val) => {
            const num = Math.max(0, Number(val));
            setTimeSpentMinutes(num);
            scheduleAutoSave({ tasksCompleted, timeSpentMinutes: num, notes, difficultyRating });
        },
        [tasksCompleted, notes, difficultyRating, scheduleAutoSave]
    );

    const handleNotesChange = useCallback(
        (val) => {
            setNotes(val);
            scheduleAutoSave({ tasksCompleted, timeSpentMinutes, notes: val, difficultyRating });
        },
        [tasksCompleted, timeSpentMinutes, difficultyRating, scheduleAutoSave]
    );

    const handleDifficultyChange = useCallback(
        (val) => {
            setDifficultyRating(val);
            scheduleAutoSave({ tasksCompleted, timeSpentMinutes, notes, difficultyRating: val });
        },
        [tasksCompleted, timeSpentMinutes, notes, scheduleAutoSave]
    );

    // Manual submit
    const handleSubmit = useCallback(async () => {
        if (!log || submitDone) return;
        clearTimeout(autoSaveTimer.current);
        setSaving(true);
        try {
            // Save latest state first, then submit
            await saveDraft(log._id, { tasksCompleted, timeSpentMinutes, notes, difficultyRating });
            const { data } = await submitLog(log._id);
            setLog(data);
            setSubmitDone(true);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to submit log.");
        } finally {
            setSaving(false);
        }
    }, [log, submitDone, tasksCompleted, timeSpentMinutes, notes, difficultyRating]);

    // Cleanup timer on unmount
    useEffect(() => () => clearTimeout(autoSaveTimer.current), []);

    return {
        log,
        planDay,
        loading,
        saving,
        submitDone,
        error,
        tasksCompleted,
        timeSpentMinutes,
        notes,
        difficultyRating,
        toggleTask,
        handleTimeChange,
        handleNotesChange,
        handleDifficultyChange,
        handleSubmit,
    };
};