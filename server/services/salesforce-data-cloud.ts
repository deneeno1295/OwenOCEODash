/**
 * Salesforce Data Cloud Service
 * Agent output persistence and memory retrieval for RAG
 */

import axios from "axios";

const SF_DATA_CLOUD_CLIENT_ID = process.env.SALESFORCE_DATA_CLOUD_CLIENT_ID;
const SF_DATA_CLOUD_CLIENT_SECRET = process.env.SALESFORCE_DATA_CLOUD_CLIENT_SECRET;
const SF_DATA_CLOUD_URL = process.env.SALESFORCE_DATA_CLOUD_URL;

if (!SF_DATA_CLOUD_CLIENT_ID || !SF_DATA_CLOUD_CLIENT_SECRET) {
  console.warn("Warning: Salesforce Data Cloud credentials not set. Data Cloud service will not function.");
}

interface AgentOutput {
  agentName: string;
  runId: string;
  input: string;
  output: string;
  toolsUsed: any[];
  timestamp: Date;
  metadata: Record<string, any>;
}

interface DataCloudRecord {
  id: string;
  createdAt: string;
  data: any;
}

let accessToken: string | null = null;
let tokenExpiry: Date | null = null;

/**
 * Get OAuth access token for Data Cloud
 */
async function getAccessToken(): Promise<string> {
  if (accessToken && tokenExpiry && tokenExpiry > new Date()) {
    return accessToken;
  }

  if (!SF_DATA_CLOUD_CLIENT_ID || !SF_DATA_CLOUD_CLIENT_SECRET) {
    throw new Error("Salesforce Data Cloud credentials not configured");
  }

  const response = await axios.post(
    `${SF_DATA_CLOUD_URL || "https://login.salesforce.com"}/services/oauth2/token`,
    new URLSearchParams({
      grant_type: "client_credentials",
      client_id: SF_DATA_CLOUD_CLIENT_ID,
      client_secret: SF_DATA_CLOUD_CLIENT_SECRET,
    }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  accessToken = response.data.access_token;
  tokenExpiry = new Date(Date.now() + (response.data.expires_in - 60) * 1000);

  return accessToken!;
}

/**
 * Make authenticated request to Data Cloud
 */
async function dataCloudRequest<T>(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  endpoint: string,
  data?: any
): Promise<T> {
  const token = await getAccessToken();
  const baseUrl = process.env.SALESFORCE_DATA_CLOUD_INSTANCE_URL || SF_DATA_CLOUD_URL;

  const response = await axios({
    method,
    url: `${baseUrl}/services/data/v59.0${endpoint}`,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    data,
  });

  return response.data;
}

/**
 * Ingest agent output to Data Cloud for persistence
 */
export async function ingestAgentOutput(output: AgentOutput): Promise<{
  success: boolean;
  recordId: string | null;
  error?: string;
}> {
  try {
    const record = {
      Agent_Name__c: output.agentName,
      Run_Id__c: output.runId,
      Input__c: output.input,
      Output__c: output.output.slice(0, 131072), // Limit to 128KB
      Tools_Used__c: JSON.stringify(output.toolsUsed),
      Run_Timestamp__c: output.timestamp.toISOString(),
      Metadata__c: JSON.stringify(output.metadata),
    };

    const response = await dataCloudRequest<{ id: string }>(
      "POST",
      "/sobjects/Agent_Run__c",
      record
    );

    return {
      success: true,
      recordId: response.id,
    };
  } catch (error: any) {
    console.error("Failed to ingest agent output to Data Cloud:", error);
    return {
      success: false,
      recordId: null,
      error: error.message,
    };
  }
}

/**
 * Query memory from Data Cloud for RAG
 */
export async function queryMemory(
  query: string,
  options?: {
    agentName?: string;
    limit?: number;
    afterDate?: Date;
  }
): Promise<{
  records: {
    agentName: string;
    input: string;
    output: string;
    timestamp: string;
    metadata: Record<string, any>;
  }[];
}> {
  try {
    let soql = `SELECT Agent_Name__c, Input__c, Output__c, Run_Timestamp__c, Metadata__c 
                FROM Agent_Run__c 
                WHERE Output__c LIKE '%${query.replace(/'/g, "\\'")}%'`;

    if (options?.agentName) {
      soql += ` AND Agent_Name__c = '${options.agentName}'`;
    }

    if (options?.afterDate) {
      soql += ` AND Run_Timestamp__c > ${options.afterDate.toISOString()}`;
    }

    soql += ` ORDER BY Run_Timestamp__c DESC`;
    soql += ` LIMIT ${options?.limit || 20}`;

    const response = await dataCloudRequest<{ records: any[] }>(
      "GET",
      `/query?q=${encodeURIComponent(soql)}`
    );

    return {
      records: response.records.map((r) => ({
        agentName: r.Agent_Name__c,
        input: r.Input__c,
        output: r.Output__c,
        timestamp: r.Run_Timestamp__c,
        metadata: JSON.parse(r.Metadata__c || "{}"),
      })),
    };
  } catch (error) {
    console.error("Failed to query Data Cloud memory:", error);
    return { records: [] };
  }
}

/**
 * Get recent research on a specific company
 */
export async function getRecentResearch(
  company: string,
  options?: {
    limit?: number;
    daysBack?: number;
  }
): Promise<{
  research: {
    agentName: string;
    summary: string;
    timestamp: string;
    type: string;
  }[];
}> {
  const daysBack = options?.daysBack || 30;
  const afterDate = new Date();
  afterDate.setDate(afterDate.getDate() - daysBack);

  try {
    const soql = `SELECT Agent_Name__c, Output__c, Run_Timestamp__c, Metadata__c 
                  FROM Agent_Run__c 
                  WHERE (Input__c LIKE '%${company}%' OR Output__c LIKE '%${company}%')
                  AND Run_Timestamp__c > ${afterDate.toISOString()}
                  ORDER BY Run_Timestamp__c DESC
                  LIMIT ${options?.limit || 10}`;

    const response = await dataCloudRequest<{ records: any[] }>(
      "GET",
      `/query?q=${encodeURIComponent(soql)}`
    );

    return {
      research: response.records.map((r) => {
        const metadata = JSON.parse(r.Metadata__c || "{}");
        return {
          agentName: r.Agent_Name__c,
          summary: r.Output__c.slice(0, 500),
          timestamp: r.Run_Timestamp__c,
          type: metadata.type || "general",
        };
      }),
    };
  } catch (error) {
    console.error("Failed to get recent research from Data Cloud:", error);
    return { research: [] };
  }
}

/**
 * Get research prompts from Salesforce
 */
export async function getResearchPrompts(): Promise<{
  prompts: {
    name: string;
    type: string;
    content: string;
    isActive: boolean;
  }[];
}> {
  try {
    const soql = `SELECT Name, Prompt_Type__c, Content__c, Is_Active__c 
                  FROM Research_Prompt__c 
                  WHERE Is_Active__c = true`;

    const response = await dataCloudRequest<{ records: any[] }>(
      "GET",
      `/query?q=${encodeURIComponent(soql)}`
    );

    return {
      prompts: response.records.map((r) => ({
        name: r.Name,
        type: r.Prompt_Type__c,
        content: r.Content__c,
        isActive: r.Is_Active__c,
      })),
    };
  } catch (error) {
    console.error("Failed to get research prompts from Salesforce:", error);
    return { prompts: [] };
  }
}

/**
 * Ingest file to Data Cloud
 */
export async function ingestFile(
  file: {
    name: string;
    content: string | Buffer;
    mimeType: string;
  },
  metadata: Record<string, any>
): Promise<{
  success: boolean;
  fileId: string | null;
  error?: string;
}> {
  try {
    // Base64 encode if buffer
    const content = Buffer.isBuffer(file.content)
      ? file.content.toString("base64")
      : Buffer.from(file.content).toString("base64");

    const record = {
      Name: file.name,
      File_Content__c: content,
      Mime_Type__c: file.mimeType,
      Metadata__c: JSON.stringify(metadata),
      Upload_Timestamp__c: new Date().toISOString(),
    };

    const response = await dataCloudRequest<{ id: string }>(
      "POST",
      "/sobjects/Data_Cloud_File__c",
      record
    );

    return {
      success: true,
      fileId: response.id,
    };
  } catch (error: any) {
    console.error("Failed to ingest file to Data Cloud:", error);
    return {
      success: false,
      fileId: null,
      error: error.message,
    };
  }
}

/**
 * Query Data Cloud with SOQL
 */
export async function queryData(soql: string): Promise<{
  records: any[];
  totalSize: number;
}> {
  try {
    const response = await dataCloudRequest<{ records: any[]; totalSize: number }>(
      "GET",
      `/query?q=${encodeURIComponent(soql)}`
    );

    return {
      records: response.records,
      totalSize: response.totalSize,
    };
  } catch (error) {
    console.error("Failed to query Data Cloud:", error);
    return { records: [], totalSize: 0 };
  }
}

export default {
  ingestAgentOutput,
  queryMemory,
  getRecentResearch,
  getResearchPrompts,
  ingestFile,
  queryData,
};

