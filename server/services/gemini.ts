/**
 * Gemini Service
 * Google Gemini 3 model provider for agent LLM calls
 */

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

if (!GOOGLE_API_KEY) {
  console.warn("Warning: GOOGLE_API_KEY not set. Gemini service will not function.");
}

/**
 * Create a Gemini 3 chat model instance
 */
export function createGeminiModel(options: {
  temperature?: number;
  maxOutputTokens?: number;
} = {}) {
  return new ChatGoogleGenerativeAI({
    modelName: "gemini-2.0-flash-exp", // Using latest available Gemini model
    apiKey: GOOGLE_API_KEY,
    temperature: options.temperature ?? 0,
    maxOutputTokens: options.maxOutputTokens ?? 8192,
  });
}

/**
 * Generate a completion using Gemini
 */
export async function generateCompletion(
  prompt: string,
  options: {
    temperature?: number;
    maxOutputTokens?: number;
  } = {}
): Promise<string> {
  const model = createGeminiModel(options);
  const response = await model.invoke(prompt);
  return response.content as string;
}

/**
 * Generate structured JSON output using Gemini
 */
export async function generateStructuredOutput<T>(
  prompt: string,
  options: {
    temperature?: number;
  } = {}
): Promise<T> {
  const model = createGeminiModel({ ...options, temperature: options.temperature ?? 0 });
  const response = await model.invoke([
    {
      role: "user",
      content: `${prompt}\n\nRespond only with valid JSON, no markdown or explanation.`,
    },
  ]);
  
  const content = response.content as string;
  // Extract JSON from response (handle potential markdown code blocks)
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
  const jsonStr = jsonMatch[1]?.trim() || content.trim();
  
  return JSON.parse(jsonStr) as T;
}

export default {
  createGeminiModel,
  generateCompletion,
  generateStructuredOutput,
};

