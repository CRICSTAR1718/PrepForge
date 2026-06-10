// client/src/components/ui/Spinner.jsx
// Reusable loading spinner
// Usage: <Spinner />  <Spinner size="sm" />  <Spinner size="lg" />

const sizeMap = {
    xs: 'w-3 h-3 border-[2px]',
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-[3px]',
    xl: 'w-16 h-16 border-4',
};

export default function Spinner({ size = 'md', className = '' }) {
    const sizeClass = sizeMap[size] ?? sizeMap.md;

    return (
        <div
            className={`${sizeClass} rounded-full border-gray-700 border-t-indigo-500 animate-spin ${className}`}
            role="status"
            aria-label="Loading"
        />
    );
}