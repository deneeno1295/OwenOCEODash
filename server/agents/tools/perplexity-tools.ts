/**
 * Perplexity Tools
 * LangChain DynamicStructuredTool wrappers for Perplexity service
 */

import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import {
  searchMarketData,
  getEarningsData,
  getCompanyNews,
} from "../../services/perplexity";

export const searchMarketDataTool = new DynamicStructuredTool({
  name: "search_market_data",
  description:
    "Search for real-time market data, financial news, and industry analysis. Use this for current market trends, stock information, and financial research.",
  schema: z.object({
    query: z
      .string()
      .describe("The search query for market data, e.g., 'Microsoft cloud revenue growth Q3 2024'"),
  }),
  func: async ({ query }) => {
    try {
      const result = await searchMarketData(query);
      return result;
    } catch (error: any) {
      return `Error searching market data: ${error.message}`;
    }
  },
});

export const getEarningsDataTool = new DynamicStructuredTool({
  name: "get_earnings_data",
  description:
    "Get detailed earnings data for a company including revenue, EPS, beat/miss status, and forward guidance. Use this when analyzing quarterly or annual earnings reports.",
  schema: z.object({
    company: z.string().describe("The company name, e.g., 'Microsoft' or 'Salesforce'"),
    quarter: z
      .string()
      .optional()
      .describe("The specific quarter, e.g., 'Q3 2024'. If not provided, gets most recent."),
  }),
  func: async ({ company, quarter }) => {
    try {
      const result = await getEarningsData(company, quarter);
      return JSON.stringify(result, null, 2);
    } catch (error: any) {
      return `Error getting earnings data: ${error.message}`;
    }
  },
});

export const getCompanyNewsTool = new DynamicStructuredTool({
  name: "get_company_news",
  description:
    "Get recent news articles about a company with sentiment analysis. Use this to understand recent developments, announcements, and market perception.",
  schema: z.object({
    company: z.string().describe("The company name to get news for"),
    daysBack: z
      .number()
      .optional()
      .default(30)
      .describe("How many days back to search for news (default: 30)"),
  }),
  func: async ({ company, daysBack }) => {
    try {
      const result = await getCompanyNews(company, daysBack);
      return JSON.stringify(result, null, 2);
    } catch (error: any) {
      return `Error getting company news: ${error.message}`;
    }
  },
});

export const perplexityTools = [
  searchMarketDataTool,
  getEarningsDataTool,
  getCompanyNewsTool,
];

export default perplexityTools;

