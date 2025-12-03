/**
 * OpenAI Content Service
 * News article analysis and summarization via OpenAI API
 */

import axios from "axios";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_BASE_URL = "https://api.openai.com/v1/chat/completions";

if (!OPENAI_API_KEY) {
  console.warn("Warning: OPENAI_API_KEY not set. OpenAI content service will not function.");
}

interface OpenAIResponse {
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

async function callOpenAI(
  systemPrompt: string,
  userPrompt: string,
  options: { temperature?: number; model?: string } = {}
): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const response = await axios.post<OpenAIResponse>(
    OPENAI_BASE_URL,
    {
      model: options.model || "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: options.temperature ?? 0.3,
      max_tokens: 4096,
    },
    {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data.choices[0]?.message?.content || "";
}

/**
 * Get recent news articles and analysis for a company
 */
export async function getCompanyArticles(
  company: string,
  daysBack: number = 14
): Promise<{
  articles: {
    title: string;
    source: string;
    date: string;
    summary: string;
    keyPoints: string[];
    sentiment: "positive" | "negative" | "neutral";
    relevance: "high" | "medium" | "low";
  }[];
  themes: string[];
  overallNarrative: string;
}> {
  const systemPrompt = `You are a business news analyst specializing in corporate coverage.
Analyze recent news articles about companies, identifying key themes, sentiment, and strategic implications.
Focus on substantive news: earnings, product launches, partnerships, acquisitions, leadership changes, regulatory issues.`;

  const userPrompt = `Analyze the most important recent news articles about ${company} from the past ${daysBack} days.

For each article provide:
- Title
- Source (publication name)
- Date (approximate if exact unknown)
- Brief summary (2-3 sentences)
- Key points (bullet points)
- Sentiment (positive/negative/neutral)
- Relevance to investors/competitors (high/medium/low)

Also provide:
- Common themes across articles
- Overall narrative/story about the company

Respond in JSON format with keys: articles (array with title, source, date, summary, keyPoints, sentiment, relevance), themes (array of strings), overallNarrative (string)`;

  const response = await callOpenAI(systemPrompt, userPrompt);
  
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    // If parsing fails, return structured default
  }
  
  return {
    articles: [],
    themes: [],
    overallNarrative: `Unable to fetch articles for ${company}`,
  };
}

/**
 * Analyze a specific article or text for insights
 */
export async function analyzeArticle(
  content: string,
  company: string
): Promise<{
  summary: string;
  keyTakeaways: string[];
  implications: string[];
  sentiment: "positive" | "negative" | "neutral";
  competitiveImpact: string;
}> {
  const systemPrompt = `You are a strategic business analyst. Analyze news articles for competitive intelligence and strategic implications.`;

  const userPrompt = `Analyze this article/content about ${company}:

${content}

Provide:
- Brief summary (2-3 sentences)
- Key takeaways (bullet points)
- Strategic implications for competitors
- Overall sentiment
- Competitive impact assessment

Respond in JSON format with keys: summary, keyTakeaways (array), implications (array), sentiment, competitiveImpact`;

  const response = await callOpenAI(systemPrompt, userPrompt);
  
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    // If parsing fails, return structured default
  }
  
  return {
    summary: "Unable to analyze content",
    keyTakeaways: [],
    implications: [],
    sentiment: "neutral",
    competitiveImpact: "Unknown",
  };
}

export default {
  getCompanyArticles,
  analyzeArticle,
};

