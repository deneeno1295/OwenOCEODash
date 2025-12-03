/**
 * Perplexity Service
 * Real-time market research and web search via Perplexity API
 */

import axios from "axios";

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const PERPLEXITY_BASE_URL = "https://api.perplexity.ai/chat/completions";

if (!PERPLEXITY_API_KEY) {
  console.warn("Warning: PERPLEXITY_API_KEY not set. Perplexity service will not function.");
}

interface PerplexityResponse {
  id: string;
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

async function callPerplexity(
  systemPrompt: string,
  userPrompt: string,
  options: { temperature?: number } = {}
): Promise<string> {
  if (!PERPLEXITY_API_KEY) {
    throw new Error("PERPLEXITY_API_KEY is not configured");
  }

  const response = await axios.post<PerplexityResponse>(
    PERPLEXITY_BASE_URL,
    {
      model: "sonar",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: options.temperature ?? 0.2,
      max_tokens: 4096,
    },
    {
      headers: {
        Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data.choices[0]?.message?.content || "";
}

/**
 * Search for real-time market data and analysis
 */
export async function searchMarketData(query: string): Promise<string> {
  const systemPrompt = `You are a financial research assistant with access to real-time market data. 
Provide accurate, up-to-date information about market trends, stock performance, and industry analysis.
Include specific numbers, dates, and sources when available.`;

  return callPerplexity(systemPrompt, query);
}

/**
 * Get quarterly earnings data for a company
 */
export async function getEarningsData(
  company: string,
  quarter?: string
): Promise<{
  revenue: string;
  revenueExpected: string;
  revenueBeatMiss: string;
  eps: string;
  epsExpected: string;
  epsBeatMiss: string;
  guidance: string;
  keyHighlights: string[];
}> {
  const quarterStr = quarter || "most recent quarter";
  const systemPrompt = `You are a financial analyst specializing in earnings reports.
Provide structured earnings data with actual vs expected figures.
Always include specific numbers and percentage changes.`;

  const userPrompt = `Get the ${quarterStr} earnings data for ${company}. Include:
- Revenue (actual, expected, beat/miss percentage)
- EPS (actual, expected, beat/miss percentage)
- Forward guidance (raised/maintained/lowered)
- Key highlights from the earnings call

Respond in JSON format with keys: revenue, revenueExpected, revenueBeatMiss, eps, epsExpected, epsBeatMiss, guidance, keyHighlights`;

  const response = await callPerplexity(systemPrompt, userPrompt);
  
  try {
    // Try to parse JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    // If parsing fails, return structured default
  }
  
  return {
    revenue: "N/A",
    revenueExpected: "N/A",
    revenueBeatMiss: "N/A",
    eps: "N/A",
    epsExpected: "N/A",
    epsBeatMiss: "N/A",
    guidance: "N/A",
    keyHighlights: [response],
  };
}

/**
 * Get recent company news (last 30 days)
 */
export async function getCompanyNews(
  company: string,
  daysBack: number = 30
): Promise<{
  articles: {
    title: string;
    summary: string;
    source: string;
    date: string;
    sentiment: "positive" | "negative" | "neutral";
  }[];
  overallSentiment: string;
}> {
  const systemPrompt = `You are a news analyst tracking corporate developments.
Focus on strategic news: partnerships, product launches, acquisitions, leadership changes, and major announcements.
Categorize sentiment for each piece of news.`;

  const userPrompt = `Find the most important news about ${company} from the last ${daysBack} days.
For each article, provide: title, brief summary, source, date, and sentiment (positive/negative/neutral).
Also provide an overall sentiment assessment.

Respond in JSON format with keys: articles (array), overallSentiment`;

  const response = await callPerplexity(systemPrompt, userPrompt);
  
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
    overallSentiment: response,
  };
}

/**
 * Get recent analyst reports and ratings for a company
 */
export async function getAnalystReports(
  company: string
): Promise<{
  reports: {
    analyst: string;
    firm: string;
    rating: string;
    priceTarget: string;
    date: string;
    summary: string;
  }[];
  consensusRating: string;
  averagePriceTarget: string;
}> {
  const systemPrompt = `You are a financial analyst tracking Wall Street coverage and ratings.
Provide accurate, recent analyst reports with specific price targets and ratings.
Focus on reports from the past 30 days.`;

  const userPrompt = `Get the most recent analyst reports and ratings for ${company}. Include:
- Analyst name and firm
- Rating (Buy/Hold/Sell or equivalent)
- Price target
- Date of the report
- Brief summary of the analyst's key points

Also provide the consensus rating and average price target.

Respond in JSON format with keys: reports (array with analyst, firm, rating, priceTarget, date, summary), consensusRating, averagePriceTarget`;

  const response = await callPerplexity(systemPrompt, userPrompt);
  
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    // If parsing fails, return structured default
  }
  
  return {
    reports: [],
    consensusRating: "N/A",
    averagePriceTarget: "N/A",
  };
}

export default {
  searchMarketData,
  getEarningsData,
  getCompanyNews,
  getAnalystReports,
};


