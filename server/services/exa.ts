/**
 * Exa Service
 * Neural semantic search for finding relevant content
 */

import axios from "axios";

const EXA_API_KEY = process.env.EXA_API_KEY;
const EXA_BASE_URL = "https://api.exa.ai";

if (!EXA_API_KEY) {
  console.warn("Warning: EXA_API_KEY not set. Exa service will not function.");
}

interface ExaResult {
  url: string;
  title: string;
  id: string;
  score: number;
  publishedDate?: string;
  author?: string;
  text?: string;
  highlights?: string[];
  highlightScores?: number[];
}

interface ExaSearchResponse {
  results: ExaResult[];
  autopromptString?: string;
}

/**
 * Perform semantic search using Exa
 */
export async function semanticSearch(
  query: string,
  options?: {
    numResults?: number;
    type?: "keyword" | "neural" | "auto";
    useAutoprompt?: boolean;
    startPublishedDate?: string;
    endPublishedDate?: string;
    includeDomains?: string[];
    excludeDomains?: string[];
    includeText?: boolean;
    highlightQuery?: string;
  }
): Promise<{
  results: {
    url: string;
    title: string;
    score: number;
    publishedDate: string | null;
    author: string | null;
    text: string | null;
    highlights: string[];
  }[];
  autoprompt: string | null;
}> {
  if (!EXA_API_KEY) {
    throw new Error("EXA_API_KEY is not configured");
  }

  const response = await axios.post<ExaSearchResponse>(
    `${EXA_BASE_URL}/search`,
    {
      query,
      num_results: options?.numResults || 10,
      type: options?.type || "auto",
      use_autoprompt: options?.useAutoprompt ?? true,
      start_published_date: options?.startPublishedDate,
      end_published_date: options?.endPublishedDate,
      include_domains: options?.includeDomains,
      exclude_domains: options?.excludeDomains,
      contents: options?.includeText ? {
        text: true,
        highlights: options?.highlightQuery ? {
          query: options.highlightQuery,
          num_sentences: 3,
        } : undefined,
      } : undefined,
    },
    {
      headers: {
        "x-api-key": EXA_API_KEY,
        "Content-Type": "application/json",
      },
    }
  );

  return {
    results: response.data.results.map((r) => ({
      url: r.url,
      title: r.title,
      score: r.score,
      publishedDate: r.publishedDate || null,
      author: r.author || null,
      text: r.text || null,
      highlights: r.highlights || [],
    })),
    autoprompt: response.data.autopromptString || null,
  };
}

/**
 * Find similar content to a given URL
 */
export async function findSimilar(
  url: string,
  options?: {
    numResults?: number;
    includeDomains?: string[];
    excludeDomains?: string[];
    includeText?: boolean;
  }
): Promise<{
  results: {
    url: string;
    title: string;
    score: number;
    publishedDate: string | null;
    text: string | null;
  }[];
}> {
  if (!EXA_API_KEY) {
    throw new Error("EXA_API_KEY is not configured");
  }

  const response = await axios.post<ExaSearchResponse>(
    `${EXA_BASE_URL}/findSimilar`,
    {
      url,
      num_results: options?.numResults || 10,
      include_domains: options?.includeDomains,
      exclude_domains: options?.excludeDomains,
      contents: options?.includeText ? { text: true } : undefined,
    },
    {
      headers: {
        "x-api-key": EXA_API_KEY,
        "Content-Type": "application/json",
      },
    }
  );

  return {
    results: response.data.results.map((r) => ({
      url: r.url,
      title: r.title,
      score: r.score,
      publishedDate: r.publishedDate || null,
      text: r.text || null,
    })),
  };
}

/**
 * Search for research papers and technical content
 */
export async function searchResearch(
  topic: string,
  options?: {
    numResults?: number;
    afterDate?: string;
  }
): Promise<{
  papers: {
    title: string;
    url: string;
    authors: string | null;
    publishedDate: string | null;
    summary: string | null;
    relevanceScore: number;
  }[];
}> {
  const result = await semanticSearch(
    `${topic} research paper study analysis`,
    {
      numResults: options?.numResults || 15,
      type: "neural",
      startPublishedDate: options?.afterDate,
      includeDomains: [
        "arxiv.org",
        "nature.com",
        "science.org",
        "ieee.org",
        "acm.org",
        "researchgate.net",
        "scholar.google.com",
      ],
      includeText: true,
    }
  );

  return {
    papers: result.results.map((r) => ({
      title: r.title,
      url: r.url,
      authors: r.author,
      publishedDate: r.publishedDate,
      summary: r.text?.slice(0, 500) || null,
      relevanceScore: r.score,
    })),
  };
}

/**
 * Search for company mentions and analysis
 */
export async function searchCompanyMentions(
  companyName: string,
  options?: {
    numResults?: number;
    focusTopics?: string[];
    afterDate?: string;
  }
): Promise<{
  mentions: {
    title: string;
    url: string;
    source: string;
    publishedDate: string | null;
    context: string[];
    relevanceScore: number;
  }[];
}> {
  const focusQuery = options?.focusTopics?.length
    ? ` ${options.focusTopics.join(" ")}`
    : "";

  const result = await semanticSearch(
    `${companyName}${focusQuery} company analysis news`,
    {
      numResults: options?.numResults || 20,
      type: "neural",
      startPublishedDate: options?.afterDate,
      includeText: true,
      highlightQuery: companyName,
    }
  );

  // Extract source domain from URL
  const extractSource = (url: string): string => {
    try {
      const hostname = new URL(url).hostname;
      return hostname.replace("www.", "");
    } catch {
      return "unknown";
    }
  };

  return {
    mentions: result.results.map((r) => ({
      title: r.title,
      url: r.url,
      source: extractSource(r.url),
      publishedDate: r.publishedDate,
      context: r.highlights,
      relevanceScore: r.score,
    })),
  };
}

/**
 * Find thought leaders and experts on a topic
 */
export async function findExperts(
  topic: string,
  options?: {
    numResults?: number;
  }
): Promise<{
  experts: {
    name: string | null;
    url: string;
    title: string;
    source: string;
    expertise: string[];
  }[];
}> {
  const result = await semanticSearch(
    `${topic} expert thought leader interview opinion`,
    {
      numResults: options?.numResults || 15,
      type: "neural",
      includeText: true,
    }
  );

  const extractSource = (url: string): string => {
    try {
      return new URL(url).hostname.replace("www.", "");
    } catch {
      return "unknown";
    }
  };

  return {
    experts: result.results.map((r) => ({
      name: r.author,
      url: r.url,
      title: r.title,
      source: extractSource(r.url),
      expertise: r.highlights.slice(0, 3),
    })),
  };
}

export default {
  semanticSearch,
  findSimilar,
  searchResearch,
  searchCompanyMentions,
  findExperts,
};


