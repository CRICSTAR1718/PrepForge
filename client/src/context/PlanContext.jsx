import { createContext, useState, useContext } from "react";

const PlanContext = createContext(null);

export const PlanProvider = ({ children }) => {
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    return (
        <PlanContext.Provider value={{ plan, setPlan, loading, setLoading, error, setError }}>
            {children}
        </PlanContext.Provider>
    );
};

export const usePlanContext = () => {
    const ctx = useContext(PlanContext);
    if (!ctx) throw new Error("usePlanContext must be used inside PlanProvider");
    return ctx;
};