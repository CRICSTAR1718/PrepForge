import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import usePlan from "../hooks/usePlan";

const DayCard = ({ day, topic, tasks, estimatedMinutes }) => {
    const [open, setOpen] = useState(false);

    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            {/* Day header — always visible */}
            <button
                onClick={() => setOpen((o) => !o)}
                className="w-full flex items-center justify-between px-5 py-4 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
                <div className="flex items-center gap-4">
                    <span className="w-9 h-9 flex items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-sm font-bold">
                        {day}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white text-left">
                        {topic}
                    </span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-gray-400">~{estimatedMinutes} min</span>
                    <span className="text-gray-400 text-sm">{open ? "▲" : "▼"}</span>
                </div>
            </button>

            {/* Tasks — shown when expanded */}
            {open && (
                <div className="border-t border-gray-100 dark:border-gray-800 px-5 py-4 bg-gray-50 dark:bg-gray-900/50 space-y-3">
                    {tasks.map((task, idx) => (
                        <div key={idx} className="flex gap-3">
                            <span className="mt-1 w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                    {task.title}
                                </p>
                                {task.description && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                        {task.description}
                                    </p>
                                )}
                                {task.resourceUrl && (
                                    <a
                                        href={task.resourceUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-xs text-indigo-500 hover:underline"
                                    >
                                        Resource →
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const Plan = () => {
    const navigate = useNavigate();
    const { plan, fetchMyPlan, loading, error } = usePlan();

    useEffect(() => {
        if (!plan) {
            fetchMyPlan().catch(() => {
                // No plan exists — send to onboarding
                navigate("/onboarding");
            });
        }
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
                <p className="text-indigo-500 animate-pulse">Loading your plan...</p>
            </div>
        );
    }

    if (error || !plan) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
                <div className="text-center space-y-3">
                    <p className="text-gray-500">No plan found.</p>
                    <button
                        onClick={() => navigate("/onboarding")}
                        className="text-indigo-600 underline text-sm"
                    >
                        Generate one now →
                    </button>
                </div>
            </div>
        );
    }

    const totalMinutes = plan.days.reduce((sum, d) => sum + d.estimatedMinutes, 0);
    const totalHours = Math.round(totalMinutes / 60);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-4 py-10">
            <div className="max-w-3xl mx-auto">
                {/* Plan header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Your {plan.durationDays}-Day {plan.domain} Plan
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        {plan.days.length} days · ~{totalHours} hours total
                    </p>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    {[
                        { label: "Domain", value: plan.domain },
                        { label: "Duration", value: `${plan.durationDays} days` },
                        { label: "Est. effort", value: `${totalHours} hrs` },
                    ].map(({ label, value }) => (
                        <div
                            key={label}
                            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 text-center"
                        >
                            <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{value}</p>
                        </div>
                    ))}
                </div>

                {/* Day-wise plan */}
                <div className="space-y-3">
                    {plan.days.map((d) => (
                        <DayCard key={d.day} {...d} />
                    ))}
                </div>

                {/* Start button */}
                <div className="mt-10 text-center">
                    <button
                        onClick={() => navigate("/tracker")}
                        className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors"
                    >
                        Start Day 1 →
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Plan;