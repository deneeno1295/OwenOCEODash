/**
 * Twitter Tools
 * LangChain DynamicStructuredTool wrappers for Twitter/X service
 */

import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import {
  searchTweets,
  getAccountTweets,
  getTrendingSentiment,
  monitorCompanyMentions,
} from "../../services/twitter";

export const searchTweetsTool = new DynamicStructuredTool({
  name: "search_tweets",
  description:
    "Search for tweets on a topic. Returns tweets with author info, engagement metrics, hashtags, and mentions. Use this to understand social conversation around a topic.",
  schema: z.object({
    query: z.string().describe("The search query for tweets"),
    maxResults: z.number().optional().default(25).describe("Maximum number of tweets to return"),
    sortOrder: z
      .enum(["recency", "relevancy"])
      .optional()
      .default("relevancy")
      .describe("Sort by 'recency' for latest tweets or 'relevancy' for most relevant"),
  }),
  func: async ({ query, maxResults, sortOrder }) => {
    try {
      const result = await searchTweets(query, { maxResults, sortOrder });
      return JSON.stringify(result, null, 2);
    } catch (error: any) {
      return `Error searching tweets: ${error.message}`;
    }
  },
});

export const getAccountTweetsTool = new DynamicStructuredTool({
  name: "get_account_tweets",
  description:
    "Get recent tweets from a specific Twitter/X account. Use this to see what a person or company has been posting about.",
  schema: z.object({
    username: z.string().describe("The Twitter username (without @), e.g., 'elonmusk'"),
    maxResults: z.number().optional().default(20).describe("Maximum number of tweets to return"),
    excludeReplies: z
      .boolean()
      .optional()
      .default(true)
      .describe("Exclude reply tweets"),
    excludeRetweets: z
      .boolean()
      .optional()
      .default(true)
      .describe("Exclude retweets"),
  }),
  func: async ({ username, maxResults, excludeReplies, excludeRetweets }) => {
    try {
      const result = await getAccountTweets(username, {
        maxResults,
        excludeReplies,
        excludeRetweets,
      });
      return JSON.stringify(result, null, 2);
    } catch (error: any) {
      return `Error getting account tweets: ${error.message}`;
    }
  },
});

export const getTrendingSentimentTool = new DynamicStructuredTool({
  name: "get_trending_sentiment",
  description:
    "Analyze the trending sentiment around a topic on Twitter/X. Returns sentiment distribution, top hashtags, influencers, and sample tweets.",
  schema: z.object({
    topic: z.string().describe("The topic to analyze sentiment for"),
    sampleSize: z
      .number()
      .optional()
      .default(100)
      .describe("Number of tweets to sample for sentiment analysis"),
  }),
  func: async ({ topic, sampleSize }) => {
    try {
      const result = await getTrendingSentiment(topic, { sampleSize });
      return JSON.stringify(result, null, 2);
    } catch (error: any) {
      return `Error getting trending sentiment: ${error.message}`;
    }
  },
});

export const monitorCompanyMentionsTool = new DynamicStructuredTool({
  name: "monitor_company_mentions",
  description:
    "Monitor recent Twitter/X mentions of a company. Returns mentions with engagement metrics and sentiment analysis.",
  schema: z.object({
    companyName: z.string().describe("The company name to monitor"),
    companyHandle: z
      .string()
      .optional()
      .describe("The company's Twitter handle (without @), if known"),
  }),
  func: async ({ companyName, companyHandle }) => {
    try {
      const result = await monitorCompanyMentions(companyName, companyHandle);
      return JSON.stringify(result, null, 2);
    } catch (error: any) {
      return `Error monitoring company mentions: ${error.message}`;
    }
  },
});

export const twitterTools = [
  searchTweetsTool,
  getAccountTweetsTool,
  getTrendingSentimentTool,
  monitorCompanyMentionsTool,
];

export default twitterTools;


