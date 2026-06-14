import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useDashboard } from "../hooks/useDashboard.js";
import usePlan from "../hooks/usePlan.js";
import ScoreTrendChart from "../components/charts/ScoreTrendChart.jsx";
import { scoreTextColor } from "../utils/scoreColor.js";

export default function Dashboard() {
    const { user } = useAuth();
    const { loading, error, streak, averageScore, chartData, recentFeedback, totalSubmitted } =
        useDashboard();
    const { plan } = usePlan();

    // Work out current day in plan
    let currentDay = null;
    let totalDays = null;
    let todayTopic = null;

    if (plan) {
        totalDays = plan.durationDays;
        const created = new Date(plan.createdAt);
        const now = new Date();
        const diff = Math.floor((now - created) / (1000 * 60 * 60 * 24)) + 1;
        currentDay = Math.min(diff, totalDays);
        const todayPlan = plan.days?.find((d) => d.day === currentDay);
        todayTopic = todayPlan?.topic;
    }

    const progressPct = totalDays
        ? Math.round((totalSubmitted / totalDays) * 100)
        : 0;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
                <div className="text-gray-400 dark:text-gray-500 text-sm">
                    Loading your dashboard…
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-4 py-8">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Welcome */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Welcome back{user?.email ? `, ${user.email.split("@")[0]}` : ""}! 👋
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {user?.domain} preparation · {totalDays}-day plan
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 text-sm text-red-600 dark:text-red-400">
                        {error}
                    </div>
                )}

                {/* Stat cards row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard
                        label="Current Streak"
                        value={streak}
                        suffix="days"
                        icon="🔥"
                        highlight={streak >= 3}
                    />
                    <StatCard
                        label="Avg Score"
                        value={averageScore ?? "–"}
                        suffix={averageScore != null ? "/100" : ""}
                        icon="⭐"
                    />
                    <StatCard
                        label="Days Logged"
                        value={totalSubmitted}
                        suffix={totalDays ? `/ ${totalDays}` : ""}
                        icon="📅"
                    />
                    <StatCard
                        label="Plan Day"
                        value={currentDay ?? "–"}
                        suffix={totalDays ? `/ ${totalDays}` : ""}
                        icon="📍"
                    />
                </div>

                {/* Today's plan + quick actions */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-gray-900 dark:text-white">
                            Today — Day {currentDay ?? "?"}
                        </h2>
                        <span className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full font-medium">
                            {todayTopic ?? user?.domain ?? "Your domain"}
                        </span>
                    </div>

                    {/* Plan progress bar */}
                    <div className="mb-5">
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                            <span>Overall progress</span>
                            <span>{progressPct}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                                style={{ width: `${progressPct}%` }}
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 flex-wrap">
                        <Link
                            to="/tracker"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition"
                        >
                            Open Today's Tracker →
                        </Link>
                        <Link
                            to="/plan"
                            className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium px-4 py-2.5 rounded-xl transition"
                        >
                            View Full Plan
                        </Link>
                        <Link
                            to="/mentor"
                            className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium px-4 py-2.5 rounded-xl transition"
                        >
                            Ask PrepMentor
                        </Link>
                    </div>
                </div>

                {/* Score trend chart */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-6">
                    <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
                        Score Trend — Last 14 Days
                    </h2>
                    <ScoreTrendChart chartData={chartData} />
                </div>

                {/* Recent feedback */}
                {recentFeedback.length > 0 && (
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-6">
                        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
                            Recent Evaluator Feedback
                        </h2>
                        <div className="space-y-4">
                            {recentFeedback.map((fb, i) => (
                                <div
                                    key={i}
                                    className="flex gap-4 items-start border-b border-gray-100 dark:border-gray-800 last:border-0 pb-4 last:pb-0"
                                >
                                    <div
                                        className={`text-lg font-bold w-12 text-center ${scoreTextColor(fb.score)}`}
                                    >
                                        {fb.score}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">
                                            {fb.date}
                                        </p>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                            {fb.feedback}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function StatCard({ label, value, suffix, icon, highlight }) {
    return (
        <div
            className={`bg-white dark:bg-gray-900 border rounded-2xl shadow-sm px-4 py-5 flex flex-col gap-1 ${highlight
                    ? "border-indigo-200 dark:border-indigo-800"
                    : "border-gray-200 dark:border-gray-800"
                }`}
        >
            <span className="text-xl">{icon}</span>
            <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {value}
                </span>
                {suffix && (
                    <span className="text-xs text-gray-400 dark:text-gray-500">{suffix}</span>
                )}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
        </div>
    );
}
