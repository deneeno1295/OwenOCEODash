/**
 * Data Cloud Tools
 * LangChain DynamicStructuredTool wrappers for Salesforce Data Cloud memory service
 */

import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import {
  queryMemory,
  getRecentResearch,
} from "../../services/salesforce-data-cloud";

export const recallPreviousResearchTool = new DynamicStructuredTool({
  name: "recall_previous_research",
  description:
    "Query the memory store to recall previous research and agent outputs. Use this to avoid repeating work and to build on past analysis.",
  schema: z.object({
    query: z.string().describe("Search query to find relevant past research"),
    agentName: z
      .string()
      .optional()
      .describe("Filter by specific agent name, e.g., 'DashboardAgent' or 'StartupAgent'"),
    limit: z.number().optional().default(10).describe("Maximum number of results to return"),
  }),
  func: async ({ query, agentName, limit }) => {
    try {
      const result = await queryMemory(query, { agentName, limit });
      return JSON.stringify(result, null, 2);
    } catch (error: any) {
      return `Error recalling previous research: ${error.message}`;
    }
  },
});

export const getRecentCompanyResearchTool = new DynamicStructuredTool({
  name: "get_recent_company_research",
  description:
    "Get recent research that has been done on a specific company. Use this to see what analysis has already been performed.",
  schema: z.object({
    company: z.string().describe("The company name to get recent research for"),
    daysBack: z
      .number()
      .optional()
      .default(30)
      .describe("How many days back to look for research"),
    limit: z.number().optional().default(10).describe("Maximum number of results"),
  }),
  func: async ({ company, daysBack, limit }) => {
    try {
      const result = await getRecentResearch(company, { daysBack, limit });
      return JSON.stringify(result, null, 2);
    } catch (error: any) {
      return `Error getting recent research: ${error.message}`;
    }
  },
});

export const dataCloudTools = [
  recallPreviousResearchTool,
  getRecentCompanyResearchTool,
];

export default dataCloudTools;


