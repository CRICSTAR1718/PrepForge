import dotenv from "dotenv";

dotenv.config();
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Create a wrapper that tries multiple models
const createGeminiModel = () => {
    const modelOptions = [
        "gemini-2.5-flash",
        "gemini-2.5-flash-lite",
        "gemini-3-flash",
        "gemini-3.1-flash-lite"
    ];

    return {
        async generateContent(prompt) {
            for (const modelName of modelOptions) {
                try {
                    console.log(`[OpenAIClient] Trying model: ${modelName}`);
                    const model = genAI.getGenerativeModel({ model: modelName });
                    const result = await model.generateContent(prompt);
                    console.log(`[OpenAIClient] Success with model: ${modelName}`);
                    return result;
                } catch (error) {
                    console.warn(`[OpenAIClient] Model ${modelName} failed:`, error.message);
                    continue;
                }
            }
            throw new Error("No available Gemini models");
        },
    };
};

const geminiModel = createGeminiModel();
export default geminiModel;
