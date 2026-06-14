import { useState, useCallback } from "react";
import { sendMentorMessage } from "../services/mentorService.js";

/**
 * useMentor — manages the full mentor chat session.
 *
 * messages: [{ role: "user"|"assistant", content: string }]
 * The full history is sent to the backend on every message so Gemini has context.
 */
export function useMentor() {
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content:
                "Hi! I'm PrepMentor 👋 I'm here to help you crack your placement preparation. Ask me anything — concepts, strategy, resources, or just tell me how today went!",
        },
    ]);
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
                const reply = await sendMentorMessage(updatedMessages);
                setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
            } catch (err) {
                setError("Couldn't reach PrepMentor. Please try again.");
                console.error(err);
            } finally {
                setIsTyping(false);
            }
        },
        [messages]
    );

    const clearChat = useCallback(() => {
        setMessages([
            {
                role: "assistant",
                content:
                    "Hi! I'm PrepMentor 👋 I'm here to help you crack your placement preparation. Ask me anything — concepts, strategy, resources, or just tell me how today went!",
            },
        ]);
        setError(null);
    }, []);

    return { messages, isTyping, error, sendMessage, clearChat };
}