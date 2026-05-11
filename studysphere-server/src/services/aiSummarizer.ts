import Groq from "groq-sdk";
import type { AIMessage } from "../types/ai.interface.js";
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const summarizeConversation = async (
  messages: AIMessage[],
): Promise<string> => {
  try {
    const transcript = messages.map((m) => m.content).join("\n");

    const prompt = `
        Summarize the following conversation clearly and concisely.

        Focus on:
        - Key topics discussed
        - Important decisions or conclusions
        - Any action items

        Conversation:
        ${transcript}
    `;

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that summarizes conversations clearly and concisely.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 300,
    });

    return (
      response.choices[0]?.message?.content?.trim() || "No summary generated."
    );
  } catch (error) {
    console.error("AI Summarization Error:", error);
    throw new Error("Failed to summarize conversation");
  }
};
