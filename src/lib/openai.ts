import OpenAI from "openai";

// Singleton OpenAI client
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});
