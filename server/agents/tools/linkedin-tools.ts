/**
 * LinkedIn Tools
 * LangChain DynamicStructuredTool wrappers for LinkedIn service
 */

import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import {
  searchSalesNavigator,
  getLinkedInProfile,
  searchRegionalLeaders,
  getSharedConnections,
} from "../../services/linkedin";

export const searchSalesNavigatorTool = new DynamicStructuredTool({
  name: "search_sales_navigator",
  description:
    "Search LinkedIn Sales Navigator for leads matching specific criteria. Use this to find potential contacts, customers, or partners based on title, location, and industry.",
  schema: z.object({
    query: z.string().describe("Search query for leads"),
    titles: z
      .array(z.string())
      .optional()
      .describe("Filter by job titles, e.g., ['CEO', 'CIO']"),
    locations: z
      .array(z.string())
      .optional()
      .describe("Filter by locations, e.g., ['San Francisco', 'New York']"),
    industries: z
      .array(z.string())
      .optional()
      .describe("Filter by industries, e.g., ['Technology', 'Healthcare']"),
    seniority: z
      .array(z.string())
      .optional()
      .describe("Filter by seniority, e.g., ['CXO', 'VP', 'Director']"),
  }),
  func: async ({ query, titles, locations, industries, seniority }) => {
    try {
      const filters = {
        titles,
        locations,
        industries,
        seniority,
      };
      const result = await searchSalesNavigator(query, filters);
      return JSON.stringify(result, null, 2);
    } catch (error: any) {
      return `Error searching Sales Navigator: ${error.message}`;
    }
  },
});

export const getLinkedInProfileTool = new DynamicStructuredTool({
  name: "get_linkedin_profile",
  description:
    "Get detailed information from a LinkedIn profile URL including name, headline, current position, and connection count.",
  schema: z.object({
    profileUrl: z
      .string()
      .describe("The LinkedIn profile URL, e.g., 'https://linkedin.com/in/satyanadella'"),
  }),
  func: async ({ profileUrl }) => {
    try {
      const result = await getLinkedInProfile(profileUrl);
      return JSON.stringify(result, null, 2);
    } catch (error: any) {
      return `Error getting LinkedIn profile: ${error.message}`;
    }
  },
});

export const searchRegionalLeadersTool = new DynamicStructuredTool({
  name: "search_regional_leaders",
  description:
    "Find business leaders and executives in a specific geographic region. Use this when preparing for travel to a new location or identifying regional influencers.",
  schema: z.object({
    location: z.string().describe("The location to search, e.g., 'Singapore' or 'London'"),
    industry: z
      .string()
      .optional()
      .describe("Optional industry filter, e.g., 'Technology' or 'Financial Services'"),
    limit: z.number().optional().default(25).describe("Maximum number of results"),
  }),
  func: async ({ location, industry, limit }) => {
    try {
      const result = await searchRegionalLeaders(location, industry, limit);
      return JSON.stringify(result, null, 2);
    } catch (error: any) {
      return `Error searching regional leaders: ${error.message}`;
    }
  },
});

export const getSharedConnectionsTool = new DynamicStructuredTool({
  name: "get_shared_connections",
  description:
    "Get mutual connections with a LinkedIn profile. Use this to find warm introduction paths to a target person.",
  schema: z.object({
    profileId: z.string().describe("The LinkedIn profile ID or vanity name"),
  }),
  func: async ({ profileId }) => {
    try {
      const result = await getSharedConnections(profileId);
      return JSON.stringify(result, null, 2);
    } catch (error: any) {
      return `Error getting shared connections: ${error.message}`;
    }
  },
});

export const linkedinTools = [
  searchSalesNavigatorTool,
  getLinkedInProfileTool,
  searchRegionalLeadersTool,
  getSharedConnectionsTool,
];

export default linkedinTools;


