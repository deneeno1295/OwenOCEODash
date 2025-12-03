/**
 * Exa Tools
 * LangChain DynamicStructuredTool wrappers for Exa service
 */

import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import {
  semanticSearch,
  findSimilar,
  searchResearch,
  searchCompanyMentions,
  findExperts,
} from "../../services/exa";

export const semanticSearchTool = new DynamicStructuredTool({
  name: "semantic_search",
  description:
    "Perform neural semantic search to find content by meaning, not just keywords. Use this when you need to find conceptually related content rather than exact matches.",
  schema: z.object({
    query: z.string().describe("The semantic search query - describe what you're looking for"),
    numResults: z.number().optional().default(10).describe("Number of results to return"),
    type: z
      .enum(["keyword", "neural", "auto"])
      .optional()
      .default("auto")
      .describe("Search type: 'neural' for meaning-based, 'keyword' for exact match, 'auto' to let the system decide"),
    startPublishedDate: z
      .string()
      .optional()
      .describe("Only include content published after this date (ISO format)"),
    includeDomains: z
      .array(z.string())
      .optional()
      .describe("Only include results from these domains"),
    includeText: z
      .boolean()
      .optional()
      .default(false)
      .describe("Whether to include the full text of results"),
  }),
  func: async ({ query, numResults, type, startPublishedDate, includeDomains, includeText }) => {
    try {
      const result = await semanticSearch(query, {
        numResults,
        type,
        startPublishedDate,
        includeDomains,
        includeText,
      });
      return JSON.stringify(result, null, 2);
    } catch (error: any) {
      return `Error performing semantic search: ${error.message}`;
    }
  },
});

export const findSimilarTool = new DynamicStructuredTool({
  name: "find_similar",
  description:
    "Find content similar to a given URL. Use this to discover related articles, research, or content based on an example.",
  schema: z.object({
    url: z.string().describe("The URL to find similar content to"),
    numResults: z.number().optional().default(10).describe("Number of similar results to find"),
    includeDomains: z
      .array(z.string())
      .optional()
      .describe("Only include results from these domains"),
    includeText: z
      .boolean()
      .optional()
      .default(false)
      .describe("Whether to include the full text of results"),
  }),
  func: async ({ url, numResults, includeDomains, includeText }) => {
    try {
      const result = await findSimilar(url, { numResults, includeDomains, includeText });
      return JSON.stringify(result, null, 2);
    } catch (error: any) {
      return `Error finding similar content: ${error.message}`;
    }
  },
});

export const searchResearchTool = new DynamicStructuredTool({
  name: "search_research",
  description:
    "Search for research papers and technical content on a topic. Focuses on academic and authoritative sources like arXiv, Nature, IEEE, etc.",
  schema: z.object({
    topic: z.string().describe("The research topic to search for"),
    numResults: z.number().optional().default(15).describe("Number of papers to find"),
    afterDate: z
      .string()
      .optional()
      .describe("Only include papers published after this date (ISO format)"),
  }),
  func: async ({ topic, numResults, afterDate }) => {
    try {
      const result = await searchResearch(topic, { numResults, afterDate });
      return JSON.stringify(result, null, 2);
    } catch (error: any) {
      return `Error searching research: ${error.message}`;
    }
  },
});

export const searchCompanyMentionsTool = new DynamicStructuredTool({
  name: "search_company_mentions",
  description:
    "Search for mentions and analysis of a company across the web. Returns mentions with source, context highlights, and relevance scores.",
  schema: z.object({
    companyName: z.string().describe("The company name to search for mentions of"),
    numResults: z.number().optional().default(20).describe("Number of mentions to find"),
    focusTopics: z
      .array(z.string())
      .optional()
      .describe("Specific topics to focus on, e.g., ['earnings', 'products', 'leadership']"),
    afterDate: z
      .string()
      .optional()
      .describe("Only include mentions after this date (ISO format)"),
  }),
  func: async ({ companyName, numResults, focusTopics, afterDate }) => {
    try {
      const result = await searchCompanyMentions(companyName, {
        numResults,
        focusTopics,
        afterDate,
      });
      return JSON.stringify(result, null, 2);
    } catch (error: any) {
      return `Error searching company mentions: ${error.message}`;
    }
  },
});

export const findExpertsTool = new DynamicStructuredTool({
  name: "find_experts",
  description:
    "Find thought leaders and experts on a specific topic. Returns people who have published or been quoted on the topic.",
  schema: z.object({
    topic: z.string().describe("The topic to find experts for"),
    numResults: z.number().optional().default(15).describe("Number of experts to find"),
  }),
  func: async ({ topic, numResults }) => {
    try {
      const result = await findExperts(topic, { numResults });
      return JSON.stringify(result, null, 2);
    } catch (error: any) {
      return `Error finding experts: ${error.message}`;
    }
  },
});

export const exaTools = [
  semanticSearchTool,
  findSimilarTool,
  searchResearchTool,
  searchCompanyMentionsTool,
  findExpertsTool,
];

export default exaTools;


