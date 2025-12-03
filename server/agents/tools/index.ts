/**
 * Tools Registry
 * Central export of all LangChain tools for agents
 */

import { perplexityTools } from "./perplexity-tools";
import { apolloTools } from "./apollo-tools";
import { grokTools } from "./grok-tools";
import { linkedinTools } from "./linkedin-tools";
import { tavilyTools } from "./tavily-tools";
import { exaTools } from "./exa-tools";
import { twitterTools } from "./twitter-tools";
import { dataCloudTools } from "./data-cloud-tools";

// Individual tool exports
export * from "./perplexity-tools";
export * from "./apollo-tools";
export * from "./grok-tools";
export * from "./linkedin-tools";
export * from "./tavily-tools";
export * from "./exa-tools";
export * from "./twitter-tools";
export * from "./data-cloud-tools";

// Tool collections by service
export {
  perplexityTools,
  apolloTools,
  grokTools,
  linkedinTools,
  tavilyTools,
  exaTools,
  twitterTools,
  dataCloudTools,
};

// All tools combined
export const allTools = [
  ...perplexityTools,
  ...apolloTools,
  ...grokTools,
  ...linkedinTools,
  ...tavilyTools,
  ...exaTools,
  ...twitterTools,
  ...dataCloudTools,
];

// Tool sets for specific agent types
export const dashboardAgentTools = [
  ...tavilyTools,
  ...perplexityTools,
  ...grokTools,
  ...twitterTools,
  ...dataCloudTools,
];

export const sentimentAgentTools = [
  ...perplexityTools,
  ...grokTools,
  ...twitterTools,
  ...dataCloudTools,
];

export const startupAgentTools = [
  ...apolloTools,
  ...exaTools,
  ...perplexityTools,
  ...tavilyTools,
  ...dataCloudTools,
];

export const keyPeopleAgentTools = [
  ...linkedinTools,
  ...apolloTools,
  ...twitterTools,
  ...exaTools,
  ...dataCloudTools,
];

export const cloudIntelAgentTools = [
  ...tavilyTools,
  ...exaTools,
  ...perplexityTools,
  ...dataCloudTools,
];

export default {
  allTools,
  dashboardAgentTools,
  sentimentAgentTools,
  startupAgentTools,
  keyPeopleAgentTools,
  cloudIntelAgentTools,
};


