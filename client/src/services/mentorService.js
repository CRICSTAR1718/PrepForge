import api from "./api.js";

/**
 * Sends the full conversation history to the backend mentor endpoint.
 * messages: [{ role: "user" | "assistant", content: string }]
 */
export const sendMentorMessage = async (messages) => {
    try {
        console.log("[mentorService] Sending", messages.length, "messages to backend");
        const res = await api.post("/mentor/chat", { messages });
        console.log("[mentorService] Received reply:", res.data);
        return res.data.reply;
    } catch (err) {
        console.error("[mentorService] API error:", {
            status: err.response?.status,
            message: err.response?.data?.message,
            error: err.message,
        });
        throw err;
    }
};