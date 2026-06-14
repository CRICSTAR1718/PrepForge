import { useState, useEffect } from "react";
import { getAllLogs } from "../services/logService.js";
import { calcStreak } from "../utils/calcStreak.js";

/**
 * useDashboard — fetches all logs and computes:
 *   - streak (consecutive submitted days)
 *   - averageScore
 *   - chartData (last 14 days for score trend)
 *   - recentFeedback (last 3 submitted logs with evaluation)
 *   - totalSubmitted
 */
export function useDashboard() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const data = await getAllLogs();
                setLogs(data);
            } catch (err) {
                setError("Failed to load dashboard data.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    // Only submitted logs matter for analytics
    const submittedLogs = logs.filter((l) => l.submitted);

    // Streak
    const streak = calcStreak(submittedLogs);

    // Average score
    const scoredLogs = submittedLogs.filter((l) => l.evaluation?.score != null);
    const averageScore =
        scoredLogs.length > 0
            ? Math.round(
                scoredLogs.reduce((sum, l) => sum + l.evaluation.score, 0) /
                scoredLogs.length
            )
            : null;

    // Chart data — last 14 submitted logs, sorted oldest→newest
    const chartData = [...scoredLogs]
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(-14)
        .map((l) => ({
            date: new Date(l.date).toLocaleDateString("en-IN", {
                month: "short",
                day: "numeric",
            }),
            score: l.evaluation.score,
        }));

    // Recent feedback — last 3 logs that have evaluation text
    const recentFeedback = [...submittedLogs]
        .filter((l) => l.evaluation?.feedback)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 3)
        .map((l) => ({
            date: new Date(l.date).toLocaleDateString("en-IN", {
                month: "short",
                day: "numeric",
            }),
            score: l.evaluation.score,
            feedback: l.evaluation.feedback,
        }));

    return {
        loading,
        error,
        streak,
        averageScore,
        chartData,
        recentFeedback,
        totalSubmitted: submittedLogs.length,
        logs,
    };
}