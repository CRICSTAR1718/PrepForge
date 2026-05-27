import Plan from "../models/Plan.js";
import User from "../models/User.js";
import { generatePlan } from "../services/planGenerator.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

// POST /api/plans
const createPlan = async (req, res) => {
    try {
        const { domain, durationDays } = req.body;

        if (!domain || !durationDays) {
            return res.status(400).json(errorResponse("Domain and durationDays are required."));
        }

        const validDomains = ["DSA", "Full Stack", "Aptitude"];
        if (!validDomains.includes(domain)) {
            return res.status(400).json(errorResponse("Invalid domain. Choose DSA, Full Stack, or Aptitude."));
        }

        if (durationDays < 15 || durationDays > 90) {
            return res.status(400).json(errorResponse("Duration must be between 15 and 90 days."));
        }

        const days = await generatePlan(domain, durationDays);

        const plan = await Plan.create({
            userId: req.user.id,
            domain,
            durationDays,
            days,
        });

        await User.findByIdAndUpdate(req.user.id, {
            domain,
            planDuration: durationDays,
            currentPlanId: plan._id,
        });

        return res.status(201).json(successResponse("Plan generated successfully.", { plan }));
    } catch (err) {
        console.error("createPlan error:", err.message);
        return res.status(500).json(errorResponse("Failed to generate plan. Please try again."));
    }
};

// GET /api/plans/:id
const getPlan = async (req, res) => {
    try {
        const plan = await Plan.findById(req.params.id);

        if (!plan) {
            return res.status(404).json(errorResponse("Plan not found."));
        }

        if (plan.userId.toString() !== req.user.id) {
            return res.status(403).json(errorResponse("Access denied."));
        }

        return res.status(200).json(successResponse("Plan fetched successfully.", { plan }));
    } catch (err) {
        console.error("getPlan error:", err.message);
        return res.status(500).json(errorResponse("Failed to fetch plan."));
    }
};

// GET /api/plans/my
const getMyPlan = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user.currentPlanId) {
            return res.status(404).json(errorResponse("No active plan found."));
        }

        const plan = await Plan.findById(user.currentPlanId);

        if (!plan) {
            return res.status(404).json(errorResponse("Plan not found."));
        }

        return res.status(200).json(successResponse("Plan fetched successfully.", { plan }));
    } catch (err) {
        console.error("getMyPlan error:", err.message);
        return res.status(500).json(errorResponse("Failed to fetch plan."));
    }
};

export { createPlan, getPlan, getMyPlan };