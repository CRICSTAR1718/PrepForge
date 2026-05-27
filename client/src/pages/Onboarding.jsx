import { useNavigate } from "react-router-dom";
import OnboardingForm from "../components/forms/OnboardingForm";
import usePlan from "../hooks/usePlan";

const Onboarding = () => {
    const navigate = useNavigate();
    const { generatePlan, loading, error } = usePlan();

    const handleSubmit = async ({ domain, durationDays }) => {
        try {
            await generatePlan(domain, durationDays);
            navigate("/plan");
        } catch (_err) {
            // error is already set in usePlan, shown below
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
            <div className="w-full max-w-2xl">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Let's build your plan
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                        Tell us what you're preparing for and how long you have.
                        Our AI will create a personalised day-by-day roadmap.
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-8">
                    <OnboardingForm onSubmit={handleSubmit} loading={loading} />
                    {error && (
                        <p className="text-red-500 text-sm text-center mt-4">{error}</p>
                    )}
                </div>

                {/* Loading overlay message */}
                {loading && (
                    <p className="text-center text-indigo-500 text-sm mt-4 animate-pulse">
                        ✨ AI is crafting your personalised plan — this takes ~10 seconds...
                    </p>
                )}
            </div>
        </div>
    );
};

export default Onboarding;