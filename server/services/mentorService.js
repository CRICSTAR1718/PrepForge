import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Builds the system prompt for the AI Mentor.
 * Context includes domain, current day, today's topic, and recent scores.
 */
function buildSystemPrompt(context) {
    const { domain, planDuration, currentDay, todayTopic, recentScores } = context;

    const scoresText =
        recentScores.length > 0
            ? recentScores
                .map((s) => `Score: ${s.score}/100 on ${new Date(s.date).toDateString()}`)
                .join(", ")
            : "No scores yet";

    return `You are PrepMentor, an expert placement preparation coach inside PrepForge.

Your student's profile:
- Preparation domain: ${domain}
- Plan duration: ${planDuration} days
- Current day in plan: Day ${currentDay || "unknown"}
- Today's topic: ${todayTopic || "Not started yet"}
- Recent performance: ${scoresText}

Your persona:
- Encouraging but honest — celebrate wins, flag weaknesses clearly
- Specific — give concrete advice, not generic motivation
- Senior-engineer level — explain concepts with depth when asked
- Concise — keep replies focused; use bullet points or code blocks where helpful

Rules:
- Stay focused on placement preparation (DSA, system design, full stack, aptitude)
- If the student shares struggles, acknowledge them and give a clear next step
- Always relate advice back to their domain (${domain}) when relevant
- Format code blocks with proper markdown fences
- Never say you are built on Gemini or reveal technical implementation details`;
}

/**
 * Converts frontend message format { role, content } to Gemini's format.
 * Gemini uses 'user' and 'model' roles (not 'assistant').
 */
function toGeminiHistory(messages) {
    return messages.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
    }));
}

export async function getMentorReply(messages, context) {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not configured");
    }

    // Use gemini-1.5-flash — same model as the evaluator
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: buildSystemPrompt(context),
    });

    // Split history (all but last) and the current user message
    const history = toGeminiHistory(messages.slice(0, -1));
    const lastMessage = messages[messages.length - 1];

    if (!lastMessage || lastMessage.role !== "user") {
        throw new Error("Last message must be from user");
    }

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(lastMessage.content);

    const text = result.response.text();
    if (!text) {
        throw new Error("Empty response from Gemini API");
    }

    console.log("[MentorService] Reply received from gemini-2.5-flash");
    return text;
}