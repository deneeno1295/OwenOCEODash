/**
 * Sentiment Agent
 * Competitor sentiment tracking and analysis
 */

import { BaseAgent } from "./base";
import { sentimentAgentTools } from "./tools";

const SENTIMENT_SYSTEM_PROMPT = `You are an expert competitive intelligence analyst specializing in sentiment analysis and market perception tracking.

## Your Role
Track and analyze market sentiment for competitors to identify:
- Shifts in public perception
- Emerging threats or opportunities
- Key narratives and talking points
- Social media trends and influencer opinions

## Available Tools
- get_company_news: Get recent news articles with sentiment
- analyze_sentiment: Deep sentiment analysis of text
- extract_topics: Extract themes and topics from content
- search_tweets: Search Twitter for social conversation
- get_trending_sentiment: Get trending sentiment on Twitter
- monitor_company_mentions: Monitor social mentions of a company
- recall_previous_research: Check historical sentiment data

## Analysis Framework

For each competitor, analyze:

1. **News Sentiment**
   - Overall tone of recent coverage
   - Key narratives being promoted
   - Journalist and analyst perspectives

2. **Social Sentiment**
   - Twitter conversation volume and tone
   - Key influencers and their positions
   - Trending hashtags and topics

3. **Topic Analysis**
   - What topics are being discussed
   - Sentiment per topic
   - Emerging themes

4. **Trend Direction**
   - Is sentiment improving, declining, or stable?
   - What's driving the trend?
   - Comparison to previous periods

## Output Format

Provide structured sentiment reports with:
- Sentiment scores (0-100)
- Trend direction (↑ improving, ↓ declining, → stable)
- Key themes and topics
- Notable mentions or quotes
- Risk alerts and opportunities`;

export class SentimentAgent extends BaseAgent {
  constructor(verbose: boolean = false) {
    super({
      name: "SentimentAgent",
      description: "Competitor sentiment tracking and analysis",
      tools: sentimentAgentTools,
      systemPrompt: SENTIMENT_SYSTEM_PROMPT,
      temperature: 0,
      maxIterations: 15,
      verbose,
    });
  }

  /**
   * Track sentiment for a single competitor
   */
  async trackCompetitorSentiment(competitor: string): Promise<{
    output: string;
    success: boolean;
    runId: string;
  }> {
    const input = `Analyze the current market sentiment for ${competitor}.

Gather data from:
1. Recent news coverage
2. Twitter/social media conversations
3. Extract key topics and themes

Provide a comprehensive sentiment report including:
- Overall sentiment score (0-100)
- Trend direction
- Key topics with per-topic sentiment
- Notable quotes or mentions
- Risk alerts`;

    const result = await this.run(input, {
      competitor,
      type: "competitor_sentiment",
    });

    return {
      output: result.output,
      success: result.success,
      runId: result.runId,
    };
  }

  /**
   * Track sentiment for multiple competitors
   */
  async trackMultipleCompetitors(competitors: string[]): Promise<{
    output: string;
    success: boolean;
    runId: string;
  }> {
    const input = `Analyze and compare market sentiment for these competitors: ${competitors.join(", ")}.

For each competitor, analyze:
1. Recent news sentiment
2. Social media sentiment
3. Key topics and themes

Then provide:
- Comparative sentiment scores
- Who's gaining vs losing perception
- Key differentiating narratives
- Alerts for significant sentiment shifts`;

    const result = await this.run(input, {
      competitors,
      type: "multi_competitor_sentiment",
    });

    return {
      output: result.output,
      success: result.success,
      runId: result.runId,
    };
  }

  /**
   * Analyze sentiment around a specific topic
   */
  async analyzeTopicSentiment(topic: string, context?: string): Promise<{
    output: string;
    success: boolean;
    runId: string;
  }> {
    const input = `Analyze market sentiment around the topic: "${topic}"${context ? ` in the context of ${context}` : ""}.

Include:
1. Overall sentiment and volume
2. Key viewpoints and perspectives
3. Influencer opinions
4. Trend direction
5. Related topics and themes`;

    const result = await this.run(input, {
      topic,
      context,
      type: "topic_sentiment",
    });

    return {
      output: result.output,
      success: result.success,
      runId: result.runId,
    };
  }

  /**
   * Get sentiment velocity (rate of change)
   */
  async getSentimentVelocity(company: string): Promise<{
    output: string;
    success: boolean;
    runId: string;
  }> {
    const input = `Analyze the sentiment velocity for ${company} - how quickly is sentiment changing?

Look at:
1. Recent sentiment trends
2. Volume of mentions
3. Pace of narrative changes
4. Comparison to historical patterns

Identify any accelerating positive or negative trends.`;

    const result = await this.run(input, {
      company,
      type: "sentiment_velocity",
    });

    return {
      output: result.output,
      success: result.success,
      runId: result.runId,
    };
  }
}

// Create singleton instance
let sentimentAgentInstance: SentimentAgent | null = null;

export function getSentimentAgent(verbose: boolean = false): SentimentAgent {
  if (!sentimentAgentInstance) {
    sentimentAgentInstance = new SentimentAgent(verbose);
  }
  return sentimentAgentInstance;
}

export default SentimentAgent;

