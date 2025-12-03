/**
 * Dashboard Agent
 * Earnings analysis, equity research, and market intelligence
 */

import { BaseAgent } from "./base";
import { dashboardAgentTools } from "./tools";
import { EQUITY_RESEARCH_PROMPT } from "../prompts/equity-research";

const DASHBOARD_SYSTEM_PROMPT = `${EQUITY_RESEARCH_PROMPT}

## Available Tools

You have access to the following tools to gather information:
- search_market_data: Search for real-time market data and financial news
- get_earnings_data: Get detailed quarterly earnings data for companies
- get_company_news: Get recent news articles with sentiment
- web_search: General web search for current information
- search_news: Search for recent news articles
- analyze_sentiment: Analyze sentiment of text content
- extract_topics: Extract topics and themes from content
- search_tweets: Search Twitter for social sentiment
- get_trending_sentiment: Get trending sentiment on a topic
- recall_previous_research: Check what research has already been done

## Your Process

1. First, check if there's recent research on this company using recall_previous_research
2. Gather earnings data using get_earnings_data
3. Get recent company news using get_company_news
4. Analyze market sentiment using analyze_sentiment and get_trending_sentiment
5. Search for additional market context using search_market_data
6. Synthesize all data into a comprehensive equity research report

Always cite specific numbers and data points. Make your analysis actionable.`;

export class DashboardAgent extends BaseAgent {
  constructor(verbose: boolean = false) {
    super({
      name: "DashboardAgent",
      description: "Earnings analysis, equity research, and market intelligence",
      tools: dashboardAgentTools,
      systemPrompt: DASHBOARD_SYSTEM_PROMPT,
      temperature: 0,
      maxIterations: 20,
      verbose,
    });
  }

  /**
   * Analyze a company's earnings and market position
   */
  async analyzeCompany(company: string, quarter?: string): Promise<{
    output: string;
    success: boolean;
    runId: string;
  }> {
    const input = quarter
      ? `Analyze ${company}'s ${quarter} earnings and current market position. Provide a comprehensive equity research report.`
      : `Analyze ${company}'s latest earnings and current market position. Provide a comprehensive equity research report.`;

    const result = await this.run(input, {
      company,
      quarter,
      type: "earnings_analysis",
    });

    return {
      output: result.output,
      success: result.success,
      runId: result.runId,
    };
  }

  /**
   * Compare multiple companies
   */
  async compareCompanies(companies: string[]): Promise<{
    output: string;
    success: boolean;
    runId: string;
  }> {
    const input = `Compare the following companies and their competitive positions: ${companies.join(", ")}. 
    
For each company, analyze:
- Recent earnings performance
- Market sentiment
- Competitive strengths and weaknesses
- Outlook

Provide a comparative analysis with clear winner/loser assessments.`;

    const result = await this.run(input, {
      companies,
      type: "competitive_comparison",
    });

    return {
      output: result.output,
      success: result.success,
      runId: result.runId,
    };
  }

  /**
   * Get market sentiment for a company
   */
  async getMarketSentiment(company: string): Promise<{
    output: string;
    success: boolean;
    runId: string;
  }> {
    const input = `Analyze the current market sentiment for ${company}. 

Include:
- Overall sentiment score and direction
- Key themes driving sentiment
- Social media sentiment from Twitter
- News sentiment
- Risk factors and opportunities
- What the market might be missing`;

    const result = await this.run(input, {
      company,
      type: "sentiment_analysis",
    });

    return {
      output: result.output,
      success: result.success,
      runId: result.runId,
    };
  }
}

// Create singleton instance
let dashboardAgentInstance: DashboardAgent | null = null;

export function getDashboardAgent(verbose: boolean = false): DashboardAgent {
  if (!dashboardAgentInstance) {
    dashboardAgentInstance = new DashboardAgent(verbose);
  }
  return dashboardAgentInstance;
}

export default DashboardAgent;


