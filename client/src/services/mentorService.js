import api from "./api.js";

/**
 * Sends the full conversation history to the backend mentor endpoint.
 * messages: [{ role: "user" | "assistant", content: string }]
 */
export const sendMentorMessage = async (messages) => {
    const res = await api.post("/mentor/chat", { messages });
    return res.data.reply;
};