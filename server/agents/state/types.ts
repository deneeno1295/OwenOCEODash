/**
 * Agent State Types
 * Type definitions for agent state management and future LangGraph migration
 */

/**
 * Base state interface for all agents
 */
export interface BaseAgentState {
  input: string;
  currentStep: string;
  output: string | null;
  error: string | null;
  startedAt: Date;
  completedAt: Date | null;
}

/**
 * Dashboard Agent State
 */
export interface DashboardAgentState extends BaseAgentState {
  company: string;
  earningsData: {
    revenue: string;
    eps: string;
    guidance: string;
    beatMiss: string;
  } | null;
  sentimentScore: number | null;
  newsData: {
    articles: any[];
    overallSentiment: string;
  } | null;
  twitterSentiment: {
    positive: number;
    negative: number;
    neutral: number;
  } | null;
  report: string | null;
  currentStep: "init" | "earnings" | "sentiment" | "news" | "twitter" | "report" | "done";
}

/**
 * Sentiment Agent State
 */
export interface SentimentAgentState extends BaseAgentState {
  competitors: string[];
  sentimentResults: Map<string, {
    score: number;
    label: string;
    topics: any[];
    trendDirection: string;
  }>;
  newsData: Map<string, any[]>;
  twitterData: Map<string, any>;
  currentStep: "init" | "news" | "sentiment" | "twitter" | "aggregate" | "done";
}

/**
 * Startup Agent State
 */
export interface StartupAgentState extends BaseAgentState {
  startupName: string;
  startupDomain: string | null;
  enrichmentData: {
    name: string;
    industry: string;
    employeeCount: number;
    funding: string;
    technologies: string[];
  } | null;
  hiringVelocity: {
    velocity: string;
    growthSignal: string;
  } | null;
  newsData: any[] | null;
  competitorContext: string | null;
  researchReport: string | null;
  currentStep: "init" | "enrich" | "hiring" | "news" | "competitors" | "report" | "done";
}

/**
 * Key People Agent State
 */
export interface KeyPeopleAgentState extends BaseAgentState {
  discoveryType: "location" | "event" | "industry";
  context: {
    location?: string;
    event?: string;
    industry?: string;
    country?: string;
  };
  discoveredPeople: {
    name: string;
    title: string;
    organization: string;
    relevanceScore: number;
    whyImportant: string;
  }[];
  enrichedPeople: Map<string, any>;
  meetingPrep: Map<string, string>;
  currentStep: "init" | "discover" | "enrich" | "research" | "meetingPrep" | "done";
}

/**
 * Cloud Intel Agent State
 */
export interface CloudIntelAgentState extends BaseAgentState {
  cloudProduct: string;
  competitors: string[];
  featureComparison: Map<string, any>;
  marketTrends: string | null;
  competitiveInsights: any[];
  recommendations: string[];
  currentStep: "init" | "features" | "competitors" | "trends" | "analysis" | "done";
}

/**
 * Agent run record for persistence
 */
export interface AgentRunRecord {
  id: string;
  agentName: string;
  input: string;
  output: string;
  state: BaseAgentState;
  toolsUsed: {
    tool: string;
    input: any;
    output: any;
  }[];
  startedAt: Date;
  completedAt: Date;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

/**
 * Scheduled agent run configuration
 */
export interface ScheduledAgentRun {
  agentName: string;
  cronExpression: string;
  input: string | (() => string);
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
}

export default {
  // Export type guards or utilities here if needed
};

