
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const score = payload[0].value;
        return (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 shadow-lg text-sm">
                <p className="text-gray-500 dark:text-gray-400 mb-0.5">{label}</p>
                <p className="font-semibold text-indigo-600 dark:text-indigo-400">
                    {score}/100
                </p>
            </div>
        );
    }
    return null;
};

/**
 * ScoreTrendChart
 * Renders a line chart of score over time.
 * chartData: [{ date: "Jun 1", score: 82 }, ...]
 */
export default function ScoreTrendChart({ chartData }) {
    if (!chartData || chartData.length === 0) {
        return (
            <div className="flex items-center justify-center h-48 text-gray-400 dark:text-gray-500 text-sm">
                No scores yet — submit your first daily log to see the trend.
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e5e7eb"
                    className="dark:stroke-gray-700"
                />
                <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                />
                <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine
                    y={60}
                    stroke="#e5e7eb"
                    strokeDasharray="4 4"
                    label={{ value: "60", position: "right", fontSize: 10, fill: "#9ca3af" }}
                />
                <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "#6366f1", strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: "#6366f1" }}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}
