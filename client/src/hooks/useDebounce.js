// client/src/hooks/useDebounce.js
// Delays updating a value until the user stops changing it
// Used in useTracker to auto-save draft 1.5s after the last keystroke

import { useState, useEffect } from 'react';

export function useDebounce(value, delay = 500) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Clear timer if value changes before delay is up
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}