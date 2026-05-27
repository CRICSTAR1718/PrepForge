import geminiModel from "./openai/openaiClient.js";
import { getPlanGenerationPrompt } from "./openai/prompts.js";

const generatePlan = async (domain, durationDays) => {
    const prompt = getPlanGenerationPrompt(domain, durationDays);

    const result = await geminiModel.generateContent(prompt);
    const rawText = result.response.text().trim();

    let days;
    try {
        days = JSON.parse(rawText);
    } catch (err) {
        // Strip markdown code fences if Gemini adds them
        const cleaned = rawText
            .replace(/^```json\s*/i, "")
            .replace(/^```\s*/i, "")
            .replace(/```\s*$/, "")
            .trim();
        days = JSON.parse(cleaned);
    }

    if (!Array.isArray(days)) {
        throw new Error("Gemini did not return a valid plan array.");
    }

    const validated = days.map((d, i) => ({
        day: d.day ?? i + 1,
        topic: d.topic ?? `Day ${i + 1}`,
        tasks: Array.isArray(d.tasks) ? d.tasks : [],
        estimatedMinutes: d.estimatedMinutes ?? 90,
    }));

    return validated;
};

export { generatePlan };