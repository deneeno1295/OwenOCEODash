/**
 * Tavily Tools
 * LangChain DynamicStructuredTool wrappers for Tavily service
 */

import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import {
  webSearch,
  searchNews,
  researchCompany,
  searchCompetitiveIntel,
} from "../../services/tavily";

export const webSearchTool = new DynamicStructuredTool({
  name: "web_search",
  description:
    "Perform an AI-powered web search to find current information. Returns relevant results with summaries and an AI-generated answer. Use this for real-time information needs.",
  schema: z.object({
    query: z.string().describe("The search query"),
    searchDepth: z
      .enum(["basic", "advanced"])
      .optional()
      .default("advanced")
      .describe("Search depth: 'basic' for quick results, 'advanced' for comprehensive"),
    maxResults: z.number().optional().default(10).describe("Maximum number of results"),
    includeDomains: z
      .array(z.string())
      .optional()
      .describe("Only include results from these domains"),
    excludeDomains: z
      .array(z.string())
      .optional()
      .describe("Exclude results from these domains"),
  }),
  func: async ({ query, searchDepth, maxResults, includeDomains, excludeDomains }) => {
    try {
      const result = await webSearch(query, {
        searchDepth,
        includeAnswer: true,
        maxResults,
        includeDomains,
        excludeDomains,
      });
      return JSON.stringify(result, null, 2);
    } catch (error: any) {
      return `Error performing web search: ${error.message}`;
    }
  },
});

export const searchNewsTool = new DynamicStructuredTool({
  name: "search_news",
  description:
    "Search for recent news articles on a topic. Returns articles with titles, summaries, sources, and relevance scores.",
  schema: z.object({
    topic: z.string().describe("The topic to search news for"),
    daysBack: z.number().optional().default(7).describe("How many days back to search"),
    maxResults: z.number().optional().default(15).describe("Maximum number of articles"),
    sources: z
      .array(z.string())
      .optional()
      .describe("Specific news sources to include, e.g., ['techcrunch.com', 'reuters.com']"),
  }),
  func: async ({ topic, daysBack, maxResults, sources }) => {
    try {
      const result = await searchNews(topic, { daysBack, maxResults, sources });
      return JSON.stringify(result, null, 2);
    } catch (error: any) {
      return `Error searching news: ${error.message}`;
    }
  },
});

export const researchCompanyTool = new DynamicStructuredTool({
  name: "research_company_web",
  description:
    "Comprehensive web research on a company. Returns overview, recent news, and key findings. Use this for quick company research.",
  schema: z.object({
    companyName: z.string().describe("The company name to research"),
    focusAreas: z
      .array(z.string())
      .optional()
      .describe("Specific areas to focus on, e.g., ['products', 'strategy', 'partnerships']"),
  }),
  func: async ({ companyName, focusAreas }) => {
    try {
      const result = await researchCompany(companyName, focusAreas);
      return JSON.stringify(result, null, 2);
    } catch (error: any) {
      return `Error researching company: ${error.message}`;
    }
  },
});

export const searchCompetitiveIntelTool = new DynamicStructuredTool({
  name: "search_competitive_intel",
  description:
    "Search for competitive intelligence comparing a company against its competitors. Returns insights categorized by competitor with sentiment analysis.",
  schema: z.object({
    company: z.string().describe("The main company to analyze"),
    competitors: z
      .array(z.string())
      .describe("List of competitors to compare against"),
  }),
  func: async ({ company, competitors }) => {
    try {
      const result = await searchCompetitiveIntel(company, competitors);
      return JSON.stringify(result, null, 2);
    } catch (error: any) {
      return `Error searching competitive intel: ${error.message}`;
    }
  },
});

export const tavilyTools = [
  webSearchTool,
  searchNewsTool,
  researchCompanyTool,
  searchCompetitiveIntelTool,
];

export default tavilyTools;

