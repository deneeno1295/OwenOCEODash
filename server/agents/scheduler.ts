/**
 * Agent Scheduler
 * Cron-based scheduling for automated agent runs
 */

import cron from "node-cron";
import { storage } from "../storage";
import { getDashboardAgent } from "./dashboard-agent";
import { getSentimentAgent } from "./sentiment-agent";
import { getStartupAgent } from "./startup-agent";
import { getKeyPeopleAgent } from "./key-people-agent";
import { getCloudIntelAgent } from "./cloud-intel-agent";

interface ScheduledJob {
  name: string;
  task: cron.ScheduledTask;
  cronExpression: string;
  lastRun?: Date;
  nextRun?: Date;
  isRunning: boolean;
}

const scheduledJobs: Map<string, ScheduledJob> = new Map();

/**
 * Default schedule configurations
 */
const DEFAULT_SCHEDULES = {
  dashboard: {
    name: "Dashboard Intelligence",
    cron: "0 6 * * *", // Daily at 6 AM
    description: "Analyze tracked companies earnings and market position",
  },
  sentiment: {
    name: "Sentiment Tracking",
    cron: "0 8 * * *", // Daily at 8 AM
    description: "Track competitor sentiment across news and social",
  },
  keyPeople: {
    name: "Key People Discovery",
    cron: "0 7 * * *", // Daily at 7 AM
    description: "Discover important people for upcoming travel",
  },
  startup: {
    name: "Startup Research",
    cron: "0 3 * * 1", // Weekly Monday 3 AM
    description: "Research startups in watchlist",
  },
  cloudIntel: {
    name: "Cloud Intelligence",
    cron: "0 2 * * 0", // Weekly Sunday 2 AM
    description: "Competitive intelligence on cloud products",
  },
};

/**
 * Run Dashboard Agent for tracked companies
 */
async function runDashboardAgentJob(): Promise<void> {
  console.log("[Scheduler] Running Dashboard Agent job...");
  
  try {
    // Get tracked companies from settings
    const companies = await storage.getTrackedCompanies();
    const activeCompanies = companies.filter((c: any) => c.isActive === 1);
    
    if (activeCompanies.length === 0) {
      console.log("[Scheduler] No active tracked companies found");
      return;
    }

    const agent = getDashboardAgent();
    
    for (const company of activeCompanies.slice(0, 5)) { // Limit to top 5
      console.log(`[Scheduler] Analyzing ${company.name}...`);
      await agent.analyzeCompany(company.name);
    }
    
    console.log("[Scheduler] Dashboard Agent job completed");
  } catch (error) {
    console.error("[Scheduler] Dashboard Agent job failed:", error);
  }
}

/**
 * Run Sentiment Agent for competitors
 */
async function runSentimentAgentJob(): Promise<void> {
  console.log("[Scheduler] Running Sentiment Agent job...");
  
  try {
    const companies = await storage.getTrackedCompanies();
    const competitors = companies
      .filter((c: any) => c.isActive === 1 && c.companyType === "competitor")
      .map((c: any) => c.name);
    
    if (competitors.length === 0) {
      console.log("[Scheduler] No competitors to track");
      return;
    }

    const agent = getSentimentAgent();
    await agent.trackMultipleCompetitors(competitors.slice(0, 5));
    
    console.log("[Scheduler] Sentiment Agent job completed");
  } catch (error) {
    console.error("[Scheduler] Sentiment Agent job failed:", error);
  }
}

/**
 * Run Key People Agent for upcoming travel
 */
async function runKeyPeopleAgentJob(): Promise<void> {
  console.log("[Scheduler] Running Key People Agent job...");
  
  try {
    const locations = await storage.getTravelLocations();
    const upcomingLocations = locations.filter((l: any) => 
      l.status === "planned" || l.status === "upcoming"
    );
    
    if (upcomingLocations.length === 0) {
      console.log("[Scheduler] No upcoming travel locations");
      return;
    }

    const agent = getKeyPeopleAgent();
    
    for (const location of upcomingLocations.slice(0, 3)) {
      console.log(`[Scheduler] Discovering key people in ${location.name}...`);
      await agent.discoverByLocation(location.name, location.country);
    }
    
    console.log("[Scheduler] Key People Agent job completed");
  } catch (error) {
    console.error("[Scheduler] Key People Agent job failed:", error);
  }
}

/**
 * Run Startup Agent for watchlist
 */
async function runStartupAgentJob(): Promise<void> {
  console.log("[Scheduler] Running Startup Agent job...");
  
  try {
    const startups = await storage.getStartupsByCategory("watchlist");
    
    if (startups.length === 0) {
      console.log("[Scheduler] No startups in watchlist");
      return;
    }

    const agent = getStartupAgent();
    
    for (const startup of startups.slice(0, 5)) {
      console.log(`[Scheduler] Researching ${startup.name}...`);
      await agent.researchStartup(startup.name, startup.website || undefined);
    }
    
    console.log("[Scheduler] Startup Agent job completed");
  } catch (error) {
    console.error("[Scheduler] Startup Agent job failed:", error);
  }
}

/**
 * Run Cloud Intel Agent
 */
async function runCloudIntelAgentJob(): Promise<void> {
  console.log("[Scheduler] Running Cloud Intel Agent job...");
  
  try {
    const agent = getCloudIntelAgent();
    
    // Analyze main cloud categories
    const categories = ["Sales Cloud", "Service Cloud", "Data Cloud"];
    
    for (const category of categories) {
      console.log(`[Scheduler] Analyzing ${category}...`);
      await agent.analyzeCloudCategory(category);
    }
    
    console.log("[Scheduler] Cloud Intel Agent job completed");
  } catch (error) {
    console.error("[Scheduler] Cloud Intel Agent job failed:", error);
  }
}

/**
 * Start the scheduler with cadences from database
 */
export async function startScheduler(): Promise<void> {
  console.log("[Scheduler] Starting agent scheduler...");

  try {
    // Load cadences from database
    const cadences = await storage.getAgentCadences();
    const activeCadences = cadences.filter((c: any) => c.isActive === 1);

    // Map cadence names to job functions
    const jobFunctions: Record<string, () => Promise<void>> = {
      dashboard: runDashboardAgentJob,
      "dashboard intelligence": runDashboardAgentJob,
      sentiment: runSentimentAgentJob,
      "sentiment tracking": runSentimentAgentJob,
      "key people": runKeyPeopleAgentJob,
      "key people discovery": runKeyPeopleAgentJob,
      startup: runStartupAgentJob,
      "startup research": runStartupAgentJob,
      "cloud intel": runCloudIntelAgentJob,
      "cloud intelligence": runCloudIntelAgentJob,
    };

    // Schedule jobs from database cadences
    for (const cadence of activeCadences) {
      const cronExpression = cadence.cronExpression || getCronFromSchedule(cadence.schedule);
      const jobFunction = jobFunctions[cadence.name.toLowerCase()];

      if (cronExpression && jobFunction && cron.validate(cronExpression)) {
        scheduleJob(cadence.name, cronExpression, jobFunction);
      } else {
        console.warn(`[Scheduler] Invalid cadence configuration for: ${cadence.name}`);
      }
    }

    // If no cadences in database, use defaults
    if (activeCadences.length === 0) {
      console.log("[Scheduler] No cadences in database, using defaults...");
      
      scheduleJob("Dashboard Intelligence", DEFAULT_SCHEDULES.dashboard.cron, runDashboardAgentJob);
      scheduleJob("Sentiment Tracking", DEFAULT_SCHEDULES.sentiment.cron, runSentimentAgentJob);
      scheduleJob("Key People Discovery", DEFAULT_SCHEDULES.keyPeople.cron, runKeyPeopleAgentJob);
      scheduleJob("Startup Research", DEFAULT_SCHEDULES.startup.cron, runStartupAgentJob);
      scheduleJob("Cloud Intelligence", DEFAULT_SCHEDULES.cloudIntel.cron, runCloudIntelAgentJob);
    }

    console.log(`[Scheduler] Started ${scheduledJobs.size} scheduled jobs`);
  } catch (error) {
    console.error("[Scheduler] Failed to start scheduler:", error);
  }
}

/**
 * Schedule a job
 */
function scheduleJob(
  name: string,
  cronExpression: string,
  jobFunction: () => Promise<void>
): void {
  // Cancel existing job if any
  const existing = scheduledJobs.get(name);
  if (existing) {
    existing.task.stop();
  }

  const task = cron.schedule(cronExpression, async () => {
    const job = scheduledJobs.get(name);
    if (job && !job.isRunning) {
      job.isRunning = true;
      job.lastRun = new Date();
      
      try {
        await jobFunction();
      } finally {
        job.isRunning = false;
      }
    }
  });

  scheduledJobs.set(name, {
    name,
    task,
    cronExpression,
    isRunning: false,
  });

  console.log(`[Scheduler] Scheduled: ${name} (${cronExpression})`);
}

/**
 * Convert schedule string to cron expression
 */
function getCronFromSchedule(schedule: string): string | null {
  const scheduleMap: Record<string, string> = {
    hourly: "0 * * * *",
    daily: "0 6 * * *",
    weekly: "0 3 * * 1",
    monthly: "0 3 1 * *",
  };

  return scheduleMap[schedule.toLowerCase()] || null;
}

/**
 * Stop the scheduler
 */
export function stopScheduler(): void {
  console.log("[Scheduler] Stopping agent scheduler...");
  
  for (const [name, job] of scheduledJobs) {
    job.task.stop();
    console.log(`[Scheduler] Stopped: ${name}`);
  }
  
  scheduledJobs.clear();
}

/**
 * Get status of all scheduled jobs
 */
export function getSchedulerStatus(): {
  jobs: {
    name: string;
    cronExpression: string;
    lastRun?: Date;
    isRunning: boolean;
  }[];
} {
  return {
    jobs: Array.from(scheduledJobs.values()).map((job) => ({
      name: job.name,
      cronExpression: job.cronExpression,
      lastRun: job.lastRun,
      isRunning: job.isRunning,
    })),
  };
}

/**
 * Manually trigger a job
 */
export async function triggerJob(jobName: string): Promise<boolean> {
  const jobFunctions: Record<string, () => Promise<void>> = {
    dashboard: runDashboardAgentJob,
    "dashboard intelligence": runDashboardAgentJob,
    sentiment: runSentimentAgentJob,
    "sentiment tracking": runSentimentAgentJob,
    "key people": runKeyPeopleAgentJob,
    "key people discovery": runKeyPeopleAgentJob,
    startup: runStartupAgentJob,
    "startup research": runStartupAgentJob,
    "cloud intel": runCloudIntelAgentJob,
    "cloud intelligence": runCloudIntelAgentJob,
  };

  const jobFunction = jobFunctions[jobName.toLowerCase()];
  
  if (jobFunction) {
    await jobFunction();
    return true;
  }
  
  return false;
}

export default {
  startScheduler,
  stopScheduler,
  getSchedulerStatus,
  triggerJob,
};

