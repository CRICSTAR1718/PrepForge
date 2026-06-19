import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Spinner from "../components/ui/Spinner.jsx";
import { getLatestEvaluation, getLogById } from "../services/logService.js";
import { scoreBgColor, scoreLabel, scoreTextColor } from "../utils/scoreColor.js";

const difficultyMap = { 1: "Very Easy", 2: "Easy", 3: "Medium", 4: "Hard", 5: "Very Hard" };

function ScoreRing({ score }) {
    const [displayed, setDisplayed] = useState(0);
    const size = 180;
    const radius = size / 2 - 14;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - displayed / 100);
    const stroke = score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444";

    useEffect(() => {
        if (score === null) return undefined;
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
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={stroke} strokeWidth="12" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} style={{ transition: "stroke-dashoffset 0.05s linear" }} />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className={`text-5xl font-black tabular-nums ${scoreTextColor(score)}`}>{displayed}</span>
                <span className="mt-0.5 text-xs font-medium text-gray-500">/ 100</span>
            </div>
        </div>
    );
}

function StatCard({ label, value }) {
    return <div className="evaluator-stat rounded-xl border p-4 text-center"><p className="mb-1 text-xs uppercase tracking-wider text-gray-500">{label}</p><p className="text-base font-bold text-white">{value}</p></div>;
}

export default function Result() {
    const navigate = useNavigate();
    const location = useLocation();
    const { logId: routeLogId } = useParams();
    const logId = routeLogId ?? location.state?.logId ?? null;
    const intervalRef = useRef(null);
    const [log, setLog] = useState(null);
    const [polling, setPolling] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;
        const loadEvaluation = () => logId ? getLogById(logId) : getLatestEvaluation();

        async function poll() {
            try {
                const data = await loadEvaluation();
                if (cancelled) return;
                setLog(data);
                if (!data.evaluationPending) {
                    clearInterval(intervalRef.current);
                    setPolling(false);
                }
            } catch (requestError) {
                if (cancelled) return;
                setError(requestError.response?.status === 404
                    ? "No submitted evaluation is available yet. Complete and submit a daily task first."
                    : "Could not load evaluation. Please try again.");
                clearInterval(intervalRef.current);
                setPolling(false);
            }
        }

        poll();
        intervalRef.current = setInterval(poll, 2000);
        return () => {
            cancelled = true;
            clearInterval(intervalRef.current);
        };
    }, [logId]);

    if (error) {
        return <div className="evaluator-page min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center"><div className="text-4xl">!</div><p className="font-semibold text-red-400">{error}</p><button onClick={() => navigate("/tracker")} className="mt-2 rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500">Back to Tracker</button></div>;
    }

    if (polling || !log) {
        return <div className="evaluator-page min-h-screen flex flex-col items-center justify-center gap-6 px-4 text-center"><Spinner size="lg" /><div><h2 className="mb-2 text-xl font-bold text-white">Evaluating your day...</h2><p className="max-w-xs text-sm text-gray-400">Our AI is reviewing your log. This usually takes a few seconds.</p></div></div>;
    }

    const { evaluation, tasksCompleted, plannedTasks, timeSpentMinutes, difficultyRating, dayNumber } = log;
    const score = evaluation?.score ?? null;
    const label = score === null && evaluation?.feedback ? "Evaluation Failed" : scoreLabel(score);

    return (
        <div className="evaluator-page min-h-screen text-white"><div className="mx-auto max-w-2xl space-y-8 px-4 py-10">
            <div className="text-center"><p className="mb-1 text-sm font-medium uppercase tracking-wider text-indigo-400">Day {dayNumber ?? "-"} - Evaluation</p><h1 className="text-3xl font-black">Your Results</h1></div>
            <div className={`flex flex-col items-center gap-4 rounded-2xl p-8 ${scoreBgColor(score)}`}><ScoreRing score={score} /><p className={`text-lg font-bold ${scoreTextColor(score)}`}>{label}</p></div>
            {evaluation?.feedback && <div className="evaluator-panel rounded-2xl border p-6"><h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">Feedback</h2><p className="leading-relaxed text-gray-200">{evaluation.feedback}</p></div>}
            {evaluation?.suggestions?.length > 0 && <div className="evaluator-panel rounded-2xl border p-6"><h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">Tomorrow&apos;s Action Plan</h2><ul className="space-y-3">{evaluation.suggestions.map((suggestion, index) => <li key={suggestion} className="flex items-start gap-3"><span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-indigo-500/50 bg-indigo-600/30 text-xs font-bold text-indigo-400">{index + 1}</span><p className="text-sm leading-relaxed text-gray-300">{suggestion}</p></li>)}</ul></div>}
            <div className="grid grid-cols-3 gap-3"><StatCard label="Tasks Done" value={`${tasksCompleted?.length ?? 0} / ${plannedTasks?.length ?? "?"}`} /><StatCard label="Time Spent" value={`${timeSpentMinutes ?? 0} min`} /><StatCard label="Difficulty" value={difficultyMap[difficultyRating] ?? "-"} /></div>
            <div className="flex flex-col gap-3 pt-2 sm:flex-row"><button onClick={() => navigate("/dashboard")} className="flex-1 rounded-xl bg-indigo-600 py-3 text-sm font-semibold transition-colors hover:bg-indigo-500">View Dashboard</button><button onClick={() => navigate("/tracker")} className="flex-1 rounded-xl bg-gray-800 py-3 text-sm font-semibold transition-colors hover:bg-gray-700">Back to Tracker</button></div>
        </div></div>
    );
}

