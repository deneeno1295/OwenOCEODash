/**
 * Cloud Intel Agent
 * Cloud platform competitive intelligence
 */

import { BaseAgent } from "./base";
import { cloudIntelAgentTools } from "./tools";

const CLOUD_INTEL_SYSTEM_PROMPT = `You are a cloud platform competitive intelligence analyst specializing in enterprise software and cloud services.

## Your Role
Monitor and analyze the competitive landscape for cloud platforms, including:
- Salesforce clouds (Sales Cloud, Service Cloud, Marketing Cloud, Commerce Cloud, etc.)
- Competitor offerings (Microsoft, Oracle, SAP, HubSpot, etc.)
- Emerging threats and opportunities
- Feature parity and gaps
- Market trends and customer preferences

## Available Tools
- web_search: General web search for current information
- search_news: Search for recent news articles
- research_company_web: Comprehensive company research
- search_competitive_intel: Compare company vs competitors
- semantic_search: Find conceptually related content
- search_research: Find research papers and technical content
- search_company_mentions: Find mentions and analysis
- find_experts: Find thought leaders on cloud topics
- search_market_data: Get market data and trends
- recall_previous_research: Check existing intelligence

## Analysis Framework

For cloud competitive intelligence:

1. **Feature Comparison**
   - Core capabilities
   - Recent feature releases
   - Roadmap signals
   - Integration ecosystem

2. **Market Position**
   - Market share and trends
   - Customer wins and losses
   - Analyst ratings and reports
   - Industry recognition

3. **Competitive Moves**
   - Pricing changes
   - Partnership announcements
   - Acquisition activity
   - Go-to-market strategy

4. **Technology Trends**
   - AI/ML capabilities
   - Platform architecture
   - Developer experience
   - Security and compliance

## Output Format

Provide structured intelligence reports with:
- Executive summary
- Key competitive insights
- Feature comparison tables
- Risk alerts and opportunities
- Recommended responses`;

export class CloudIntelAgent extends BaseAgent {
  constructor(verbose: boolean = false) {
    super({
      name: "CloudIntelAgent",
      description: "Cloud platform competitive intelligence",
      tools: cloudIntelAgentTools,
      systemPrompt: CLOUD_INTEL_SYSTEM_PROMPT,
      temperature: 0,
      maxIterations: 20,
      verbose,
    });
  }

  /**
   * Analyze a specific cloud product category
   */
  async analyzeCloudCategory(
    category: string,
    competitors?: string[]
  ): Promise<{
    output: string;
    success: boolean;
    runId: string;
  }> {
    const defaultCompetitors = {
      "Sales Cloud": ["Microsoft Dynamics 365", "HubSpot", "Oracle Sales Cloud", "SAP Sales Cloud"],
      "Service Cloud": ["Zendesk", "ServiceNow", "Freshdesk", "Microsoft Dynamics 365 Service"],
      "Marketing Cloud": ["Adobe Experience Cloud", "HubSpot Marketing", "Oracle Marketing Cloud"],
      "Commerce Cloud": ["Shopify Plus", "Adobe Commerce", "SAP Commerce Cloud"],
      "Data Cloud": ["Snowflake", "Databricks", "Google BigQuery", "AWS Redshift"],
    };

    const relevantCompetitors = competitors || 
      defaultCompetitors[category as keyof typeof defaultCompetitors] || 
      ["Microsoft", "Oracle", "SAP", "Google"];

    const input = `Analyze the competitive landscape for ${category} against these competitors: ${relevantCompetitors.join(", ")}.

Provide:
1. Feature comparison and gaps
2. Recent competitive moves
3. Market position and trends
4. Customer sentiment comparison
5. Recommended responses and opportunities`;

    const result = await this.run(input, {
      category,
      competitors: relevantCompetitors,
      type: "cloud_category_analysis",
    });

    return {
      output: result.output,
      success: result.success,
      runId: result.runId,
    };
  }

  /**
   * Track competitor product updates
   */
  async trackCompetitorUpdates(competitor: string): Promise<{
    output: string;
    success: boolean;
    runId: string;
  }> {
    const input = `Track recent product updates and announcements from ${competitor}.

Research:
1. New feature releases
2. Product roadmap signals
3. Integration announcements
4. Pricing or packaging changes
5. Customer-facing messaging changes

Assess the competitive implications and recommended responses.`;

    const result = await this.run(input, {
      competitor,
      type: "competitor_updates",
    });

    return {
      output: result.output,
      success: result.success,
      runId: result.runId,
    };
  }

  /**
   * Analyze cloud market trends
   */
  async analyzeMarketTrends(focus?: string): Promise<{
    output: string;
    success: boolean;
    runId: string;
  }> {
    const input = `Analyze current trends in the enterprise cloud market${focus ? ` with focus on ${focus}` : ""}.

Research:
1. Technology trends (AI, automation, integration)
2. Buyer behavior changes
3. Regulatory and compliance trends
4. Market growth and segmentation
5. Emerging categories and opportunities

Provide strategic implications and recommendations.`;

    const result = await this.run(input, {
      focus,
      type: "market_trends",
    });

    return {
      output: result.output,
      success: result.success,
      runId: result.runId,
    };
  }

  /**
   * Generate competitive battle card
   */
  async generateBattleCard(
    ownProduct: string,
    competitor: string
  ): Promise<{
    output: string;
    success: boolean;
    runId: string;
  }> {
    const input = `Generate a competitive battle card for ${ownProduct} vs ${competitor}.

Include:
1. Quick comparison table
2. Key differentiators (our strengths)
3. Their strengths (and how to address)
4. Common objections and responses
5. Win themes and messaging
6. Customer proof points
7. Landmines to avoid

Make it actionable for sales conversations.`;

    const result = await this.run(input, {
      ownProduct,
      competitor,
      type: "battle_card",
    });

    return {
      output: result.output,
      success: result.success,
      runId: result.runId,
    };
  }

  /**
   * Weekly competitive intelligence digest
   */
  async generateWeeklyDigest(
    products: string[],
    competitors: string[]
  ): Promise<{
    output: string;
    success: boolean;
    runId: string;
  }> {
    const input = `Generate a weekly competitive intelligence digest.

Our products to track: ${products.join(", ")}
Competitors to monitor: ${competitors.join(", ")}

Summarize:
1. Key competitive moves this week
2. Notable customer wins/losses
3. Product announcements
4. Market commentary
5. Action items and alerts

Keep it executive-summary level with links to details.`;

    const result = await this.run(input, {
      products,
      competitors,
      type: "weekly_digest",
    });

    return {
      output: result.output,
      success: result.success,
      runId: result.runId,
    };
  }
}

// Create singleton instance
let cloudIntelAgentInstance: CloudIntelAgent | null = null;

export function getCloudIntelAgent(verbose: boolean = false): CloudIntelAgent {
  if (!cloudIntelAgentInstance) {
    cloudIntelAgentInstance = new CloudIntelAgent(verbose);
  }
  return cloudIntelAgentInstance;
}

export default CloudIntelAgent;


