import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import * as schema from "@shared/schema";
import type { 
  Competitor, InsertCompetitor,
  SentimentAnalysis, InsertSentimentAnalysis,
  Startup, InsertStartup,
  Priority, InsertPriority,
  PriorityHistory, InsertPriorityHistory,
  Comment, InsertComment,
  Stakeholder, InsertStakeholder,
  Note, InsertNote,
  ResearchSession, InsertResearchSession,
  NewsItem, InsertNewsItem,
  Alert, InsertAlert,
  DataCloudUpload, InsertDataCloudUpload,
  SentimentVelocity, InsertSentimentVelocity,
  EarningsReport, InsertEarningsReport,
  TravelLocation, InsertTravelLocation,
  ImportantPerson, InsertImportantPerson,
  LocationResearch, InsertLocationResearch,
  AgentCadence, InsertAgentCadence,
  AgentPrompt, InsertAgentPrompt,
  TrackedCompany, InsertTrackedCompany,
  AgentSpace, InsertAgentSpace,
  CompetitorContent, InsertCompetitorContent
} from "@shared/schema";
import { eq, desc, asc, and } from "drizzle-orm";

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const db = drizzle(pool, { schema });

export interface IStorage {
  // Competitors
  getCompetitors(): Promise<Competitor[]>;
  getCompetitor(id: number): Promise<Competitor | undefined>;
  createCompetitor(competitor: InsertCompetitor): Promise<Competitor>;
  updateCompetitor(id: number, competitor: Partial<InsertCompetitor>): Promise<Competitor | undefined>;
  
  // Sentiment Analysis
  getSentimentAnalysisByCompetitor(competitorId: number): Promise<SentimentAnalysis | undefined>;
  createSentimentAnalysis(analysis: InsertSentimentAnalysis): Promise<SentimentAnalysis>;
  
  // Startups
  getStartups(): Promise<Startup[]>;
  getStartup(id: number): Promise<Startup | undefined>;
  getStartupsByCategory(category: string): Promise<Startup[]>;
  searchStartups(query: string): Promise<Startup[]>;
  createStartup(startup: InsertStartup): Promise<Startup>;
  updateStartup(id: number, startup: Partial<InsertStartup>): Promise<Startup | undefined>;
  deleteStartup(id: number): Promise<boolean>;
  
  // Priorities
  getPriorities(): Promise<Priority[]>;
  getPriority(id: number): Promise<Priority | undefined>;
  createPriority(priority: InsertPriority): Promise<Priority>;
  createPrioritiesBulk(priorities: InsertPriority[]): Promise<Priority[]>;
  updatePriority(id: number, priority: Partial<InsertPriority>): Promise<Priority | undefined>;
  deletePriority(id: number): Promise<boolean>;
  
  // Priority History
  getPriorityHistory(priorityId: number): Promise<PriorityHistory[]>;
  createPriorityHistory(history: InsertPriorityHistory): Promise<PriorityHistory>;
  
  // Comments
  getComments(entityType: string, entityId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  deleteComment(id: number): Promise<boolean>;
  
  // Stakeholders
  getStakeholders(priorityId: number): Promise<Stakeholder[]>;
  createStakeholder(stakeholder: InsertStakeholder): Promise<Stakeholder>;
  deleteStakeholder(id: number): Promise<boolean>;
  
  // Notes
  getNotes(entityType: string, entityId: number): Promise<Note[]>;
  createNote(note: InsertNote): Promise<Note>;
  deleteNote(id: number): Promise<boolean>;
  
  // Research Sessions
  getResearchSessions(entityType: string, entityId: number): Promise<ResearchSession[]>;
  createResearchSession(session: InsertResearchSession): Promise<ResearchSession>;
  updateResearchSession(id: number, session: Partial<InsertResearchSession>): Promise<ResearchSession | undefined>;
  
  // News Items
  getNewsItems(category?: string, limit?: number): Promise<NewsItem[]>;
  createNewsItem(item: InsertNewsItem): Promise<NewsItem>;
  
  // Alerts
  getRecentAlerts(limit?: number): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  
  // Data Cloud Uploads
  getRecentUploads(limit?: number): Promise<DataCloudUpload[]>;
  createUpload(upload: InsertDataCloudUpload): Promise<DataCloudUpload>;
  
  // Sentiment Velocity
  getSentimentVelocity(): Promise<SentimentVelocity[]>;
  createSentimentVelocity(velocity: InsertSentimentVelocity): Promise<SentimentVelocity>;
  
  // Earnings Reports
  getEarningsReports(limit?: number): Promise<EarningsReport[]>;
  getEarningsReportsByCompany(companyName: string): Promise<EarningsReport[]>;
  createEarningsReport(report: InsertEarningsReport): Promise<EarningsReport>;
  
  // Travel Locations
  getTravelLocations(): Promise<TravelLocation[]>;
  getTravelLocation(id: number): Promise<TravelLocation | undefined>;
  createTravelLocation(location: InsertTravelLocation): Promise<TravelLocation>;
  updateTravelLocation(id: number, location: Partial<InsertTravelLocation>): Promise<TravelLocation | undefined>;
  deleteTravelLocation(id: number): Promise<boolean>;
  
  // Important People
  getImportantPeople(locationId?: number): Promise<ImportantPerson[]>;
  getImportantPerson(id: number): Promise<ImportantPerson | undefined>;
  createImportantPerson(person: InsertImportantPerson): Promise<ImportantPerson>;
  createImportantPeopleBulk(people: InsertImportantPerson[]): Promise<ImportantPerson[]>;
  updateImportantPerson(id: number, person: Partial<InsertImportantPerson>): Promise<ImportantPerson | undefined>;
  deleteImportantPerson(id: number): Promise<boolean>;
  
  // Location Research
  getLocationResearch(locationId: number): Promise<LocationResearch[]>;
  createLocationResearch(research: InsertLocationResearch): Promise<LocationResearch>;
  updateLocationResearch(id: number, research: Partial<InsertLocationResearch>): Promise<LocationResearch | undefined>;
  
  // Agent Cadences
  getAgentCadences(): Promise<AgentCadence[]>;
  getAgentCadence(id: number): Promise<AgentCadence | undefined>;
  createAgentCadence(cadence: InsertAgentCadence): Promise<AgentCadence>;
  updateAgentCadence(id: number, cadence: Partial<InsertAgentCadence>): Promise<AgentCadence | undefined>;
  deleteAgentCadence(id: number): Promise<boolean>;
  
  // Agent Prompts
  getAgentPrompts(): Promise<AgentPrompt[]>;
  getAgentPrompt(id: number): Promise<AgentPrompt | undefined>;
  createAgentPrompt(prompt: InsertAgentPrompt): Promise<AgentPrompt>;
  updateAgentPrompt(id: number, prompt: Partial<InsertAgentPrompt>): Promise<AgentPrompt | undefined>;
  deleteAgentPrompt(id: number): Promise<boolean>;
  
  // Tracked Companies
  getTrackedCompanies(): Promise<TrackedCompany[]>;
  getTrackedCompany(id: number): Promise<TrackedCompany | undefined>;
  createTrackedCompany(company: InsertTrackedCompany): Promise<TrackedCompany>;
  updateTrackedCompany(id: number, company: Partial<InsertTrackedCompany>): Promise<TrackedCompany | undefined>;
  deleteTrackedCompany(id: number): Promise<boolean>;
  
  // Agent Spaces
  getAgentSpaces(): Promise<AgentSpace[]>;
  getAgentSpace(id: number): Promise<AgentSpace | undefined>;
  createAgentSpace(space: InsertAgentSpace): Promise<AgentSpace>;
  updateAgentSpace(id: number, space: Partial<InsertAgentSpace>): Promise<AgentSpace | undefined>;
  deleteAgentSpace(id: number): Promise<boolean>;
  
  // Competitor Content
  getCompetitorContent(competitorId: number, contentType?: string): Promise<CompetitorContent[]>;
  createCompetitorContent(content: InsertCompetitorContent): Promise<CompetitorContent>;
  deleteCompetitorContent(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // Competitors
  async getCompetitors(): Promise<Competitor[]> {
    return await db.select().from(schema.competitors).orderBy(schema.competitors.name);
  }

  async getCompetitor(id: number): Promise<Competitor | undefined> {
    const result = await db.select().from(schema.competitors).where(eq(schema.competitors.id, id)).limit(1);
    return result[0];
  }

  async createCompetitor(competitor: InsertCompetitor): Promise<Competitor> {
    const result = await db.insert(schema.competitors).values(competitor).returning();
    return result[0];
  }

  async updateCompetitor(id: number, competitor: Partial<InsertCompetitor>): Promise<Competitor | undefined> {
    const result = await db.update(schema.competitors)
      .set({ ...competitor, updatedAt: new Date() })
      .where(eq(schema.competitors.id, id))
      .returning();
    return result[0];
  }

  // Sentiment Analysis
  async getSentimentAnalysisByCompetitor(competitorId: number): Promise<SentimentAnalysis | undefined> {
    const result = await db.select()
      .from(schema.sentimentAnalysis)
      .where(eq(schema.sentimentAnalysis.competitorId, competitorId))
      .orderBy(desc(schema.sentimentAnalysis.createdAt))
      .limit(1);
    return result[0];
  }

  async createSentimentAnalysis(analysis: InsertSentimentAnalysis): Promise<SentimentAnalysis> {
    const result = await db.insert(schema.sentimentAnalysis).values(analysis).returning();
    return result[0];
  }

  // Startups
  async getStartups(): Promise<Startup[]> {
    return await db.select().from(schema.startups).orderBy(desc(schema.startups.score));
  }

  async getStartup(id: number): Promise<Startup | undefined> {
    const result = await db.select().from(schema.startups).where(eq(schema.startups.id, id)).limit(1);
    return result[0];
  }

  async getStartupsByCategory(category: string): Promise<Startup[]> {
    return await db.select()
      .from(schema.startups)
      .where(eq(schema.startups.category, category))
      .orderBy(desc(schema.startups.score));
  }

  async searchStartups(query: string): Promise<Startup[]> {
    const all = await db.select().from(schema.startups);
    const lowerQuery = query.toLowerCase();
    return all.filter(s => 
      s.name.toLowerCase().includes(lowerQuery) || 
      (s.description?.toLowerCase().includes(lowerQuery)) ||
      (s.website?.toLowerCase().includes(lowerQuery))
    );
  }

  async createStartup(startup: InsertStartup): Promise<Startup> {
    const result = await db.insert(schema.startups).values(startup).returning();
    return result[0];
  }

  async updateStartup(id: number, startup: Partial<InsertStartup>): Promise<Startup | undefined> {
    const result = await db.update(schema.startups)
      .set({ ...startup, updatedAt: new Date() })
      .where(eq(schema.startups.id, id))
      .returning();
    return result[0];
  }

  async deleteStartup(id: number): Promise<boolean> {
    const result = await db.delete(schema.startups).where(eq(schema.startups.id, id)).returning();
    return result.length > 0;
  }

  // Priorities
  async getPriorities(): Promise<Priority[]> {
    return await db.select().from(schema.priorities).orderBy(asc(schema.priorities.rank));
  }

  async getPriority(id: number): Promise<Priority | undefined> {
    const result = await db.select().from(schema.priorities).where(eq(schema.priorities.id, id)).limit(1);
    return result[0];
  }

  async createPriority(priority: InsertPriority): Promise<Priority> {
    const result = await db.insert(schema.priorities).values(priority).returning();
    return result[0];
  }

  async createPrioritiesBulk(priorities: InsertPriority[]): Promise<Priority[]> {
    if (priorities.length === 0) return [];
    const result = await db.insert(schema.priorities).values(priorities).returning();
    return result;
  }

  async updatePriority(id: number, priority: Partial<InsertPriority>): Promise<Priority | undefined> {
    const result = await db.update(schema.priorities)
      .set({ ...priority, updatedAt: new Date() })
      .where(eq(schema.priorities.id, id))
      .returning();
    return result[0];
  }

  async deletePriority(id: number): Promise<boolean> {
    const result = await db.delete(schema.priorities).where(eq(schema.priorities.id, id)).returning();
    return result.length > 0;
  }

  // Priority History
  async getPriorityHistory(priorityId: number): Promise<PriorityHistory[]> {
    return await db.select()
      .from(schema.priorityHistory)
      .where(eq(schema.priorityHistory.priorityId, priorityId))
      .orderBy(desc(schema.priorityHistory.recordedAt));
  }

  async createPriorityHistory(history: InsertPriorityHistory): Promise<PriorityHistory> {
    const result = await db.insert(schema.priorityHistory).values(history).returning();
    return result[0];
  }

  // Comments
  async getComments(entityType: string, entityId: number): Promise<Comment[]> {
    return await db.select()
      .from(schema.comments)
      .where(and(
        eq(schema.comments.entityType, entityType),
        eq(schema.comments.entityId, entityId)
      ))
      .orderBy(desc(schema.comments.createdAt));
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const result = await db.insert(schema.comments).values(comment).returning();
    return result[0];
  }

  async deleteComment(id: number): Promise<boolean> {
    const result = await db.delete(schema.comments).where(eq(schema.comments.id, id)).returning();
    return result.length > 0;
  }

  // Stakeholders
  async getStakeholders(priorityId: number): Promise<Stakeholder[]> {
    return await db.select()
      .from(schema.stakeholders)
      .where(eq(schema.stakeholders.priorityId, priorityId))
      .orderBy(schema.stakeholders.name);
  }

  async createStakeholder(stakeholder: InsertStakeholder): Promise<Stakeholder> {
    const result = await db.insert(schema.stakeholders).values(stakeholder).returning();
    return result[0];
  }

  async deleteStakeholder(id: number): Promise<boolean> {
    const result = await db.delete(schema.stakeholders).where(eq(schema.stakeholders.id, id)).returning();
    return result.length > 0;
  }

  // Notes
  async getNotes(entityType: string, entityId: number): Promise<Note[]> {
    return await db.select()
      .from(schema.notes)
      .where(and(
        eq(schema.notes.entityType, entityType),
        eq(schema.notes.entityId, entityId)
      ))
      .orderBy(desc(schema.notes.createdAt));
  }

  async createNote(note: InsertNote): Promise<Note> {
    const result = await db.insert(schema.notes).values(note).returning();
    return result[0];
  }

  async deleteNote(id: number): Promise<boolean> {
    const result = await db.delete(schema.notes).where(eq(schema.notes.id, id)).returning();
    return result.length > 0;
  }

  // Research Sessions
  async getResearchSessions(entityType: string, entityId: number): Promise<ResearchSession[]> {
    return await db.select()
      .from(schema.researchSessions)
      .where(and(
        eq(schema.researchSessions.entityType, entityType),
        eq(schema.researchSessions.entityId, entityId)
      ))
      .orderBy(desc(schema.researchSessions.createdAt));
  }

  async createResearchSession(session: InsertResearchSession): Promise<ResearchSession> {
    const result = await db.insert(schema.researchSessions).values(session).returning();
    return result[0];
  }

  async updateResearchSession(id: number, session: Partial<InsertResearchSession>): Promise<ResearchSession | undefined> {
    const result = await db.update(schema.researchSessions)
      .set(session)
      .where(eq(schema.researchSessions.id, id))
      .returning();
    return result[0];
  }

  // News Items
  async getNewsItems(category?: string, limit: number = 20): Promise<NewsItem[]> {
    if (category) {
      return await db.select()
        .from(schema.newsItems)
        .where(eq(schema.newsItems.category, category))
        .orderBy(desc(schema.newsItems.createdAt))
        .limit(limit);
    }
    return await db.select()
      .from(schema.newsItems)
      .orderBy(desc(schema.newsItems.createdAt))
      .limit(limit);
  }

  async createNewsItem(item: InsertNewsItem): Promise<NewsItem> {
    const result = await db.insert(schema.newsItems).values(item).returning();
    return result[0];
  }

  // Alerts
  async getRecentAlerts(limit: number = 10): Promise<Alert[]> {
    return await db.select()
      .from(schema.alerts)
      .orderBy(desc(schema.alerts.createdAt))
      .limit(limit);
  }

  async createAlert(alert: InsertAlert): Promise<Alert> {
    const result = await db.insert(schema.alerts).values(alert).returning();
    return result[0];
  }

  // Data Cloud Uploads
  async getRecentUploads(limit: number = 10): Promise<DataCloudUpload[]> {
    return await db.select()
      .from(schema.dataCloudUploads)
      .orderBy(desc(schema.dataCloudUploads.createdAt))
      .limit(limit);
  }

  async createUpload(upload: InsertDataCloudUpload): Promise<DataCloudUpload> {
    const result = await db.insert(schema.dataCloudUploads).values(upload).returning();
    return result[0];
  }

  // Sentiment Velocity
  async getSentimentVelocity(): Promise<SentimentVelocity[]> {
    return await db.select().from(schema.sentimentVelocity).orderBy(schema.sentimentVelocity.id);
  }

  async createSentimentVelocity(velocity: InsertSentimentVelocity): Promise<SentimentVelocity> {
    const result = await db.insert(schema.sentimentVelocity).values(velocity).returning();
    return result[0];
  }

  // Earnings Reports
  async getEarningsReports(limit: number = 20): Promise<EarningsReport[]> {
    return await db.select()
      .from(schema.earningsReports)
      .orderBy(desc(schema.earningsReports.createdAt))
      .limit(limit);
  }

  async getEarningsReportsByCompany(companyName: string): Promise<EarningsReport[]> {
    return await db.select()
      .from(schema.earningsReports)
      .where(eq(schema.earningsReports.companyName, companyName))
      .orderBy(desc(schema.earningsReports.createdAt));
  }

  async createEarningsReport(report: InsertEarningsReport): Promise<EarningsReport> {
    const result = await db.insert(schema.earningsReports).values(report).returning();
    return result[0];
  }

  async upsertEarningsReport(report: InsertEarningsReport): Promise<EarningsReport> {
    // Check if report exists for this company/quarter/fiscalYear
    const existing = await db.select()
      .from(schema.earningsReports)
      .where(and(
        eq(schema.earningsReports.companyName, report.companyName),
        eq(schema.earningsReports.quarter, report.quarter),
        eq(schema.earningsReports.fiscalYear, report.fiscalYear)
      ))
      .limit(1);
    
    if (existing.length > 0) {
      // Update existing report
      const result = await db.update(schema.earningsReports)
        .set(report)
        .where(eq(schema.earningsReports.id, existing[0].id))
        .returning();
      return result[0];
    } else {
      // Insert new report
      const result = await db.insert(schema.earningsReports).values(report).returning();
      return result[0];
    }
  }

  // Travel Locations
  async getTravelLocations(): Promise<TravelLocation[]> {
    return await db.select()
      .from(schema.travelLocations)
      .orderBy(desc(schema.travelLocations.createdAt));
  }

  async getTravelLocation(id: number): Promise<TravelLocation | undefined> {
    const result = await db.select()
      .from(schema.travelLocations)
      .where(eq(schema.travelLocations.id, id))
      .limit(1);
    return result[0];
  }

  async createTravelLocation(location: InsertTravelLocation): Promise<TravelLocation> {
    const result = await db.insert(schema.travelLocations).values(location).returning();
    return result[0];
  }

  async updateTravelLocation(id: number, location: Partial<InsertTravelLocation>): Promise<TravelLocation | undefined> {
    const result = await db.update(schema.travelLocations)
      .set({ ...location, updatedAt: new Date() })
      .where(eq(schema.travelLocations.id, id))
      .returning();
    return result[0];
  }

  async deleteTravelLocation(id: number): Promise<boolean> {
    const result = await db.delete(schema.travelLocations)
      .where(eq(schema.travelLocations.id, id))
      .returning();
    return result.length > 0;
  }

  // Important People
  async getImportantPeople(locationId?: number): Promise<ImportantPerson[]> {
    if (locationId) {
      return await db.select()
        .from(schema.importantPeople)
        .where(eq(schema.importantPeople.locationId, locationId))
        .orderBy(desc(schema.importantPeople.relevanceScore));
    }
    return await db.select()
      .from(schema.importantPeople)
      .orderBy(desc(schema.importantPeople.relevanceScore));
  }

  async getImportantPerson(id: number): Promise<ImportantPerson | undefined> {
    const result = await db.select()
      .from(schema.importantPeople)
      .where(eq(schema.importantPeople.id, id))
      .limit(1);
    return result[0];
  }

  async createImportantPerson(person: InsertImportantPerson): Promise<ImportantPerson> {
    const result = await db.insert(schema.importantPeople).values(person).returning();
    return result[0];
  }

  async createImportantPeopleBulk(people: InsertImportantPerson[]): Promise<ImportantPerson[]> {
    if (people.length === 0) return [];
    const result = await db.insert(schema.importantPeople).values(people).returning();
    return result;
  }

  async updateImportantPerson(id: number, person: Partial<InsertImportantPerson>): Promise<ImportantPerson | undefined> {
    const result = await db.update(schema.importantPeople)
      .set({ ...person, updatedAt: new Date() })
      .where(eq(schema.importantPeople.id, id))
      .returning();
    return result[0];
  }

  async deleteImportantPerson(id: number): Promise<boolean> {
    const result = await db.delete(schema.importantPeople)
      .where(eq(schema.importantPeople.id, id))
      .returning();
    return result.length > 0;
  }

  // Location Research
  async getLocationResearch(locationId: number): Promise<LocationResearch[]> {
    return await db.select()
      .from(schema.locationResearch)
      .where(eq(schema.locationResearch.locationId, locationId))
      .orderBy(desc(schema.locationResearch.createdAt));
  }

  async createLocationResearch(research: InsertLocationResearch): Promise<LocationResearch> {
    const result = await db.insert(schema.locationResearch).values(research).returning();
    return result[0];
  }

  async updateLocationResearch(id: number, research: Partial<InsertLocationResearch>): Promise<LocationResearch | undefined> {
    const result = await db.update(schema.locationResearch)
      .set(research)
      .where(eq(schema.locationResearch.id, id))
      .returning();
    return result[0];
  }

  // Agent Cadences
  async getAgentCadences(): Promise<AgentCadence[]> {
    return await db.select()
      .from(schema.agentCadences)
      .orderBy(schema.agentCadences.name);
  }

  async getAgentCadence(id: number): Promise<AgentCadence | undefined> {
    const result = await db.select()
      .from(schema.agentCadences)
      .where(eq(schema.agentCadences.id, id))
      .limit(1);
    return result[0];
  }

  async createAgentCadence(cadence: InsertAgentCadence): Promise<AgentCadence> {
    const result = await db.insert(schema.agentCadences).values(cadence).returning();
    return result[0];
  }

  async updateAgentCadence(id: number, cadence: Partial<InsertAgentCadence>): Promise<AgentCadence | undefined> {
    const result = await db.update(schema.agentCadences)
      .set({ ...cadence, updatedAt: new Date() })
      .where(eq(schema.agentCadences.id, id))
      .returning();
    return result[0];
  }

  async deleteAgentCadence(id: number): Promise<boolean> {
    const result = await db.delete(schema.agentCadences)
      .where(eq(schema.agentCadences.id, id))
      .returning();
    return result.length > 0;
  }

  // Agent Prompts
  async getAgentPrompts(): Promise<AgentPrompt[]> {
    return await db.select()
      .from(schema.agentPrompts)
      .orderBy(schema.agentPrompts.name);
  }

  async getAgentPrompt(id: number): Promise<AgentPrompt | undefined> {
    const result = await db.select()
      .from(schema.agentPrompts)
      .where(eq(schema.agentPrompts.id, id))
      .limit(1);
    return result[0];
  }

  async createAgentPrompt(prompt: InsertAgentPrompt): Promise<AgentPrompt> {
    const result = await db.insert(schema.agentPrompts).values(prompt).returning();
    return result[0];
  }

  async updateAgentPrompt(id: number, prompt: Partial<InsertAgentPrompt>): Promise<AgentPrompt | undefined> {
    const result = await db.update(schema.agentPrompts)
      .set({ ...prompt, updatedAt: new Date() })
      .where(eq(schema.agentPrompts.id, id))
      .returning();
    return result[0];
  }

  async deleteAgentPrompt(id: number): Promise<boolean> {
    const result = await db.delete(schema.agentPrompts)
      .where(eq(schema.agentPrompts.id, id))
      .returning();
    return result.length > 0;
  }

  // Tracked Companies
  async getTrackedCompanies(): Promise<TrackedCompany[]> {
    return await db.select()
      .from(schema.trackedCompanies)
      .orderBy(desc(schema.trackedCompanies.priority));
  }

  async getTrackedCompany(id: number): Promise<TrackedCompany | undefined> {
    const result = await db.select()
      .from(schema.trackedCompanies)
      .where(eq(schema.trackedCompanies.id, id))
      .limit(1);
    return result[0];
  }

  async createTrackedCompany(company: InsertTrackedCompany): Promise<TrackedCompany> {
    const result = await db.insert(schema.trackedCompanies).values(company).returning();
    return result[0];
  }

  async updateTrackedCompany(id: number, company: Partial<InsertTrackedCompany>): Promise<TrackedCompany | undefined> {
    const result = await db.update(schema.trackedCompanies)
      .set({ ...company, updatedAt: new Date() })
      .where(eq(schema.trackedCompanies.id, id))
      .returning();
    return result[0];
  }

  async deleteTrackedCompany(id: number): Promise<boolean> {
    const result = await db.delete(schema.trackedCompanies)
      .where(eq(schema.trackedCompanies.id, id))
      .returning();
    return result.length > 0;
  }

  // Agent Spaces
  async getAgentSpaces(): Promise<AgentSpace[]> {
    return await db.select()
      .from(schema.agentSpaces)
      .orderBy(desc(schema.agentSpaces.priority));
  }

  async getAgentSpace(id: number): Promise<AgentSpace | undefined> {
    const result = await db.select()
      .from(schema.agentSpaces)
      .where(eq(schema.agentSpaces.id, id))
      .limit(1);
    return result[0];
  }

  async createAgentSpace(space: InsertAgentSpace): Promise<AgentSpace> {
    const result = await db.insert(schema.agentSpaces).values(space).returning();
    return result[0];
  }

  async updateAgentSpace(id: number, space: Partial<InsertAgentSpace>): Promise<AgentSpace | undefined> {
    const result = await db.update(schema.agentSpaces)
      .set({ ...space, updatedAt: new Date() })
      .where(eq(schema.agentSpaces.id, id))
      .returning();
    return result[0];
  }

  async deleteAgentSpace(id: number): Promise<boolean> {
    const result = await db.delete(schema.agentSpaces)
      .where(eq(schema.agentSpaces.id, id))
      .returning();
    return result.length > 0;
  }

  // Competitor Content
  async getCompetitorContent(competitorId: number, contentType?: string): Promise<CompetitorContent[]> {
    if (contentType) {
      return await db.select()
        .from(schema.competitorContent)
        .where(and(
          eq(schema.competitorContent.competitorId, competitorId),
          eq(schema.competitorContent.contentType, contentType)
        ))
        .orderBy(desc(schema.competitorContent.createdAt));
    }
    return await db.select()
      .from(schema.competitorContent)
      .where(eq(schema.competitorContent.competitorId, competitorId))
      .orderBy(desc(schema.competitorContent.createdAt));
  }

  async createCompetitorContent(content: InsertCompetitorContent): Promise<CompetitorContent> {
    const result = await db.insert(schema.competitorContent).values(content).returning();
    return result[0];
  }

  async deleteCompetitorContent(id: number): Promise<boolean> {
    const result = await db.delete(schema.competitorContent)
      .where(eq(schema.competitorContent.id, id))
      .returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
