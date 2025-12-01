/**
 * Grok Tools
 * LangChain DynamicStructuredTool wrappers for Grok/xAI service
 */

import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import {
  analyzeSentiment,
  extractTopics,
  analyzeSocialSentiment,
} from "../../services/grok";

export const analyzeSentimentTool = new DynamicStructuredTool({
  name: "analyze_sentiment",
  description:
    "Analyze the sentiment of text content. Returns a score (0-1), label (positive/negative/neutral), and reasoning. Use this to understand the emotional tone of news, social posts, or documents.",
  schema: z.object({
    text: z.string().describe("The text content to analyze for sentiment"),
  }),
  func: async ({ text }) => {
    try {
      const result = await analyzeSentiment(text);
      return JSON.stringify(result, null, 2);
    } catch (error: any) {
      return `Error analyzing sentiment: ${error.message}`;
    }
  },
});

export const extractTopicsTool = new DynamicStructuredTool({
  name: "extract_topics",
  description:
    "Extract main topics and themes from content with sentiment per topic. Use this to understand what subjects are being discussed and how they're perceived.",
  schema: z.object({
    content: z.string().describe("The content to extract topics from"),
  }),
  func: async ({ content }) => {
    try {
      const result = await extractTopics(content);
      return JSON.stringify(result, null, 2);
    } catch (error: any) {
      return `Error extracting topics: ${error.message}`;
    }
  },
});

export const analyzeSocialSentimentTool = new DynamicStructuredTool({
  name: "analyze_social_sentiment",
  description:
    "Analyze social media sentiment trends for a topic or company. Returns overall sentiment, trend direction, key themes, and identifies risks and opportunities.",
  schema: z.object({
    topic: z.string().describe("The topic or company to analyze sentiment for"),
    context: z
      .string()
      .optional()
      .describe("Additional context about what aspect to focus on"),
  }),
  func: async ({ topic, context }) => {
    try {
      const result = await analyzeSocialSentiment(topic, context);
      return JSON.stringify(result, null, 2);
    } catch (error: any) {
      return `Error analyzing social sentiment: ${error.message}`;
    }
  },
});

export const grokTools = [
  analyzeSentimentTool,
  extractTopicsTool,
  analyzeSocialSentimentTool,
];

export default grokTools;

