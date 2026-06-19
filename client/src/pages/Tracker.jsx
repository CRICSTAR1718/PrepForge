import { useNavigate } from "react-router-dom";
import { useTracker } from "../hooks/useTracker";
import TrackerForm from "../components/forms/TrackerForm";

const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });
};

const Tracker = () => {
    const navigate = useNavigate();
    const tracker = useTracker();
    const { log, planDay, loading, error, submitDone } = tracker;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
                <p className="text-indigo-500 animate-pulse">Loading today's tracker...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
                <div className="text-center space-y-3">
                    <p className="text-gray-500 dark:text-gray-400">{error}</p>
                    <button
                        onClick={() => navigate("/onboarding")}
                        className="text-indigo-600 underline text-sm"
                    >
                        Generate a plan first →
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-4 py-10">
            <div className="max-w-3xl mx-auto">

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-indigo-500 uppercase tracking-wider">
                            Daily tracker
                        </span>
                        {submitDone && (
                            <span className="px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold">
                                Submitted
                            </span>
                        )}
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {planDay?.topic ?? "Today's session"}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                        {log?.date ? formatDate(log.date) : ""}
                        {planDay?.day ? ` · Day ${planDay.day}` : ""}
                        {planDay?.estimatedMinutes ? ` · ~${planDay.estimatedMinutes} min` : ""}
                    </p>
                </div>
                
                {/* Submitted — navigate to result page */}
                {submitDone && log?._id && (
                    <div className="mb-6 bg-white dark:bg-gray-900 border border-green-200 dark:border-green-800 rounded-2xl px-5 py-4 flex items-start gap-3">
                        <span className="text-green-500 text-lg">✓</span>
                        <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                Day submitted!
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                Your AI evaluation is being prepared...
                            </p>
                        </div>
                        <button
                            onClick={() => navigate(`/result/${log._id}`)}
                            className="text-sm font-semibold text-indigo-500 hover:text-indigo-400 transition-colors whitespace-nowrap"
                        >
                            View Result →
                        </button>
                    </div>
                )}

                {/* Form card */}
                <div className="tracker-form rounded-2xl p-6 md:p-8">
                    <TrackerForm {...tracker} />
                </div>

            </div>
        </div>
    );
};

export default Tracker;

