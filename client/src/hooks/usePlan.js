import { usePlanContext } from "../context/PlanContext";
import { createPlan, getMyPlan } from "../services/planService";

const usePlan = () => {
    const { plan, setPlan, loading, setLoading, error, setError } = usePlanContext();

    // Called from the Onboarding page after form submit
    const generatePlan = async (domain, durationDays) => {
        setLoading(true);
        setError(null);
        try {
            const newPlan = await createPlan(domain, durationDays);
            setPlan(newPlan);
            return newPlan;
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to generate plan.";
            setError(msg);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Called from the Plan page on load to restore existing plan
    const fetchMyPlan = async () => {
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
    };

    return { plan, loading, error, generatePlan, fetchMyPlan };
};

export default usePlan;