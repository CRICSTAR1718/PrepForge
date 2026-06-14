import { useState, useCallback } from "react";
import { sendMentorMessage } from "../services/mentorService.js";

/**
 * useMentor — manages the full mentor chat session.
 *
 * messages: [{ role: "user"|"assistant", content: string }]
 * The conversation history (excluding initial greeting) is sent to the backend.
 */
export function useMentor() {
    const initialGreeting = {
        role: "assistant",
        content:
            "Hi! I'm PrepMentor 👋 I'm here to help you crack your placement preparation. Ask me anything — concepts, strategy, resources, or just tell me how today went!",
    };

    const [messages, setMessages] = useState([initialGreeting]);
    const [isTyping, setIsTyping] = useState(false);
    const [error, setError] = useState(null);

    const sendMessage = useCallback(
        async (content) => {
            if (!content.trim()) return;

            // Optimistically add user message
            const userMsg = { role: "user", content: content.trim() };
            const updatedMessages = [...messages, userMsg];
            setMessages(updatedMessages);
            setIsTyping(true);
            setError(null);

            try {
                // Only send conversation history (skip initial greeting)
                const conversationHistory = updatedMessages.slice(1); // exclude initial greeting
                if (conversationHistory.length === 0) {
                    setError("No valid conversation history to send.");
                    setIsTyping(false);
                    return;
                }

                const reply = await sendMentorMessage(conversationHistory);
                setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
            } catch (err) {
                // Remove the user message on error
                setMessages((prev) => prev.slice(0, -1));

                const errMsg = err.response?.data?.message || err.message || "Couldn't reach PrepMentor. Please try again.";
                console.error("[useMentor] Error:", {
                    status: err.response?.status,
                    message: errMsg,
                    details: err.response?.data,
                });
                setError(errMsg);
            } finally {
                setIsTyping(false);
            }
        },
        [messages]
    );

    const clearChat = useCallback(() => {
        setMessages([initialGreeting]);
        setError(null);
    }, []);

    return { messages, isTyping, error, sendMessage, clearChat };
}