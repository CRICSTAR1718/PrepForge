import { useCallback } from "react";
import { usePlanContext } from "../context/PlanContext";
import { createPlan, getMyPlan } from "../services/planService";

const usePlan = () => {
    const { plan, setPlan, loading, setLoading, error, setError } = usePlanContext();

    // Called from the Onboarding page after form submit
    const generatePlan = useCallback(async (domain, durationDays, level) => {
        setLoading(true);
        void level; // reserved for level-aware plan generation
        setError(null);
        try {
            const newPlan = await createPlan(domain, durationDays, level);
            setPlan(newPlan);
            return newPlan;
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to generate plan.";
            setError(msg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [setError, setLoading, setPlan]);

    // Called from the Plan page on load to restore existing plan
    const fetchMyPlan = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const existingPlan = await getMyPlan();
            setPlan(existingPlan);
            return existingPlan;
        } catch (err) {
            const msg = err.response?.data?.message || "No active plan found.";
            setError(msg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [setError, setLoading, setPlan]);

    return { plan, loading, error, generatePlan, fetchMyPlan };
};

export default usePlan;
