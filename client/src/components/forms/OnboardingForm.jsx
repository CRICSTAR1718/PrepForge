import { useState } from "react";

const DOMAINS = ["DSA", "Full Stack", "Aptitude"];
const DURATIONS = [15, 30, 45, 60, 75, 90];

const domainDescriptions = {
    DSA: "Arrays, trees, graphs, DP, sorting — full LeetCode-style prep.",
    "Full Stack": "React, Node.js, MongoDB, REST APIs, auth, and deployment.",
    Aptitude: "Quantitative, logical reasoning, verbal, and data interpretation.",
};

const OnboardingForm = ({ onSubmit, loading }) => {
    const [domain, setDomain] = useState("");
    const [durationDays, setDurationDays] = useState(30);
    const [error, setError] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!domain) {
            setError("Please select a domain.");
            return;
        }
        setError("");
        onSubmit({ domain, durationDays });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Domain selection */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Choose your preparation domain
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {DOMAINS.map((d) => (
                        <button
                            key={d}
                            type="button"
                            onClick={() => setDomain(d)}
                            className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${domain === d
                                    ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:border-indigo-400"
                                    : "border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600"
                                }`}
                        >
                            <p className="font-semibold text-gray-900 dark:text-white">{d}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {domainDescriptions[d]}
                            </p>
                        </button>
                    ))}
                </div>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>

            {/* Duration selection */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Plan duration:{" "}
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                        {durationDays} days
                    </span>
                </label>
                <input
                    type="range"
                    min={15}
                    max={90}
                    step={15}
                    value={durationDays}
                    onChange={(e) => setDurationDays(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                    {DURATIONS.map((d) => (
                        <span key={d}>{d}d</span>
                    ))}
                </div>
            </div>

            {/* Submit */}
            <button
                type="submit"
                disabled={loading || !domain}
                className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold rounded-xl transition-colors duration-200"
            >
                {loading ? "Generating your plan..." : "Generate my plan →"}
            </button>
        </form>
    );
};

export default OnboardingForm;