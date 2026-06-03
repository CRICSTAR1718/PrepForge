// server/services/evaluator.js
// Calls Gemini API to evaluate a student's daily log
// Uses @google/generative-ai package — install with: npm install @google/generative-ai

import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildEvaluationPrompt } from './openai/prompts.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Evaluates a daily log and returns score, feedback, and suggestions.
 *
 * @param {Object} params
 * @param {string} params.domain          - e.g. "DSA", "Full Stack Web Development"
 * @param {string[]} params.plannedTasks  - Tasks from the plan for this day
 * @param {string[]} params.tasksCompleted - Tasks the user marked as done
 * @param {number} params.timeSpentMinutes
 * @param {string} params.notes
 * @param {number} params.difficultyRating - 1–5
 *
 * @returns {{ score: number, feedback: string, suggestions: string[] }}
 */
export async function evaluateLog({ domain, plannedTasks, tasksCompleted, timeSpentMinutes, notes, difficultyRating }) {
    const prompt = buildEvaluationPrompt({
        domain,
        plannedTasks,
        tasksCompleted,
        timeSpentMinutes,
        notes,
        difficultyRating,
    });

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent(prompt);
    const rawText = result.response.text();

    // Strip markdown code fences if Gemini wraps the JSON in ```json ... ```
    const cleaned = rawText
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/g, '')
        .trim();

    let parsed;
    try {
        parsed = JSON.parse(cleaned);
    } catch {
        throw new Error(`Gemini returned non-JSON response: ${rawText.slice(0, 200)}`);
    }

    // Validate shape
    if (
        typeof parsed.score !== 'number' ||
        typeof parsed.feedback !== 'string' ||
        !Array.isArray(parsed.suggestions)
    ) {
        throw new Error('Gemini response missing required fields: score, feedback, suggestions');
    }

    // Clamp score to 0–100
    parsed.score = Math.max(0, Math.min(100, Math.round(parsed.score)));

    return {
        score: parsed.score,
        feedback: parsed.feedback,
        suggestions: parsed.suggestions.slice(0, 3), // max 3 suggestions
    };
}