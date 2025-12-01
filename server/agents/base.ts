/**
 * Base Agent
 * Abstract base class for all LangChain agents using Gemini
 */

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import type { DynamicStructuredTool } from "@langchain/core/tools";
import { v4 as uuidv4 } from "uuid";
import { ingestAgentOutput } from "../services/salesforce-data-cloud";

export interface AgentRunResult {
  output: string;
  intermediateSteps: any[];
  runId: string;
  success: boolean;
  error?: string;
}

export interface AgentConfig {
  name: string;
  description: string;
  tools: DynamicStructuredTool[];
  systemPrompt: string;
  temperature?: number;
  maxIterations?: number;
  verbose?: boolean;
}

export abstract class BaseAgent {
  protected model: ChatGoogleGenerativeAI;
  protected executor: AgentExecutor;
  protected name: string;
  protected description: string;
  protected verbose: boolean;

  constructor(config: AgentConfig) {
    this.name = config.name;
    this.description = config.description;
    this.verbose = config.verbose ?? false;

    // Initialize Gemini model
    this.model = new ChatGoogleGenerativeAI({
      modelName: "gemini-2.0-flash-exp", // Using latest available Gemini model
      apiKey: process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY,
      temperature: config.temperature ?? 0,
    });

    // Create the prompt template with system message and scratchpad
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", config.systemPrompt],
      ["human", "{input}"],
      new MessagesPlaceholder("agent_scratchpad"),
    ]);

    // Create the tool-calling agent
    const agent = createToolCallingAgent({
      llm: this.model,
      tools: config.tools,
      prompt,
    });

    // Create the executor
    this.executor = new AgentExecutor({
      agent,
      tools: config.tools,
      verbose: this.verbose,
      maxIterations: config.maxIterations ?? 15,
      returnIntermediateSteps: true,
    });
  }

  /**
   * Run the agent with the given input
   */
  async run(input: string, metadata?: Record<string, any>): Promise<AgentRunResult> {
    const runId = uuidv4();
    const startTime = Date.now();

    try {
      if (this.verbose) {
        console.log(`[${this.name}] Starting run ${runId}`);
        console.log(`[${this.name}] Input: ${input}`);
      }

      const result = await this.executor.invoke({ input });

      const duration = Date.now() - startTime;
      if (this.verbose) {
        console.log(`[${this.name}] Completed in ${duration}ms`);
      }

      // Persist output to Data Cloud
      await this.persistOutput({
        runId,
        input,
        output: result.output,
        intermediateSteps: result.intermediateSteps || [],
        metadata: {
          ...metadata,
          duration,
        },
      });

      return {
        output: result.output,
        intermediateSteps: result.intermediateSteps || [],
        runId,
        success: true,
      };
    } catch (error: any) {
      console.error(`[${this.name}] Error in run ${runId}:`, error);

      return {
        output: "",
        intermediateSteps: [],
        runId,
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Persist agent output to Data Cloud for memory/RAG
   */
  protected async persistOutput(data: {
    runId: string;
    input: string;
    output: string;
    intermediateSteps: any[];
    metadata?: Record<string, any>;
  }): Promise<void> {
    try {
      await ingestAgentOutput({
        agentName: this.name,
        runId: data.runId,
        input: data.input,
        output: data.output,
        toolsUsed: data.intermediateSteps.map((step: any) => ({
          tool: step.action?.tool,
          input: step.action?.toolInput,
        })),
        timestamp: new Date(),
        metadata: data.metadata || {},
      });
    } catch (error) {
      // Don't fail the agent run if persistence fails
      console.warn(`[${this.name}] Failed to persist output to Data Cloud:`, error);
    }
  }

  /**
   * Get agent name
   */
  getName(): string {
    return this.name;
  }

  /**
   * Get agent description
   */
  getDescription(): string {
    return this.description;
  }
}

/**
 * Create a simple agent with custom configuration
 */
export function createAgent(config: AgentConfig): BaseAgent {
  return new (class extends BaseAgent {
    constructor() {
      super(config);
    }
  })();
}

export default BaseAgent;

