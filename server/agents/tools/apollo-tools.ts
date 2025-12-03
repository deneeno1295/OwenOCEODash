/**
 * Apollo Tools
 * LangChain DynamicStructuredTool wrappers for Apollo.io service
 */

import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import {
  enrichCompany,
  enrichPerson,
  searchPeopleByRole,
  getCompanyExecutives,
  getHiringVelocity,
} from "../../services/apollo";

export const enrichCompanyTool = new DynamicStructuredTool({
  name: "enrich_company",
  description:
    "Get detailed company information including employee count, funding, technology stack, and headquarters. Use this to research a company before meetings or for competitive analysis.",
  schema: z.object({
    domain: z
      .string()
      .describe("The company's website domain, e.g., 'salesforce.com' or 'microsoft.com'"),
  }),
  func: async ({ domain }) => {
    try {
      const result = await enrichCompany(domain);
      return JSON.stringify(result, null, 2);
    } catch (error: any) {
      return `Error enriching company: ${error.message}`;
    }
  },
});

export const enrichPersonTool = new DynamicStructuredTool({
  name: "enrich_person",
  description:
    "Get detailed information about a specific person including their title, email, LinkedIn, and organization. Use this to research individuals before meetings.",
  schema: z.object({
    firstName: z.string().describe("The person's first name"),
    lastName: z.string().describe("The person's last name"),
    organization: z
      .string()
      .optional()
      .describe("The person's company name (helps with accuracy)"),
    domain: z
      .string()
      .optional()
      .describe("The company's domain (helps with accuracy)"),
  }),
  func: async ({ firstName, lastName, organization, domain }) => {
    try {
      const result = await enrichPerson(firstName, lastName, organization, domain);
      return JSON.stringify(result, null, 2);
    } catch (error: any) {
      return `Error enriching person: ${error.message}`;
    }
  },
});

export const searchPeopleByRoleTool = new DynamicStructuredTool({
  name: "search_people_by_role",
  description:
    "Search for people by job title, location, and industry. Use this to find executives, decision-makers, or specific roles at companies.",
  schema: z.object({
    titles: z
      .array(z.string())
      .describe("Job titles to search for, e.g., ['CEO', 'CTO', 'VP of Engineering']"),
    city: z.string().optional().describe("City to filter by"),
    country: z.string().optional().describe("Country to filter by"),
    industries: z
      .array(z.string())
      .optional()
      .describe("Industries to filter by, e.g., ['Technology', 'Financial Services']"),
    limit: z.number().optional().default(25).describe("Maximum number of results (default: 25)"),
  }),
  func: async ({ titles, city, country, industries, limit }) => {
    try {
      const location = city || country ? { city, country } : undefined;
      const result = await searchPeopleByRole(titles, location, industries, limit);
      return JSON.stringify(result, null, 2);
    } catch (error: any) {
      return `Error searching people: ${error.message}`;
    }
  },
});

export const getCompanyExecutivesTool = new DynamicStructuredTool({
  name: "get_company_executives",
  description:
    "Get a list of executives (C-suite, VPs, Directors) at a specific company. Use this to understand company leadership and find decision-makers.",
  schema: z.object({
    domain: z.string().describe("The company's website domain"),
  }),
  func: async ({ domain }) => {
    try {
      const result = await getCompanyExecutives(domain);
      return JSON.stringify(result, null, 2);
    } catch (error: any) {
      return `Error getting executives: ${error.message}`;
    }
  },
});

export const getHiringVelocityTool = new DynamicStructuredTool({
  name: "get_hiring_velocity",
  description:
    "Analyze a company's hiring patterns to assess growth trajectory. Use this to understand if a company is scaling up, stable, or contracting.",
  schema: z.object({
    domain: z.string().describe("The company's website domain"),
  }),
  func: async ({ domain }) => {
    try {
      const result = await getHiringVelocity(domain);
      return JSON.stringify(result, null, 2);
    } catch (error: any) {
      return `Error getting hiring velocity: ${error.message}`;
    }
  },
});

export const apolloTools = [
  enrichCompanyTool,
  enrichPersonTool,
  searchPeopleByRoleTool,
  getCompanyExecutivesTool,
  getHiringVelocityTool,
];

export default apolloTools;


