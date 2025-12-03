/**
 * Key People Agent
 * VIP discovery and meeting preparation
 */

import { BaseAgent } from "./base";
import { keyPeopleAgentTools } from "./tools";
import {
  KEY_PEOPLE_DISCOVERY_PROMPT,
  KEY_PEOPLE_EVENT_DISCOVERY_PROMPT,
  KEY_PEOPLE_INDUSTRY_DISCOVERY_PROMPT,
  KEY_PEOPLE_DEEP_RESEARCH_PROMPT,
  KEY_PEOPLE_MEETING_PREP_PROMPT,
} from "../prompts/key-people-research";

const KEY_PEOPLE_SYSTEM_PROMPT = `You are an executive briefing specialist helping prepare a CEO for important meetings and travel.

## Your Expertise
- Identifying strategically important people to meet
- Researching individuals for meeting preparation
- Understanding relationship dynamics and meeting value
- Providing actionable briefings

## Available Tools
- search_sales_navigator: Search LinkedIn for leads
- get_linkedin_profile: Get LinkedIn profile details
- search_regional_leaders: Find leaders in a location
- get_shared_connections: Find mutual connections
- enrich_person: Get detailed person information
- search_people_by_role: Search by job title
- get_company_executives: Get company leadership
- search_tweets: Search Twitter for their activity
- get_account_tweets: Get their Twitter posts
- semantic_search: Find content about them
- search_company_mentions: Find mentions of their company
- get_company_news: Get news about their company
- recall_previous_research: Check existing research

## Discovery Types

You can discover important people by:
1. **Location**: Who to meet when traveling to a city/country
2. **Event**: Who will be at a specific conference or event
3. **Industry**: Key leaders in a specific industry vertical

## Output Quality

For each person, provide:
- Full name and current title
- Organization
- Why they're important to meet
- Relevance score (0-100)
- Suggested talking points
- Recent activity or news`;

export class KeyPeopleAgent extends BaseAgent {
  constructor(verbose: boolean = false) {
    super({
      name: "KeyPeopleAgent",
      description: "VIP discovery and meeting preparation",
      tools: keyPeopleAgentTools,
      systemPrompt: KEY_PEOPLE_SYSTEM_PROMPT,
      temperature: 0,
      maxIterations: 25,
      verbose,
    });
  }

  /**
   * Discover key people for a location (travel prep)
   */
  async discoverByLocation(
    location: string,
    country?: string,
    purpose?: string
  ): Promise<{
    output: string;
    success: boolean;
    runId: string;
  }> {
    const input = `Discover the most important people to meet when traveling to ${location}${country ? `, ${country}` : ""}.
${purpose ? `Purpose of visit: ${purpose}` : ""}

Find:
1. Government officials and policy makers
2. CEOs and business leaders
3. Technology executives (CIOs, CTOs)
4. Investors and VCs
5. Industry influencers

For each person, provide:
- Name, title, organization
- Why they're important
- Relevance score (0-100)
- Suggested conversation topics
- Recent news or activity`;

    const result = await this.run(input, {
      location,
      country,
      purpose,
      type: "location_discovery",
    });

    return {
      output: result.output,
      success: result.success,
      runId: result.runId,
    };
  }

  /**
   * Discover key people at an event
   */
  async discoverByEvent(
    eventName: string,
    location?: string,
    focusAreas?: string[]
  ): Promise<{
    output: string;
    success: boolean;
    runId: string;
  }> {
    const input = `Identify key people to meet at ${eventName}${location ? ` in ${location}` : ""}.
${focusAreas?.length ? `Focus areas: ${focusAreas.join(", ")}` : ""}

Find:
1. Confirmed speakers and panelists
2. Expected notable attendees
3. Company delegates and executives
4. Industry analysts and media

For each person:
- Name, title, organization
- Their role at the event
- Why they're worth meeting
- Relevance score
- Meeting logistics suggestions`;

    const result = await this.run(input, {
      eventName,
      location,
      focusAreas,
      type: "event_discovery",
    });

    return {
      output: result.output,
      success: result.success,
      runId: result.runId,
    };
  }

  /**
   * Discover key people in an industry
   */
  async discoverByIndustry(
    industry: string,
    geography?: string,
    focus?: string
  ): Promise<{
    output: string;
    success: boolean;
    runId: string;
  }> {
    const input = `Map the key leaders in the ${industry} industry${geography ? ` in ${geography}` : ""}.
${focus ? `Focus: ${focus}` : ""}

Create a map of:
1. C-Suite executives at major players
2. Rising stars on trajectory to leadership
3. Technology decision makers
4. Influential analysts and consultants
5. Key investors in the space

For each person, assess:
- Influence level (High/Medium/Low)
- Accessibility
- Priority (Must-meet/Should-meet/Nice-to-meet)`;

    const result = await this.run(input, {
      industry,
      geography,
      focus,
      type: "industry_discovery",
    });

    return {
      output: result.output,
      success: result.success,
      runId: result.runId,
    };
  }

  /**
   * Deep research on a specific person
   */
  async deepResearch(
    personName: string,
    title?: string,
    organization?: string
  ): Promise<{
    output: string;
    success: boolean;
    runId: string;
  }> {
    const input = `Compile a comprehensive intelligence dossier on ${personName}${title ? `, ${title}` : ""}${organization ? ` at ${organization}` : ""}.

Research:
1. Professional background and career history
2. Current role and responsibilities
3. Recent public activity (speeches, interviews, social media)
4. Known positions on key topics
5. Personal interests and style
6. Mutual connections and introduction paths
7. Meeting strategy recommendations

This should enable a CEO to walk into a meeting fully prepared.`;

    const result = await this.run(input, {
      personName,
      title,
      organization,
      type: "deep_research",
    });

    return {
      output: result.output,
      success: result.success,
      runId: result.runId,
    };
  }

  /**
   * Generate meeting prep brief
   */
  async generateMeetingPrep(
    personName: string,
    context: string,
    objectives?: string[]
  ): Promise<{
    output: string;
    success: boolean;
    runId: string;
  }> {
    const input = `Create a one-page meeting prep brief for a meeting with ${personName}.

Context: ${context}
${objectives?.length ? `Objectives: ${objectives.join(", ")}` : ""}

Include:
- Quick facts about the person
- Their likely agenda
- Our talking points
- Things to avoid
- Recent context to reference
- Success metrics
- One key insight

Keep it concise and actionable - every word should add value.`;

    const result = await this.run(input, {
      personName,
      context,
      objectives,
      type: "meeting_prep",
    });

    return {
      output: result.output,
      success: result.success,
      runId: result.runId,
    };
  }
}

// Create singleton instance
let keyPeopleAgentInstance: KeyPeopleAgent | null = null;

export function getKeyPeopleAgent(verbose: boolean = false): KeyPeopleAgent {
  if (!keyPeopleAgentInstance) {
    keyPeopleAgentInstance = new KeyPeopleAgent(verbose);
  }
  return keyPeopleAgentInstance;
}

export default KeyPeopleAgent;


