/**
 * Startup Agent
 * Deep startup research and M&A/partnership analysis
 */

import { BaseAgent } from "./base";
import { startupAgentTools } from "./tools";
import { STARTUP_RESEARCH_PROMPT } from "../prompts/startup-research";

const STARTUP_SYSTEM_PROMPT = `${STARTUP_RESEARCH_PROMPT}

## Available Tools

You have access to the following tools:
- enrich_company: Get detailed company information from Apollo
- enrich_person: Get information about founders and executives
- search_people_by_role: Find people at the company
- get_company_executives: Get C-suite and leadership
- get_hiring_velocity: Analyze hiring patterns for growth signals
- semantic_search: Find conceptually related content
- search_research: Find research papers and technical content
- search_company_mentions: Find mentions and analysis of the company
- find_similar: Find similar companies or content
- search_market_data: Get market data and financial news
- get_company_news: Get recent company news
- web_search: General web search
- recall_previous_research: Check existing research

## Your Process

1. First, check for existing research using recall_previous_research
2. Enrich basic company data using enrich_company
3. Analyze hiring velocity for growth signals
4. Gather recent news and market context
5. Research founders and key executives
6. Find competitive context and similar companies
7. Synthesize into a comprehensive M&A/partnership brief`;

export class StartupAgent extends BaseAgent {
  constructor(verbose: boolean = false) {
    super({
      name: "StartupAgent",
      description: "Deep startup research and M&A/partnership analysis",
      tools: startupAgentTools,
      systemPrompt: STARTUP_SYSTEM_PROMPT,
      temperature: 0,
      maxIterations: 20,
      verbose,
    });
  }

  /**
   * Conduct deep research on a startup
   */
  async researchStartup(
    startupName: string,
    domain?: string
  ): Promise<{
    output: string;
    success: boolean;
    runId: string;
  }> {
    const input = `Conduct comprehensive research on the startup: ${startupName}${domain ? ` (website: ${domain})` : ""}.

Research and analyze:
1. Company overview and business model
2. Funding history and investors
3. Team and leadership
4. Technology and product
5. Market opportunity
6. Competitive landscape
7. Strategic fit for potential M&A or partnership

Provide a detailed intelligence brief with recommendation.`;

    const result = await this.run(input, {
      startupName,
      domain,
      type: "startup_research",
    });

    return {
      output: result.output,
      success: result.success,
      runId: result.runId,
    };
  }

  /**
   * Analyze startup for M&A fit
   */
  async analyzeAcquisitionFit(
    startupName: string,
    acquirer: string = "Salesforce"
  ): Promise<{
    output: string;
    success: boolean;
    runId: string;
  }> {
    const input = `Analyze ${startupName} as a potential acquisition target for ${acquirer}.

Evaluate:
1. Strategic fit with ${acquirer}'s portfolio
2. Technology and IP value
3. Team quality and retention considerations
4. Customer base overlap/expansion potential
5. Integration complexity
6. Valuation considerations
7. Competitive dynamics (who else might acquire them?)

Provide a clear recommendation: Acquire / Partner / Monitor / Pass`;

    const result = await this.run(input, {
      startupName,
      acquirer,
      type: "acquisition_analysis",
    });

    return {
      output: result.output,
      success: result.success,
      runId: result.runId,
    };
  }

  /**
   * Discover startups in a space
   */
  async discoverStartups(
    industry: string,
    stage?: string,
    location?: string
  ): Promise<{
    output: string;
    success: boolean;
    runId: string;
  }> {
    const filters = [
      stage && `stage: ${stage}`,
      location && `location: ${location}`,
    ].filter(Boolean);

    const input = `Discover promising startups in the ${industry} space${filters.length ? ` (${filters.join(", ")})` : ""}.

For each startup identified:
1. Name and brief description
2. Stage and funding
3. Why they're interesting
4. Strategic relevance
5. Hot score (0-100)

Identify 5-10 startups ranked by strategic relevance and potential.`;

    const result = await this.run(input, {
      industry,
      stage,
      location,
      type: "startup_discovery",
    });

    return {
      output: result.output,
      success: result.success,
      runId: result.runId,
    };
  }

  /**
   * Analyze hiring velocity as a growth signal
   */
  async analyzeGrowthSignals(
    startupName: string,
    domain?: string
  ): Promise<{
    output: string;
    success: boolean;
    runId: string;
  }> {
    const input = `Analyze growth signals for ${startupName}${domain ? ` (${domain})` : ""}.

Look at:
1. Hiring velocity and patterns
2. Types of roles being hired
3. Recent news and announcements
4. Funding activity
5. Partnership/customer announcements

Assess: Is this startup scaling up, stable, or declining?`;

    const result = await this.run(input, {
      startupName,
      domain,
      type: "growth_signals",
    });

    return {
      output: result.output,
      success: result.success,
      runId: result.runId,
    };
  }
}

// Create singleton instance
let startupAgentInstance: StartupAgent | null = null;

export function getStartupAgent(verbose: boolean = false): StartupAgent {
  if (!startupAgentInstance) {
    startupAgentInstance = new StartupAgent(verbose);
  }
  return startupAgentInstance;
}

export default StartupAgent;

