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
  revenueYoY: string;
  eps: string;
  epsExpected: string;
  epsBeatMiss: string;
  epsYoY: string;
  fiscalYear: string;
  fiscalQuarter: string;
  guidance: string;
  keyHighlights: string[];
}> {
  const quarterStr = quarter || "most recent quarter";
  const systemPrompt = `You are a financial analyst specializing in earnings reports.
Provide structured earnings data with ACTUAL vs EXPECTED figures and YEAR-OVER-YEAR growth.
Be precise with numbers. Use format like "$10.3B" for revenue and "$2.19" for EPS.
For beat/miss, calculate: ((actual - expected) / expected * 100) and format as "+X.X%" or "-X.X%".
For YoY growth, format as "+X%" or "-X%".`;

  const userPrompt = `Get the ${quarterStr} earnings data for ${company}. Include:
- Fiscal quarter (e.g., "Q3") and fiscal year (e.g., "FY2026")
- Revenue: actual value, analyst expected value, beat/miss percentage vs estimate, year-over-year growth %
- EPS: actual value, analyst expected value, beat/miss percentage vs estimate, year-over-year growth %
- Forward guidance (raised/maintained/lowered)
- Key highlights from the earnings call

IMPORTANT: 
- Beat/miss is (actual - expected) / expected * 100
- If actual < expected, it's a MISS with negative percentage
- YoY growth is compared to same quarter last year

Respond in JSON format with keys: fiscalQuarter, fiscalYear, revenue, revenueExpected, revenueBeatMiss, revenueYoY, eps, epsExpected, epsBeatMiss, epsYoY, guidance, keyHighlights`;

  const response = await callPerplexity(systemPrompt, userPrompt);
  
  try {
    // Try to parse JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[0]);
      // Validate and recalculate beat/miss if needed
      return validateEarningsData(data);
    }
  } catch (e) {
    // If parsing fails, return structured default
  }
  
  return {
    revenue: "N/A",
    revenueExpected: "N/A",
    revenueBeatMiss: "N/A",
    revenueYoY: "N/A",
    eps: "N/A",
    epsExpected: "N/A",
    epsBeatMiss: "N/A",
    epsYoY: "N/A",
    fiscalYear: "N/A",
    fiscalQuarter: "N/A",
    guidance: "N/A",
    keyHighlights: [response],
  };
}

/**
 * Validate and recalculate beat/miss percentages if they seem incorrect
 */
function validateEarningsData(data: any): any {
  // Helper to parse numeric values from strings like "$10.3B" or "$2.19"
  const parseValue = (str: string): number | null => {
    if (!str || str === "N/A") return null;
    const match = str.match(/[\d.]+/);
    if (!match) return null;
    let value = parseFloat(match[0]);
    // Handle B/M suffixes
    if (str.toUpperCase().includes("B")) value *= 1;
    else if (str.toUpperCase().includes("M")) value *= 0.001;
    return value;
  };

  // Helper to calculate beat/miss percentage
  const calculateBeatMiss = (actual: number | null, expected: number | null): string | null => {
    if (actual === null || expected === null || expected === 0) return null;
    const pct = ((actual - expected) / expected) * 100;
    const sign = pct >= 0 ? "+" : "";
    return `${sign}${pct.toFixed(2)}%`;
  };

  // Validate revenue beat/miss
  const revenueActual = parseValue(data.revenue);
  const revenueExpected = parseValue(data.revenueExpected);
  if (revenueActual !== null && revenueExpected !== null) {
    const calculatedBeatMiss = calculateBeatMiss(revenueActual, revenueExpected);
    // If the provided beat/miss seems way off, recalculate
    if (calculatedBeatMiss && data.revenueBeatMiss) {
      const providedPct = parseFloat(data.revenueBeatMiss);
      const calculatedPct = parseFloat(calculatedBeatMiss);
      if (Math.abs(providedPct - calculatedPct) > 5) {
        // Use recalculated value
        data.revenueBeatMiss = calculatedBeatMiss;
      }
    } else if (calculatedBeatMiss && !data.revenueBeatMiss) {
      data.revenueBeatMiss = calculatedBeatMiss;
    }
  }

  // Validate EPS beat/miss
  const epsActual = parseValue(data.eps);
  const epsExpected = parseValue(data.epsExpected);
  if (epsActual !== null && epsExpected !== null) {
    const calculatedBeatMiss = calculateBeatMiss(epsActual, epsExpected);
    if (calculatedBeatMiss && data.epsBeatMiss) {
      const providedPct = parseFloat(data.epsBeatMiss);
      const calculatedPct = parseFloat(calculatedBeatMiss);
      if (Math.abs(providedPct - calculatedPct) > 5) {
        data.epsBeatMiss = calculatedBeatMiss;
      }
    } else if (calculatedBeatMiss && !data.epsBeatMiss) {
      data.epsBeatMiss = calculatedBeatMiss;
    }
  }

  return data;
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
    url: string | null;
  }[];
  consensusRating: string;
  averagePriceTarget: string;
}> {
  const systemPrompt = `You are a financial analyst tracking Wall Street coverage and ratings.
Provide accurate, recent analyst reports with specific price targets and ratings.
Focus on reports from the past 30 days.
When possible, include URLs to the source articles or news coverage of the analyst reports.`;

  const userPrompt = `Get the most recent analyst reports and ratings for ${company}. Include:
- Analyst name and firm
- Rating (Buy/Hold/Sell or equivalent)
- Price target
- Date of the report
- Brief summary of the analyst's key points
- URL to the news article or report coverage (if available, otherwise null)

Also provide the consensus rating and average price target.

Respond in JSON format with keys: reports (array with analyst, firm, rating, priceTarget, date, summary, url), consensusRating, averagePriceTarget`;

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


