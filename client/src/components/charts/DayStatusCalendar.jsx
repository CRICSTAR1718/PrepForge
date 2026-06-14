import { useState } from "react";

/**
 * DayStatusCalendar — renders a compact, scrollable calendar strip showing
 * per-day status indicators (completed, missed, pending) with tooltips.
 *
 * Props:
 *   - dayStatuses: array of { day, status, topic, score? }
 *   - maxVisible: how many days to show (default: all)
 */
export default function DayStatusCalendar({ dayStatuses = [], maxVisible = null }) {
    const [hoveredDay, setHoveredDay] = useState(null);

    if (!dayStatuses || dayStatuses.length === 0) {
        return null;
    }

    const visibleDays = maxVisible ? dayStatuses.slice(0, maxVisible) : dayStatuses;

    const statusBgColor = (status, score) => {
        if (status === "completed") {
            if (score == null) return "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800";
            if (score >= 75) return "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800";
            if (score >= 50) return "bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800";
            return "bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800";
        }
        if (status === "missed") {
            return "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800";
        }
        return "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700";
    };

    const statusTextColor = (status, score) => {
        if (status === "completed") {
            if (score == null) return "text-blue-600 dark:text-blue-400";
            if (score >= 75) return "text-green-600 dark:text-green-400";
            if (score >= 50) return "text-yellow-600 dark:text-yellow-400";
            return "text-orange-600 dark:text-orange-400";
        }
        if (status === "missed") {
            return "text-red-600 dark:text-red-400";
        }
        return "text-gray-600 dark:text-gray-400";
    };

    return (
        <div className="space-y-4">
            {/* Calendar strip — scrollable on mobile, wrapped on desktop */}
            <div className="flex gap-2 flex-wrap overflow-x-auto pb-2">
                {visibleDays.map((ds) => (
                    <div
                        key={ds.day}
                        className="relative flex-shrink-0"
                        onMouseEnter={() => setHoveredDay(ds.day)}
                        onMouseLeave={() => setHoveredDay(null)}
                    >
                        <button
                            className={`w-12 h-12 flex flex-col items-center justify-center rounded-lg border transition-all ${statusBgColor(
                                ds.status,
                                ds.score
                            )} ${statusTextColor(ds.status, ds.score)} font-semibold text-sm`}
                        >
                            <span>{ds.status === "completed" ? "✓" : ds.status === "missed" ? "✕" : ds.day}</span>
                            {ds.status === "completed" && ds.score != null && (
                                <span className="text-xs font-medium">{ds.score}</span>
                            )}
                        </button>

                        {/* Tooltip on hover */}
                        {hoveredDay === ds.day && (
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max bg-gray-900 dark:bg-gray-950 text-white text-xs px-3 py-2 rounded-md shadow-lg z-10 pointer-events-none">
                                <p className="font-semibold">Day {ds.day}</p>
                                <p className="text-gray-300 truncate max-w-xs">{ds.topic}</p>
                                <p className="text-gray-400 capitalize">
                                    {ds.status === "completed"
                                        ? ds.score != null
                                            ? `Score: ${ds.score}`
                                            : "Submitted"
                                        : ds.status}
                                </p>
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900 dark:border-t-gray-950" />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="flex gap-4 flex-wrap text-xs text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-green-100 dark:bg-green-900/50 border border-green-300 dark:border-green-700" />
                    <span>Completed (High)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-yellow-100 dark:bg-yellow-900/50 border border-yellow-300 dark:border-yellow-700" />
                    <span>Completed (Mid)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-orange-100 dark:bg-orange-900/50 border border-orange-300 dark:border-orange-700" />
                    <span>Completed (Low)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700" />
                    <span>Missed</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700" />
                    <span>Pending</span>
                </div>
            </div>
        </div>
    );
}
