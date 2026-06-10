import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Spinner from "../components/ui/Spinner.jsx";
import { getLogById } from "../services/logService.js";
import { scoreBgColor, scoreLabel, scoreTextColor } from "../utils/scoreColor.js";

const difficultyMap = {
    1: "Very Easy",
    2: "Easy",
    3: "Medium",
    4: "Hard",
    5: "Very Hard",
};

function ScoreRing({ score }) {
    const [displayed, setDisplayed] = useState(0);
    const size = 180;
    const radius = size / 2 - 14;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - displayed / 100);
    const stroke = score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444";

    useEffect(() => {
        if (score === null) return;

        let value = 0;
        const intervalId = setInterval(() => {
            value += 2;
            if (value >= score) {
                setDisplayed(score);
                clearInterval(intervalId);
            } else {
                setDisplayed(value);
            }
        }, 14);

        return () => clearInterval(intervalId);
    }, [score]);

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#1f2937" strokeWidth="12" />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={stroke}
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    style={{ transition: "stroke-dashoffset 0.05s linear" }}
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className={`text-5xl font-black tabular-nums ${scoreTextColor(score)}`}>{displayed}</span>
                <span className="text-xs text-gray-500 mt-0.5 font-medium">/ 100</span>
            </div>
        </div>
    );
}

function StatCard({ label, value }) {
    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">{label}</p>
            <p className="text-white font-bold text-base">{value}</p>
        </div>
    );
}

export default function Result() {
    const navigate = useNavigate();
    const location = useLocation();
    const logId = location.state?.logId;
    const intervalRef = useRef(null);

    const [log, setLog] = useState(null);
    const [polling, setPolling] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!logId) {
            navigate("/tracker");
            return undefined;
        }

        async function poll() {
            try {
                const data = await getLogById(logId);
                setLog(data);

                if (!data.evaluationPending) {
                    clearInterval(intervalRef.current);
                    setPolling(false);
                }
            } catch {
                setError("Could not load evaluation. Please try again.");
                clearInterval(intervalRef.current);
                setPolling(false);
            }
        }

        poll();
        intervalRef.current = setInterval(poll, 2000);

        return () => clearInterval(intervalRef.current);
    }, [logId, navigate]);

    if (error) {
        return (
            <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4 px-4 text-center">
                <div className="text-4xl">!</div>
                <p className="text-red-400 font-semibold">{error}</p>
                <button
                    onClick={() => navigate("/tracker")}
                    className="mt-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
                >
                    Back to Tracker
                </button>
            </div>
        );
    }

    if (polling || !log) {
        return (
            <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-6 text-center px-4">
                <Spinner size="lg" />
                <div>
                    <h2 className="text-white text-xl font-bold mb-2">Evaluating your day...</h2>
                    <p className="text-gray-400 text-sm max-w-xs">
                        Our AI is reviewing your log. This usually takes a few seconds.
                    </p>
                </div>
            </div>
        );
    }

    const { evaluation, tasksCompleted, plannedTasks, timeSpentMinutes, difficultyRating, dayNumber } = log;
    const score = evaluation?.score ?? null;
    const label = score === null && evaluation?.feedback ? "Evaluation Failed" : scoreLabel(score);

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">
                <div className="text-center">
                    <p className="text-sm text-indigo-400 font-medium tracking-wider uppercase mb-1">
                        Day {dayNumber ?? "-"} - Evaluation
                    </p>
                    <h1 className="text-3xl font-black">Your Results</h1>
                </div>

                <div className={`rounded-2xl p-8 flex flex-col items-center gap-4 ${scoreBgColor(score)}`}>
                    <ScoreRing score={score} />
                    <p className={`text-lg font-bold ${scoreTextColor(score)}`}>{label}</p>
                </div>

                {evaluation?.feedback && (
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                            Feedback
                        </h2>
                        <p className="text-gray-200 leading-relaxed">{evaluation.feedback}</p>
                    </div>
                )}

                {evaluation?.suggestions?.length > 0 && (
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                            Tomorrow&apos;s Action Plan
                        </h2>
                        <ul className="space-y-3">
                            {evaluation.suggestions.map((suggestion, index) => (
                                <li key={suggestion} className="flex gap-3 items-start">
                                    <span className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-xs font-bold text-indigo-400">
                                        {index + 1}
                                    </span>
                                    <p className="text-gray-300 text-sm leading-relaxed">{suggestion}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="grid grid-cols-3 gap-3">
                    <StatCard label="Tasks Done" value={`${tasksCompleted?.length ?? 0} / ${plannedTasks?.length ?? "?"}`} />
                    <StatCard label="Time Spent" value={`${timeSpentMinutes ?? 0} min`} />
                    <StatCard label="Difficulty" value={difficultyMap[difficultyRating] ?? "-"} />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-semibold text-sm transition-colors"
                    >
                        View Dashboard
                    </button>
                    <button
                        onClick={() => navigate("/tracker")}
                        className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-semibold text-sm transition-colors"
                    >
                        Back to Tracker
                    </button>
                </div>
            </div>
        </div>
    );
}
