// client/src/utils/scoreColor.js
// Returns Tailwind colour classes and hex values based on score

/**
 * Returns Tailwind text colour class for a given score
 * 80+  → green
 * 60–79 → amber
 * <60  → red
 */
export function scoreTextColor(score) {
    if (score === null || score === undefined) return 'text-gray-400';
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-red-400';
}

/**
 * Returns Tailwind background colour class for a given score
 */
export function scoreBgColor(score) {
    if (score === null || score === undefined) return 'bg-gray-700';
    if (score >= 80) return 'bg-emerald-500/20 border border-emerald-500/40';
    if (score >= 60) return 'bg-amber-500/20 border border-amber-500/40';
    return 'bg-red-500/20 border border-red-500/40';
}

/**
 * Returns a hex colour string for charts (Recharts etc.)
 */
export function scoreHexColor(score) {
    if (score === null || score === undefined) return '#6b7280';
    if (score >= 80) return '#34d399';  // emerald-400
    if (score >= 60) return '#fbbf24';  // amber-400
    return '#f87171';                    // red-400
}

/**
 * Returns a label for the score band
 */
export function scoreLabel(score) {
    if (score === null || score === undefined) return 'Pending';
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Average';
    return 'Needs Work';
}

/**
 * Returns the stroke colour for the ScoreRing SVG circle
 */
export function scoreRingColor(score) {
    if (score === null || score === undefined) return '#4b5563'; // gray-600
    if (score >= 80) return '#10b981';  // emerald-500
    if (score >= 60) return '#f59e0b';  // amber-500
    return '#ef4444';                    // red-500
}