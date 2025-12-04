/**
 * Real-time Earnings Service
 * Polls for live earnings data and emits updates via SSE
 */

import { EventEmitter } from "events";
import { searchMarketData, getEarningsData } from "./perplexity";
import { storage } from "../storage";
import type { InsertEarningsReport } from "@shared/schema";

// Event emitter for SSE clients
export const earningsEmitter = new EventEmitter();
earningsEmitter.setMaxListeners(100); // Support many connected clients

export interface LiveEarningsData {
  company: string;
  quarter: string;
  fiscalYear: string;
  status: "pre_earnings" | "in_progress" | "released" | "unknown";
  lastUpdated: Date;
  
  // Core metrics
  revenue?: string;
  revenueExpected?: string;
  revenueBeatMiss?: string;
  revenueYoY?: string;
  eps?: string;
  epsExpected?: string;
  epsBeatMiss?: string;
  epsYoY?: string;
  
  // Guidance
  guidance?: string;
  guidanceNotes?: string;
  
  // Market reaction
  stockReaction?: string;
  analystReaction?: string;
  
  // Raw summary from AI
  summary?: string;
  
  // Headlines
  headlines?: string[];
}

interface PollingSession {
  company: string;
  intervalId: NodeJS.Timeout | null;
  isActive: boolean;
  intervalMs: number;
  lastData: LiveEarningsData | null;
}

// Active polling sessions
const pollingSessions: Map<string, PollingSession> = new Map();

/**
 * Fetch live earnings data for a company
 */
export async function fetchLiveEarnings(company: string): Promise<LiveEarningsData> {
  const now = new Date();
  
  try {
    // Query for real-time earnings data
    const searchQuery = `${company} earnings results today live ${now.toISOString().split('T')[0]} revenue EPS guidance`;
    
    console.log(`[RealtimeEarnings] Fetching live data for ${company}...`);
    
    // Use Perplexity for real-time market data
    const marketData = await searchMarketData(searchQuery);
    
    // Also try to get structured earnings data
    let earningsData;
    try {
      earningsData = await getEarningsData(company);
    } catch (e) {
      // Earnings data might not be available yet
      earningsData = null;
    }
    
    // Parse the response to extract key metrics
    const data: LiveEarningsData = {
      company,
      quarter: extractQuarter(marketData),
      fiscalYear: extractFiscalYear(marketData, company),
      status: determineEarningsStatus(marketData),
      lastUpdated: now,
      summary: marketData,
      headlines: extractHeadlines(marketData),
    };
    
    // If we got structured earnings data, use it
    if (earningsData && earningsData.revenue !== "N/A") {
      data.revenue = earningsData.revenue;
      data.revenueExpected = earningsData.revenueExpected;
      data.revenueBeatMiss = earningsData.revenueBeatMiss;
      data.revenueYoY = earningsData.revenueYoY;
      data.eps = earningsData.eps;
      data.epsExpected = earningsData.epsExpected;
      data.epsBeatMiss = earningsData.epsBeatMiss;
      data.epsYoY = earningsData.epsYoY;
      data.guidance = earningsData.guidance;
      data.guidanceNotes = earningsData.keyHighlights?.join("; ");
      // Use fiscal year from structured data if available
      if (earningsData.fiscalYear && earningsData.fiscalYear !== "N/A") {
        data.fiscalYear = earningsData.fiscalYear;
      }
      if (earningsData.fiscalQuarter && earningsData.fiscalQuarter !== "N/A") {
        data.quarter = earningsData.fiscalQuarter;
      }
    } else {
      // Try to extract from summary
      const extracted = extractMetricsFromSummary(marketData);
      Object.assign(data, extracted);
    }
    
    console.log(`[RealtimeEarnings] Successfully fetched data for ${company}`);
    return data;
    
  } catch (error: any) {
    console.error(`[RealtimeEarnings] Error fetching ${company}:`, error.message);
    
    return {
      company,
      quarter: "Q3",
      fiscalYear: extractFiscalYear("", company),
      status: "unknown",
      lastUpdated: now,
      summary: `Unable to fetch live data: ${error.message}`,
    };
  }
}

/**
 * Extract quarter from text
 */
function extractQuarter(text: string): string {
  const quarterMatch = text.match(/Q[1-4]/i);
  return quarterMatch ? quarterMatch[0].toUpperCase() : "Q3";
}

/**
 * Extract fiscal year from text
 * Handles various formats: FY2026, fiscal 2026, fiscal year 2026, FY26
 */
function extractFiscalYear(text: string, company: string): string {
  // Look for explicit fiscal year mentions
  const fyMatch = text.match(/(?:FY|fiscal\s*(?:year)?\s*)['"]?(\d{2,4})/i);
  
  if (fyMatch) {
    let year = fyMatch[1];
    // Handle 2-digit years (e.g., FY26 -> FY2026)
    if (year.length === 2) {
      year = "20" + year;
    }
    return `FY${year}`;
  }
  
  // Fallback: For companies like Salesforce with Feb fiscal year end,
  // the current calendar year Q4 (Oct-Dec) is their next FY's Q3
  // Example: October 2024 = Salesforce Q3 FY2025, but December 2024 reporting would be Q3 FY2026
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12
  
  // Salesforce and similar companies: FY starts in February
  // So if we're in Nov/Dec 2024, that's Q3/Q4 of FY2025
  // If we're in Jan 2025, that's Q4 of FY2025
  // Feb 2025 starts FY2026
  const salesforceCompanies = ["salesforce", "crm"];
  const isSalesforceLikeFY = salesforceCompanies.some(c => company.toLowerCase().includes(c));
  
  if (isSalesforceLikeFY) {
    // Salesforce FY = calendar year + 1 for most of the year
    // Feb-Dec of year X = FY(X+1)
    // Jan of year X = FY(X)
    const fiscalYear = currentMonth >= 2 ? currentYear + 1 : currentYear;
    return `FY${fiscalYear}`;
  }
  
  // Default: Most companies use calendar year = fiscal year
  return `FY${currentYear}`;
}

/**
 * Determine earnings status from text
 */
function determineEarningsStatus(text: string): LiveEarningsData["status"] {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes("reported") || lowerText.includes("announced") || lowerText.includes("beat") || lowerText.includes("missed")) {
    return "released";
  }
  if (lowerText.includes("in progress") || lowerText.includes("underway") || lowerText.includes("call")) {
    return "in_progress";
  }
  if (lowerText.includes("expected") || lowerText.includes("will report") || lowerText.includes("scheduled")) {
    return "pre_earnings";
  }
  
  return "unknown";
}

/**
 * Extract headlines from summary text
 */
function extractHeadlines(text: string): string[] {
  // Split by common separators and get key sentences
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
  return sentences.slice(0, 5).map(s => s.trim());
}

/**
 * Extract metrics from unstructured summary
 */
function extractMetricsFromSummary(text: string): Partial<LiveEarningsData> {
  const result: Partial<LiveEarningsData> = {};
  
  // Revenue extraction
  const revenueMatch = text.match(/revenue[:\s]+\$?([\d.]+)\s*(billion|million|B|M)/i);
  if (revenueMatch) {
    result.revenue = `$${revenueMatch[1]}${revenueMatch[2].charAt(0).toUpperCase()}`;
  }
  
  // EPS extraction
  const epsMatch = text.match(/EPS[:\s]+\$?([\d.]+)/i);
  if (epsMatch) {
    result.eps = `$${epsMatch[1]}`;
  }
  
  // Beat/miss detection
  if (text.toLowerCase().includes("beat")) {
    result.revenueBeatMiss = "beat";
    result.epsBeatMiss = "beat";
  } else if (text.toLowerCase().includes("miss")) {
    result.revenueBeatMiss = "miss";
    result.epsBeatMiss = "miss";
  }
  
  // Guidance detection
  if (text.toLowerCase().includes("raised guidance") || text.toLowerCase().includes("raised outlook")) {
    result.guidance = "raised";
  } else if (text.toLowerCase().includes("lowered guidance") || text.toLowerCase().includes("lowered outlook")) {
    result.guidance = "lowered";
  } else if (text.toLowerCase().includes("maintained guidance") || text.toLowerCase().includes("reaffirmed")) {
    result.guidance = "maintained";
  }
  
  // Stock reaction
  const stockMatch = text.match(/stock[:\s]*(up|down|rose|fell)[:\s]*([\d.]+)%/i);
  if (stockMatch) {
    const direction = stockMatch[1].toLowerCase().includes("up") || stockMatch[1].toLowerCase().includes("rose") ? "+" : "-";
    result.stockReaction = `${direction}${stockMatch[2]}%`;
  }
  
  return result;
}

/**
 * Start polling for a company's earnings
 */
export function startPolling(company: string, intervalMs: number = 120000): void {
  // Stop existing polling for this company if any
  stopPolling(company);
  
  const session: PollingSession = {
    company,
    intervalId: null,
    isActive: true,
    intervalMs,
    lastData: null,
  };
  
  console.log(`[RealtimeEarnings] Starting polling for ${company} every ${intervalMs / 1000}s`);
  
  // Fetch immediately
  fetchAndEmit(session);
  
  // Then poll at interval
  session.intervalId = setInterval(() => {
    if (session.isActive) {
      fetchAndEmit(session);
    }
  }, intervalMs);
  
  pollingSessions.set(company.toLowerCase(), session);
  
  // Emit polling started event
  earningsEmitter.emit("polling_started", { company, intervalMs });
}

/**
 * Fetch data and emit if changed
 */
async function fetchAndEmit(session: PollingSession): Promise<void> {
  try {
    const data = await fetchLiveEarnings(session.company);
    
    // Check if data has meaningfully changed
    const hasChanged = !session.lastData || 
      session.lastData.status !== data.status ||
      session.lastData.revenue !== data.revenue ||
      session.lastData.eps !== data.eps ||
      session.lastData.summary !== data.summary;
    
    session.lastData = data;
    
    // Always emit update event
    earningsEmitter.emit("update", data);
    
    if (hasChanged) {
      console.log(`[RealtimeEarnings] New data detected for ${session.company}`);
      earningsEmitter.emit("change", data);
    }
    
  } catch (error: any) {
    console.error(`[RealtimeEarnings] Poll error for ${session.company}:`, error.message);
    earningsEmitter.emit("error", { company: session.company, error: error.message });
  }
}

/**
 * Stop polling for a company
 */
export function stopPolling(company: string): void {
  const session = pollingSessions.get(company.toLowerCase());
  
  if (session) {
    session.isActive = false;
    if (session.intervalId) {
      clearInterval(session.intervalId);
    }
    pollingSessions.delete(company.toLowerCase());
    console.log(`[RealtimeEarnings] Stopped polling for ${company}`);
    earningsEmitter.emit("polling_stopped", { company });
  }
}

/**
 * Get current polling status
 */
export function getPollingStatus(): {
  activeSessions: { company: string; intervalMs: number; lastUpdated: Date | null }[];
} {
  const activeSessions = Array.from(pollingSessions.values()).map(session => ({
    company: session.company,
    intervalMs: session.intervalMs,
    lastUpdated: session.lastData?.lastUpdated || null,
  }));
  
  return { activeSessions };
}

/**
 * Get last known data for a company
 */
export function getLastData(company: string): LiveEarningsData | null {
  const session = pollingSessions.get(company.toLowerCase());
  return session?.lastData || null;
}

/**
 * Save live earnings data to the database
 */
export async function saveEarningsToDb(data: LiveEarningsData): Promise<void> {
  try {
    // Only save if we have meaningful data
    if (!data.revenue && !data.eps && data.status === "unknown") {
      console.log(`[RealtimeEarnings] Skipping DB save - no meaningful data for ${data.company}`);
      return;
    }

    // Determine beat/miss status
    let beatMiss: string | undefined;
    if (data.revenueBeatMiss === "beat" || data.epsBeatMiss === "beat") {
      beatMiss = "beat";
    } else if (data.revenueBeatMiss === "miss" || data.epsBeatMiss === "miss") {
      beatMiss = "miss";
    } else if (data.revenue || data.eps) {
      beatMiss = "inline";
    }

    const report: InsertEarningsReport = {
      companyName: data.company,
      quarter: data.quarter,
      fiscalYear: data.fiscalYear,
      revenue: data.revenue || null,
      revenueExpected: data.revenueExpected || null,
      revenueBeatMiss: data.revenueBeatMiss || null,
      revenueChange: data.revenueYoY || null,
      eps: data.eps || null,
      epsExpected: data.epsExpected || null,
      epsBeatMiss: data.epsBeatMiss || null,
      epsChange: data.epsYoY || null,
      beatMiss: beatMiss || null,
      beatMissDetails: data.summary?.slice(0, 200) || null,
      guidance: data.guidance || null,
      guidanceNotes: data.guidanceNotes || null,
      stockReaction: data.stockReaction || null,
      analystReaction: data.analystReaction || null,
    };

    await storage.upsertEarningsReport(report);
    console.log(`[RealtimeEarnings] Saved earnings data to DB for ${data.company} ${data.quarter} ${data.fiscalYear}`);
  } catch (error: any) {
    console.error(`[RealtimeEarnings] Failed to save to DB:`, error.message);
  }
}

/**
 * Manual refresh - fetch immediately regardless of interval
 */
export async function manualRefresh(company: string, saveToDb: boolean = true): Promise<LiveEarningsData> {
  console.log(`[RealtimeEarnings] Manual refresh requested for ${company}`);
  
  const data = await fetchLiveEarnings(company);
  
  // Update session if exists
  const session = pollingSessions.get(company.toLowerCase());
  if (session) {
    session.lastData = data;
  }
  
  // Save to database if requested and data is meaningful
  if (saveToDb && data.status !== "unknown") {
    await saveEarningsToDb(data);
  }
  
  // Emit update
  earningsEmitter.emit("update", data);
  earningsEmitter.emit("manual_refresh", data);
  
  return data;
}

export default {
  fetchLiveEarnings,
  startPolling,
  stopPolling,
  getPollingStatus,
  getLastData,
  manualRefresh,
  saveEarningsToDb,
  earningsEmitter,
};

