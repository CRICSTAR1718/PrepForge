import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";


const LevelTest = () => {
    const navigate = useNavigate();

    const { level: levelParam } = useParams();

    const [level] = useState(() => {
        // Prefer URL param so refresh/navigation never falls back to Beginner.
        const normalized = typeof levelParam === "string" ? decodeURIComponent(levelParam) : null;
        return normalized || "Beginner";
    });


    // store selected level for debugging
    // console.log("[LevelTest] selected level", initialLevel, "using", level);
    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    const [questions, setQuestions] = useState([]);
    const [score, setScore] = useState(null);
    const [passed, setPassed] = useState(null);
    const [suggestedLevel, setSuggestedLevel] = useState(null);

    const [answers, setAnswers] = useState({}); // { [questionId]: "A"|"B"|"C"|"D" }

    const runInitial = async (lvl) => {
        setLoading(true);
        setError("");
        try {
            const res = await api.post("/level-test/run", { level: lvl });
            const data = res.data;
            setPassed(data.passed);
            setScore(data.score);
            setSuggestedLevel(data.suggestedLevel || null);
            setQuestions(data.questions || []);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to run level test");
        } finally {
            setLoading(false);
        }
    };

    const submitAnswers = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await api.post("/level-test/run", { level, answers });
            const data = res.data;
            setPassed(data.passed);
            setScore(data.score);
            setSuggestedLevel(data.suggestedLevel || null);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to submit level test");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!level) return;
        const controller = new AbortController();
        const run = async () => {
            try {
                await runInitial(level);
            } catch {
                // ignore
            }
        };
        run();
        return () => controller.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [level]);

    const onChangeAnswer = (qid, val) => {
        setAnswers((prev) => ({ ...prev, [qid]: val }));
    };

    const resultCard = useMemo(() => {
        if (loading) return null;
        if (error) return null;
        if (passed == null || score == null) return null;

        if (passed) {
            return (
                <div className="mt-6 p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-900">
                    <p className="font-bold">Test Passed ✅</p>
                    <p className="text-sm">Your level verification score: {score}/100</p>
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="mt-4 w-full py-3 px-4 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700"
                    >
                        Go to Dashboard →
                    </button>
                </div>
            );
        }

        return (
            <div className="mt-6 p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-900">
                <p className="font-bold">Test Not Passed — Reassign Suggested</p>
                <p className="text-sm">
                    Your score: {score}/100. Suggested level: {suggestedLevel}
                </p>
                <button
                    onClick={() => {
                        // If they fail, prompt them to switch to the suggested lower level.
                        // Backend already returns suggestedLevel for score < 50.
                        const nextLevel = suggestedLevel || "Beginner";
                        // Go back to onboarding and preselect the level.
                        navigate("/onboarding", { state: { level: nextLevel } });
                    }}
                    className="mt-4 w-full py-3 px-4 rounded-xl bg-amber-600 text-white font-bold hover:bg-amber-700"
                >
                    Switch to {suggestedLevel || "Beginner"} →
                </button>

            </div>
        );
    }, [error, loading, passed, score, suggestedLevel, navigate]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
            <div className="w-full max-w-2xl">
                <div className="mb-6 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Level Verification
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                        Selected level: <span className="font-bold text-indigo-600">{level}</span>
                    </p>
                </div>

                {error && (
                    <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-800 text-sm mb-4">
                        {error}
                    </div>
                )}

                {loading && (
                    <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                        <p className="text-indigo-600 animate-pulse font-bold">Running AI test…</p>
                    </div>
                )}

                {!loading && questions.length > 0 && passed == null && (
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                        <div className="space-y-5">
                            {questions.map((q, idx) => (
                                <div key={q.id || idx} className="space-y-3">
                                    <p className="font-bold text-gray-900 dark:text-white">
                                        Q{idx + 1}. {q.question}
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {["A", "B", "C", "D"].map((k) => (
                                            <button
                                                key={k}
                                                type="button"
                                                onClick={() => onChangeAnswer(q.id, k)}
                                                className={
                                                    answers[q.id] === k
                                                        ? "px-4 py-3 rounded-xl bg-indigo-600 text-white font-bold"
                                                        : "px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 font-medium text-gray-800 dark:text-gray-200 text-left"
                                                }
                                            >
                                                <span className="font-bold mr-2">{k}.</span>
                                                {q.options[k]}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={submitAnswers}
                                disabled={loading}
                                className="mt-2 w-full py-3 px-4 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 disabled:opacity-60"
                            >
                                Submit Answers →
                            </button>
                        </div>
                    </div>
                )}

                {resultCard}

                {/* MVP: backend currently auto-scores in /run. */}
            </div>
        </div>
    );
};

export default LevelTest;

