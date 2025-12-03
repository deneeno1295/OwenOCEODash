/**
 * Grok Service (xAI)
 * Sentiment analysis and topic extraction via Grok API
 */

import axios from "axios";

const GROK_API_KEY = process.env.GROK_API_KEY;
const GROK_BASE_URL = "https://api.x.ai/v1/chat/completions";

if (!GROK_API_KEY) {
  console.warn("Warning: GROK_API_KEY not set. Grok service will not function.");
}

interface GrokResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

async function callGrok(
  systemPrompt: string,
  userPrompt: string,
  options: { temperature?: number } = {}
): Promise<string> {
  if (!GROK_API_KEY) {
    throw new Error("GROK_API_KEY is not configured");
  }

  const response = await axios.post<GrokResponse>(
    GROK_BASE_URL,
    {
      model: "grok-beta",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: options.temperature ?? 0,
    },
    {
      headers: {
        Authorization: `Bearer ${GROK_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data.choices[0]?.message?.content || "";
}

/**
 * Analyze sentiment of text content
 */
export async function analyzeSentiment(text: string): Promise<{
  score: number; // 0-1 scale (0 = very negative, 1 = very positive)
  label: "positive" | "negative" | "neutral";
  confidence: number;
  reasoning: string;
}> {
  const systemPrompt = `You are an expert sentiment analyst. Analyze the sentiment of the provided text with precision.
Return a JSON object with:
- score: number from 0 to 1 (0 = very negative, 0.5 = neutral, 1 = very positive)
- label: "positive", "negative", or "neutral"
- confidence: number from 0 to 1 indicating your confidence in the assessment
- reasoning: brief explanation of your analysis`;

  const response = await callGrok(systemPrompt, text);
  
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    // Default response if parsing fails
  }
  
  return {
    score: 0.5,
    label: "neutral",
    confidence: 0.5,
    reasoning: response,
  };
}

/**
 * Extract topics and themes from content with sentiment per topic
 */
export async function extractTopics(content: string): Promise<{
  topics: {
    name: string;
    sentiment: "positive" | "negative" | "neutral";
    score: number;
    mentions: number;
    keyPhrases: string[];
  }[];
  summary: string;
}> {
  const systemPrompt = `You are an expert content analyst. Extract the main topics and themes from the provided content.
For each topic, analyze its sentiment and identify key phrases.
Return a JSON object with:
- topics: array of objects with name, sentiment, score (0-1), mentions count, and keyPhrases array
- summary: brief overall summary of the content themes`;

  const response = await callGrok(systemPrompt, content);
  
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    // Default response if parsing fails
  }
  
  return {
    topics: [],
    summary: response,
  };
}

/**
 * Analyze social media sentiment for a topic or company
 */
export async function analyzeSocialSentiment(
  topic: string,
  context?: string
): Promise<{
  overallSentiment: number;
  trendDirection: "improving" | "declining" | "stable";
  keyThemes: string[];
  riskFactors: string[];
  opportunities: string[];
}> {
  const systemPrompt = `You are a social media sentiment analyst specializing in corporate and market analysis.
Analyze sentiment trends and identify key themes, risks, and opportunities.`;

  const userPrompt = `Analyze the current social media sentiment for: ${topic}
${context ? `Additional context: ${context}` : ""}

Provide:
- overallSentiment: score from 0-1
- trendDirection: "improving", "declining", or "stable"
- keyThemes: main discussion themes
- riskFactors: potential concerns or negative trends
- opportunities: positive signals or opportunities

Respond in JSON format.`;

  const response = await callGrok(systemPrompt, userPrompt);
  
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    // Default response if parsing fails
  }
  
  return {
    overallSentiment: 0.5,
    trendDirection: "stable",
    keyThemes: [],
    riskFactors: [],
    opportunities: [],
  };
}

export default {
  analyzeSentiment,
  extractTopics,
  analyzeSocialSentiment,
};


