/**
 * Tavily Service
 * AI-powered web search for real-time information
 */

import axios from "axios";

const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
const TAVILY_BASE_URL = "https://api.tavily.com";

if (!TAVILY_API_KEY) {
  console.warn("Warning: TAVILY_API_KEY not set. Tavily service will not function.");
}

interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
  published_date?: string;
}

interface TavilySearchResponse {
  query: string;
  results: TavilySearchResult[];
  answer?: string;
  response_time: number;
}

/**
 * Perform a web search using Tavily
 */
export async function webSearch(
  query: string,
  options?: {
    searchDepth?: "basic" | "advanced";
    includeAnswer?: boolean;
    includeRawContent?: boolean;
    maxResults?: number;
    includeDomains?: string[];
    excludeDomains?: string[];
  }
): Promise<{
  results: {
    title: string;
    url: string;
    content: string;
    score: number;
    publishedDate: string | null;
  }[];
  answer: string | null;
  responseTime: number;
}> {
  if (!TAVILY_API_KEY) {
    throw new Error("TAVILY_API_KEY is not configured");
  }

  const response = await axios.post<TavilySearchResponse>(
    `${TAVILY_BASE_URL}/search`,
    {
      api_key: TAVILY_API_KEY,
      query,
      search_depth: options?.searchDepth || "advanced",
      include_answer: options?.includeAnswer ?? true,
      include_raw_content: options?.includeRawContent ?? false,
      max_results: options?.maxResults || 10,
      include_domains: options?.includeDomains,
      exclude_domains: options?.excludeDomains,
    }
  );

  return {
    results: response.data.results.map((r) => ({
      title: r.title,
      url: r.url,
      content: r.content,
      score: r.score,
      publishedDate: r.published_date || null,
    })),
    answer: response.data.answer || null,
    responseTime: response.data.response_time,
  };
}

/**
 * Search for recent news on a topic
 */
export async function searchNews(
  topic: string,
  options?: {
    daysBack?: number;
    maxResults?: number;
    sources?: string[];
  }
): Promise<{
  articles: {
    title: string;
    url: string;
    summary: string;
    source: string;
    publishedDate: string | null;
    relevanceScore: number;
  }[];
  summary: string | null;
}> {
  const daysBack = options?.daysBack || 7;
  const query = `${topic} news last ${daysBack} days`;

  const searchResult = await webSearch(query, {
    searchDepth: "advanced",
    includeAnswer: true,
    maxResults: options?.maxResults || 15,
    includeDomains: options?.sources,
  });

  // Extract source domain from URL
  const extractSource = (url: string): string => {
    try {
      const hostname = new URL(url).hostname;
      return hostname.replace("www.", "").split(".")[0];
    } catch {
      return "unknown";
    }
  };

  return {
    articles: searchResult.results.map((r) => ({
      title: r.title,
      url: r.url,
      summary: r.content.slice(0, 500),
      source: extractSource(r.url),
      publishedDate: r.publishedDate,
      relevanceScore: r.score,
    })),
    summary: searchResult.answer,
  };
}

/**
 * Research a company using web search
 */
export async function researchCompany(
  companyName: string,
  focusAreas?: string[]
): Promise<{
  overview: string | null;
  recentNews: {
    title: string;
    url: string;
    summary: string;
  }[];
  keyFindings: string[];
}> {
  const focusQuery = focusAreas?.length
    ? ` (${focusAreas.join(", ")})`
    : " company overview news strategy";

  const searchResult = await webSearch(`${companyName}${focusQuery}`, {
    searchDepth: "advanced",
    includeAnswer: true,
    maxResults: 10,
  });

  // Extract key findings from results
  const keyFindings: string[] = [];
  searchResult.results.slice(0, 5).forEach((r) => {
    const sentences = r.content.split(/[.!?]+/).filter((s) => s.trim().length > 50);
    if (sentences[0]) {
      keyFindings.push(sentences[0].trim() + ".");
    }
  });

  return {
    overview: searchResult.answer,
    recentNews: searchResult.results.slice(0, 5).map((r) => ({
      title: r.title,
      url: r.url,
      summary: r.content.slice(0, 300),
    })),
    keyFindings: keyFindings.slice(0, 5),
  };
}

/**
 * Search for competitive intelligence
 */
export async function searchCompetitiveIntel(
  company: string,
  competitors: string[]
): Promise<{
  insights: {
    competitor: string;
    headline: string;
    summary: string;
    url: string;
    sentiment: "positive" | "negative" | "neutral";
  }[];
  marketTrends: string | null;
}> {
  const competitorQuery = competitors.join(" OR ");
  const query = `${company} vs ${competitorQuery} competitive analysis market comparison`;

  const searchResult = await webSearch(query, {
    searchDepth: "advanced",
    includeAnswer: true,
    maxResults: 15,
  });

  // Categorize results by competitor
  const insights = searchResult.results.map((r) => {
    const matchedCompetitor = competitors.find(
      (c) => r.title.toLowerCase().includes(c.toLowerCase()) ||
             r.content.toLowerCase().includes(c.toLowerCase())
    ) || competitors[0];

    // Simple sentiment detection
    const text = (r.title + " " + r.content).toLowerCase();
    let sentiment: "positive" | "negative" | "neutral" = "neutral";
    if (text.includes("beats") || text.includes("leads") || text.includes("outperforms")) {
      sentiment = "positive";
    } else if (text.includes("loses") || text.includes("trails") || text.includes("struggles")) {
      sentiment = "negative";
    }

    return {
      competitor: matchedCompetitor,
      headline: r.title,
      summary: r.content.slice(0, 300),
      url: r.url,
      sentiment,
    };
  });

  return {
    insights,
    marketTrends: searchResult.answer,
  };
}

export default {
  webSearch,
  searchNews,
  researchCompany,
  searchCompetitiveIntel,
};


