/**
 * calcStreak
 * Counts how many consecutive calendar days (going back from today)
 * the user has a submitted log.
 *
 * @param {Array} submittedLogs - array of log objects with a `date` field
 * @returns {number} streak count
 */
export function calcStreak(submittedLogs) {
    if (!submittedLogs || submittedLogs.length === 0) return 0;

    // Normalize dates to YYYY-MM-DD strings
    const logDates = new Set(
        submittedLogs.map((l) => {
            const d = new Date(l.date);
            return d.toISOString().slice(0, 10);
        })
    );

    let streak = 0;
    const today = new Date();

    // Walk backwards from today
    for (let i = 0; i < 365; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const key = d.toISOString().slice(0, 10);

        if (logDates.has(key)) {
            streak++;
        } else {
            // Allow today to be missing (user hasn't logged yet today)
            if (i === 0) continue;
            break;
        }
    }

    return streak;
}

