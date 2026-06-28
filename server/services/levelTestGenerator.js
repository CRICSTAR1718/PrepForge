import geminiModel from "./openai/openaiClient.js";

const buildPrompt = (level) => {
    const difficultyHint =
        level === "Intermediate"
            ? "Intermediate level — mostly conceptual with basic application"
            : "Advanced level — tricky concepts, edge cases, and deeper application";

    return `You are generating a short MCQ test to verify a user's self-reported level.

Level: ${level}
${difficultyHint}

Rules:
- Generate exactly 3 questions.
- Each question has 4 options (A-D).
- Provide the correct option as the key using letter: "A" | "B" | "C" | "D".
- Topic areas should be broadly aligned with programming aptitude (not domain-specific).
- Return ONLY valid JSON. No markdown.

JSON schema:
{
  "questions": [
    {
      "id": "q1",
      "question": "...",
      "options": {
        "A": "...",
        "B": "...",
        "C": "...",
        "D": "..."
      },
      "answerKey": "A" | "B" | "C" | "D"
    }
  ]
}
`;
};

export async function generateLevelTest(level) {
    const prompt = buildPrompt(level);
    const result = await geminiModel.generateContent(prompt);
    const rawText = result.response.text().trim();

    const cleaned = rawText
        .replace(/```json\s*/gi, "")
        .replace(/```\s*/gi, "")
        .trim();

    const parsed = JSON.parse(cleaned);

    if (!parsed?.questions || !Array.isArray(parsed.questions) || parsed.questions.length !== 3) {
        throw new Error("Gemini returned invalid MCQ JSON");
    }

    // Ensure only what frontend needs is exposed
    return {
        questions: parsed.questions.map((q) => ({
            id: q.id,
            question: q.question,
            options: q.options,
            answerKey: q.answerKey,
        })),
    };
}

