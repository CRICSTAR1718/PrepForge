import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useDashboard } from "../hooks/useDashboard.js";
import usePlan from "../hooks/usePlan.js";
import ScoreTrendChart from "../components/charts/ScoreTrendChart.jsx";
import DayStatusCalendar from "../components/charts/DayStatusCalendar.jsx";
import { scoreTextColor } from "../utils/scoreColor.js";

export default function Dashboard() {
    const { user } = useAuth();
    const { loading, error, streak, averageScore, chartData, recentFeedback, totalSubmitted, logs } =
        useDashboard();
    const { plan } = usePlan();

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

    let dayStatuses = [];
    if (plan && logs) {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        dayStatuses = plan.days.map((d) => {
            const expectedDate = new Date(plan.createdAt);
            expectedDate.setDate(expectedDate.getDate() + d.day - 1);

            const logForDay = logs.find((l) => l.dayNumber === d.day);
            const completed = logForDay && logForDay.submitted;
            const missed = !completed && expectedDate < startOfToday;

            return {
                day: d.day,
                status: completed ? "completed" : missed ? "missed" : "pending",
                topic: d.topic,
                score: logForDay?.evaluation?.score ?? null,
            };
        });
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-cream-50 dark:bg-gray-950 flex items-center justify-center">
                <div className="text-brown-600 dark:text-gray-500 text-sm animate-pulse font-medium">
                    Loading your dashboard…
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-cream-50 dark:bg-gray-950 smooth-transition">
            <div className="max-w-7xl mx-auto px-4 py-8 md:py-10">
                
                {/* Header Section */}
                <div className="mb-8 md:mb-12 slide-in-up">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-3 tracking-tight">
                        Welcome back{user?.email ? `, ${user.email.split("@")[0]}` : ""}! 👋
                    </h1>
                    <p className="text-base text-brown-600 dark:text-gray-400 font-medium tracking-wide">
                        {user?.domain} preparation · <span className="font-bold text-amber-700 dark:text-amber-400">{totalDays}-day plan</span>
                    </p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-2xl px-5 py-4 text-sm text-red-700 dark:text-red-400 font-medium animate-slideInUp">
                        {error}
                    </div>
                )}

                {/* Stat Cards Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
                    {[
                        { label: "Current Streak", value: streak, suffix: "days", icon: "🔥", highlight: streak >= 3 },
                        { label: "Avg Score", value: averageScore ?? "–", suffix: averageScore != null ? "/100" : "", icon: "⭐", highlight: false },
                        { label: "Days Logged", value: totalSubmitted, suffix: totalDays ? `/ ${totalDays}` : "", icon: "📅", highlight: false },
                        { label: "Plan Day", value: currentDay ?? "–", suffix: totalDays ? `/ ${totalDays}` : "", icon: "📍", highlight: false },
                    ].map((stat, idx) => (
                        <StatCard key={idx} {...stat} delay={idx} />
                    ))}
                </div>

                {/* Today's Section */}
                <div className="grid lg:grid-cols-3 gap-6 md:gap-8 mb-8">
                    {/* Main Action Card */}
                    <div className="lg:col-span-2 card p-5 md:p-6 animate-slideInUp">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                                    Today's Challenge
                                </h2>
                                <p className="text-sm text-brown-600 dark:text-gray-500 mt-2 font-medium">Day {currentDay ?? "?"} of {totalDays ?? "?"}</p>
                            </div>
                            <span className="text-xs md:text-sm bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 px-4 py-2 rounded-full font-bold tracking-wide">
                                {todayTopic ?? user?.domain ?? "Your domain"}
                            </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-8">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-semibold text-brown-700 dark:text-gray-300 tracking-wide">Overall Progress</span>
                                <span className="text-2xl font-bold gradient-text">{progressPct}%</span>
                            </div>
                            <div className="h-3 bg-brown-100 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner">
                                <div
                                    className="h-full bg-gradient-to-r from-amber-600 to-amber-500 dark:from-amber-500 dark:to-amber-400 rounded-full transition-all duration-1000 ease-out shadow-lg"
                                    style={{ width: `${progressPct}%` }}
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Link
                                to="/tracker"
                                className="btn bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 dark:from-amber-500 dark:to-amber-600 dark:hover:from-amber-600 dark:hover:to-amber-700 text-white font-bold px-6 py-3 rounded-xl shadow-md hover:shadow-lg text-center smooth-transition tracking-wide"
                            >
                                Open Today's Tracker →
                            </Link>
                            <Link
                                to="/plan"
                                className="btn bg-brown-100 dark:bg-gray-800 hover:bg-brown-200 dark:hover:bg-gray-700 text-brown-800 dark:text-gray-200 font-bold px-6 py-3 rounded-xl smooth-transition text-center tracking-wide"
                            >
                                View Full Plan
                            </Link>
                        </div>
                    </div>

                    {/* Quick Stats Card */}
                    <div className="card p-5 md:p-6 animate-slideInUp" style={{animationDelay: "0.1s"}}>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-5 text-base tracking-tight">Quick Stats</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-brown-50 dark:bg-gray-800/50 rounded-xl">
                                <span className="text-sm text-brown-700 dark:text-gray-400 font-medium">Completion</span>
                                <span className="font-bold text-brown-900 dark:text-white text-lg">{progressPct}%</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                                <span className="text-sm text-amber-700 dark:text-amber-400 font-medium">Active Streak</span>
                                <span className="font-bold text-amber-900 dark:text-amber-300 text-lg">{streak} 🔥</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                <span className="text-sm text-blue-700 dark:text-blue-400 font-medium">Avg Score</span>
                                <span className="font-bold text-blue-900 dark:text-blue-300 text-lg">{averageScore ?? "–"}</span>
                            </div>
                        </div>
                        <Link
                            to="/mentor"
                            className="btn mt-6 flex w-full min-h-12 items-center justify-center border border-violet-500/45 bg-violet-600/20 px-4 py-3 text-center font-bold text-violet-100 hover:bg-violet-600 hover:text-white"
                        >
                            Ask PrepMentor
                        </Link>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid lg:grid-cols-2 gap-6 md:gap-8 mb-8">
                    {/* Progress Calendar */}
                    {dayStatuses.length > 0 && (
                        <div className="card p-5 md:p-6 animate-slideInUp" style={{animationDelay: "0.15s"}}>
                            <h2 className="section-title">Progress Calendar</h2>
                            <DayStatusCalendar dayStatuses={dayStatuses} maxVisible={30} />
                        </div>
                    )}

                    {/* Score Trend */}
                    <div className="card p-5 md:p-6 animate-slideInUp" style={{animationDelay: "0.2s"}}>
                        <h2 className="section-title">
                            Score Trend — Last 14 Days
                        </h2>
                        <ScoreTrendChart chartData={chartData} />
                    </div>
                </div>

                {/* Recent Feedback */}
                {recentFeedback.length > 0 && (
                    <div className="card p-5 md:p-6 animate-slideInUp" style={{animationDelay: "0.25s"}}>
                        <h2 className="section-title">
                            Recent Evaluator Feedback
                        </h2>
                        <div className="space-y-5">
                            {recentFeedback.map((fb, i) => (
                                <div
                                    key={i}
                                    className="flex gap-5 items-start pb-5 last:pb-0 border-b border-brown-100 dark:border-gray-800 last:border-0 hover:bg-brown-50 dark:hover:bg-gray-800/50 p-3 -m-3 rounded-xl smooth-transition"
                                >
                                    <div
                                        className={`text-lg font-bold w-14 text-center rounded-lg py-2 ${scoreTextColor(fb.score)} bg-opacity-10 text-lg`}
                                    >
                                        {fb.score}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-brown-500 dark:text-gray-500 mb-2 font-semibold tracking-wide">
                                            {fb.date}
                                        </p>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
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

function StatCard({ label, value, suffix, icon, highlight, delay }) {
    return (
        <div
            className={`card px-4 py-5 md:px-5 md:py-6 flex flex-col gap-2 animate-slideInUp hover:scale-105 ${
                highlight
                    ? "border-amber-200 dark:border-amber-800/50 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20"
                    : "bg-white dark:bg-gray-900"
            }`}
            style={{ animationDelay: `${delay * 0.1}s` }}
        >
            <span className="text-2xl md:text-3xl">{icon}</span>
            <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl md:text-3xl font-extrabold gradient-text">
                    {value}
                </span>
                {suffix && (
                    <span className="text-xs text-brown-500 dark:text-gray-500 font-semibold tracking-wide">{suffix}</span>
                )}
            </div>
            <span className="text-xs md:text-sm text-brown-700 dark:text-gray-400 font-semibold tracking-wide mt-1">{label}</span>
        </div>
    );
}


