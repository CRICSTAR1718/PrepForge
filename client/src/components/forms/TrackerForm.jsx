const DIFFICULTY_LABELS = {
    1: "Very easy",
    2: "Easy",
    3: "Medium",
    4: "Hard",
    5: "Very hard",
};

const DifficultyPicker = ({ value, onChange, disabled }) => (
    <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
            <button
                key={n}
                type="button"
                disabled={disabled}
                onClick={() => onChange(n)}
                title={DIFFICULTY_LABELS[n]}
                className={`w-9 h-9 rounded-lg text-sm font-semibold border transition-all
                    ${value === n
                        ? "bg-indigo-600 border-indigo-600 text-white"
                        : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-indigo-400 hover:text-indigo-600"
                    }
                    ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
                {n}
            </button>
        ))}
    </div>
);

const SectionCard = ({ title, subtitle, children }) => (
    <div>
        <div className="mb-3">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{title}</p>
            {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        {children}
    </div>
);

const TrackerForm = ({
    planDay,
    tasksCompleted,
    timeSpentMinutes,
    notes,
    difficultyRating,
    saving,
    submitDone,
    toggleTask,
    handleTimeChange,
    handleNotesChange,
    handleDifficultyChange,
    handleSubmit,
}) => {
    const tasks = planDay?.tasks || [];
    const completedCount = tasksCompleted.length;
    const totalCount = tasks.length;
    const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return (
        <div className="space-y-8">

            {/* Task checklist */}
            <SectionCard
                title="Today's tasks"
                subtitle={`${completedCount} of ${totalCount} completed`}
            >
                {/* Progress bar */}
                <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                    <div
                        className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                    />
                </div>

                {tasks.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">
                        No tasks found for today. Your plan may have ended.
                    </p>
                ) : (
                    <ul className="space-y-2">
                        {tasks.map((task, i) => {
                            const label = typeof task === "string" ? task : task.title || "";
                            const description = typeof task === "object" ? task.description : null;
                            const checked = tasksCompleted.includes(label);
                            return (
                                <li
                                    key={i}
                                    className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden"
                                >
                                    <label className={`flex items-start gap-3 px-4 py-3
                                        ${submitDone ? "cursor-not-allowed" : "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"}
                                        transition-colors`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            disabled={submitDone}
                                            onChange={() => toggleTask(label)}
                                            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-indigo-600
                                                       focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer"
                                        />
                                        <div>
                                            <p className={`text-sm font-medium transition-colors
                                                ${checked
                                                    ? "line-through text-gray-400 dark:text-gray-600"
                                                    : "text-gray-800 dark:text-gray-200"
                                                }`}>
                                                {label}
                                            </p>
                                            {description && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                    {description}
                                                </p>
                                            )}
                                        </div>
                                    </label>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </SectionCard>

            <div className="border-t border-gray-100 dark:border-gray-800" />

            {/* Time spent */}
            <SectionCard
                title="Time spent"
                subtitle={`Estimated: ${planDay?.estimatedMinutes ?? "—"} min`}
            >
                <div className="flex items-center gap-3">
                    <input
                        type="number"
                        min="0"
                        max="720"
                        value={timeSpentMinutes}
                        disabled={submitDone}
                        onChange={(e) => handleTimeChange(e.target.value)}
                        className="w-28 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700
                                   bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm
                                   focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                                   disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <span className="text-sm text-gray-500 dark:text-gray-400">minutes</span>
                    {timeSpentMinutes > 0 && (
                        <span className="text-xs text-gray-400">
                            ({Math.floor(timeSpentMinutes / 60)}h {timeSpentMinutes % 60}m)
                        </span>
                    )}
                </div>
            </SectionCard>

            <div className="border-t border-gray-100 dark:border-gray-800" />

            {/* Notes */}
            <SectionCard
                title="Notes"
                subtitle="What did you learn? Any blockers? Key takeaways?"
            >
                <textarea
                    rows={4}
                    value={notes}
                    disabled={submitDone}
                    onChange={(e) => handleNotesChange(e.target.value)}
                    placeholder="Write your notes here..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700
                               bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm
                               placeholder-gray-300 dark:placeholder-gray-600 resize-none
                               focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                               disabled:opacity-50 disabled:cursor-not-allowed"
                />
            </SectionCard>

            <div className="border-t border-gray-100 dark:border-gray-800" />

            {/* Difficulty */}
            <SectionCard
                title="How difficult was today?"
                subtitle="1 = very easy · 5 = very hard"
            >
                <DifficultyPicker
                    value={difficultyRating}
                    onChange={handleDifficultyChange}
                    disabled={submitDone}
                />
                {difficultyRating && (
                    <p className="mt-2 text-xs text-indigo-500">
                        {DIFFICULTY_LABELS[difficultyRating]}
                    </p>
                )}
            </SectionCard>

            <div className="border-t border-gray-100 dark:border-gray-800" />

            {/* Submit row */}
            <div className="flex items-center justify-between pt-1">
                <p className="text-xs text-gray-400">
                    {saving && !submitDone ? (
                        <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse inline-block" />
                            Saving…
                        </span>
                    ) : (
                        <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                            Draft saved
                        </span>
                    )}
                </p>

                {submitDone ? (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                        <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm font-semibold text-green-700 dark:text-green-400">Submitted</span>
                    </div>
                ) : (
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm
                                   font-semibold rounded-xl transition-colors
                                   disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {saving ? "Submitting…" : "Submit day →"}
                    </button>
                )}
            </div>

        </div>
    );
};

export default TrackerForm;
