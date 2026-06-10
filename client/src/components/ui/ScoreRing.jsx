// client/src/components/ui/ScoreRing.jsx
// Animated circular score ring — used on the Result page

import { useEffect, useState } from 'react';
import { scoreRingColor, scoreTextColor, scoreLabel } from '../../utils/scoreColor.js';

export default function ScoreRing({ score, size = 160 }) {
    const [animatedScore, setAnimatedScore] = useState(0);

    const radius = (size / 2) - 12;
    const circumference = 2 * Math.PI * radius;
    const progress = animatedScore / 100;
    const strokeDashoffset = circumference * (1 - progress);

    // Animate score counting up
    useEffect(() => {
        if (score === null || score === undefined) return;
        let start = 0;
        const end = score;
        const duration = 1200; // ms
        const stepTime = 16;   // ~60fps
        const steps = duration / stepTime;
        const increment = end / steps;

        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                setAnimatedScore(end);
                clearInterval(timer);
            } else {
                setAnimatedScore(Math.floor(start));
            }
        }, stepTime);

        return () => clearInterval(timer);
    }, [score]);

    const color = scoreRingColor(score);
    const textColorClass = scoreTextColor(score);

    return (
        <div className="flex flex-col items-center gap-2">
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="transform -rotate-90"
            >
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="#1f2937"
                    strokeWidth="10"
                />
                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    style={{ transition: 'stroke-dashoffset 0.1s linear' }}
                />
            </svg>

            {/* Score number overlaid in the centre */}
            <div
                className="absolute flex flex-col items-center justify-center"
                style={{ width: size, height: size }}
            >
                <span className={`text-4xl font-bold tabular-nums ${textColorClass}`}>
                    {score === null ? '—' : animatedScore}
                </span>
                <span className="text-xs text-gray-500 mt-0.5">/ 100</span>
            </div>

            <span className={`text-sm font-semibold ${textColorClass}`}>
                {scoreLabel(score)}
            </span>
        </div>
    );
}