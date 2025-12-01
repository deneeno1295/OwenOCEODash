import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Competitors Table
export const competitors = pgTable("competitors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // "Enterprise" or "SMB"
  score: integer("score").notNull(),
  trend: text("trend").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCompetitorSchema = createInsertSchema(competitors).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCompetitor = z.infer<typeof insertCompetitorSchema>;
export type Competitor = typeof competitors.$inferSelect;

// Sentiment Analysis Table
export const sentimentAnalysis = pgTable("sentiment_analysis", {
  id: serial("id").primaryKey(),
  competitorId: integer("competitor_id").notNull(),
  summary: text("summary").notNull(),
  topics: jsonb("topics").notNull(), // Array of {topic, sentiment, score}
  sources: jsonb("sources").notNull(), // Array of source names
  aiConfidence: integer("ai_confidence").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSentimentAnalysisSchema = createInsertSchema(sentimentAnalysis).omit({
  id: true,
  createdAt: true,
});

export type InsertSentimentAnalysis = z.infer<typeof insertSentimentAnalysisSchema>;
export type SentimentAnalysis = typeof sentimentAnalysis.$inferSelect;

// Startups Table
export const startups = pgTable("startups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  stage: text("stage").notNull(),
  velocity: text("velocity").notNull(),
  score: integer("score").notNull(),
  focus: text("focus").notNull(),
  category: text("category").notNull().default("automated"), // "watchlist", "manual", "automated"
  description: text("description"),
  fundingAmount: text("funding_amount"),
  location: text("location"),
  website: text("website"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertStartupSchema = createInsertSchema(startups).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertStartup = z.infer<typeof insertStartupSchema>;
export type Startup = typeof startups.$inferSelect;

// Strategic Priorities Table
export const priorities = pgTable("priorities", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  status: text("status").notNull(),
  owner: text("owner").notNull(),
  rank: integer("rank").notNull().default(0),
  previousRank: integer("previous_rank"),
  trend: text("trend").notNull().default("even"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPrioritySchema = createInsertSchema(priorities).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPriority = z.infer<typeof insertPrioritySchema>;
export type Priority = typeof priorities.$inferSelect;

// Priority History Table
export const priorityHistory = pgTable("priority_history", {
  id: serial("id").primaryKey(),
  priorityId: integer("priority_id").notNull(),
  rank: integer("rank").notNull(),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
});

export const insertPriorityHistorySchema = createInsertSchema(priorityHistory).omit({
  id: true,
  recordedAt: true,
});

export type InsertPriorityHistory = z.infer<typeof insertPriorityHistorySchema>;
export type PriorityHistory = typeof priorityHistory.$inferSelect;

// Comments Table (for priorities and startups)
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  entityType: text("entity_type").notNull(), // "priority" or "startup"
  entityId: integer("entity_id").notNull(),
  content: text("content").notNull(),
  author: text("author").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
});

export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;

// Stakeholders Table
export const stakeholders = pgTable("stakeholders", {
  id: serial("id").primaryKey(),
  priorityId: integer("priority_id").notNull(),
  name: text("name").notNull(),
  role: text("role"),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertStakeholderSchema = createInsertSchema(stakeholders).omit({
  id: true,
  createdAt: true,
});

export type InsertStakeholder = z.infer<typeof insertStakeholderSchema>;
export type Stakeholder = typeof stakeholders.$inferSelect;

// Notes Table (for startups and priorities)
export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  entityType: text("entity_type").notNull(), // "priority" or "startup"
  entityId: integer("entity_id").notNull(),
  content: text("content").notNull(),
  noteType: text("note_type").notNull().default("general"), // "general", "slackbot", "transcript", "research"
  author: text("author"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertNoteSchema = createInsertSchema(notes).omit({
  id: true,
  createdAt: true,
});

export type InsertNote = z.infer<typeof insertNoteSchema>;
export type Note = typeof notes.$inferSelect;

// Research Sessions Table
export const researchSessions = pgTable("research_sessions", {
  id: serial("id").primaryKey(),
  entityType: text("entity_type").notNull(), // "priority" or "startup"
  entityId: integer("entity_id").notNull(),
  context: text("context"), // Context provided for research
  status: text("status").notNull().default("pending"), // "pending", "running", "completed", "failed"
  results: text("results"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const insertResearchSessionSchema = createInsertSchema(researchSessions).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export type InsertResearchSession = z.infer<typeof insertResearchSessionSchema>;
export type ResearchSession = typeof researchSessions.$inferSelect;

// News Feed Table (for dashboard)
export const newsItems = pgTable("news_items", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(), // "earnings", "tech_news", "salesforce"
  title: text("title").notNull(),
  summary: text("summary"),
  source: text("source"),
  url: text("url"),
  competitorId: integer("competitor_id"), // Optional link to competitor
  traction: integer("traction").default(0), // Engagement/traction score
  sentiment: text("sentiment"), // "positive", "negative", "neutral"
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertNewsItemSchema = createInsertSchema(newsItems).omit({
  id: true,
  createdAt: true,
});

export type InsertNewsItem = z.infer<typeof insertNewsItemSchema>;
export type NewsItem = typeof newsItems.$inferSelect;

// Critical Alerts Table
export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  severity: text("severity").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  createdAt: true,
});

export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type Alert = typeof alerts.$inferSelect;

// Data Cloud Uploads Table
export const dataCloudUploads = pgTable("data_cloud_uploads", {
  id: serial("id").primaryKey(),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  uploadType: text("upload_type").notNull(),
  status: text("status").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDataCloudUploadSchema = createInsertSchema(dataCloudUploads).omit({
  id: true,
  createdAt: true,
});

export type InsertDataCloudUpload = z.infer<typeof insertDataCloudUploadSchema>;
export type DataCloudUpload = typeof dataCloudUploads.$inferSelect;

// Sentiment Velocity Data
export const sentimentVelocity = pgTable("sentiment_velocity", {
  id: serial("id").primaryKey(),
  day: text("day").notNull(),
  value: integer("value").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSentimentVelocitySchema = createInsertSchema(sentimentVelocity).omit({
  id: true,
  createdAt: true,
});

export type InsertSentimentVelocity = z.infer<typeof insertSentimentVelocitySchema>;
export type SentimentVelocity = typeof sentimentVelocity.$inferSelect;

// Travel Locations Table
export const travelLocations = pgTable("travel_locations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // City, country, or conference name
  locationType: text("location_type").notNull(), // "city", "country", "conference"
  country: text("country"), // Parent country if city
  region: text("region"), // Geographic region
  travelDate: timestamp("travel_date"),
  notes: text("notes"),
  status: text("status").notNull().default("planned"), // "planned", "upcoming", "completed"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertTravelLocationSchema = createInsertSchema(travelLocations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertTravelLocation = z.infer<typeof insertTravelLocationSchema>;
export type TravelLocation = typeof travelLocations.$inferSelect;

// Important People Table
export const importantPeople = pgTable("important_people", {
  id: serial("id").primaryKey(),
  locationId: integer("location_id"), // Optional link to a location
  name: text("name").notNull(),
  title: text("title"),
  organization: text("organization"),
  personType: text("person_type"), // "government", "ceo", "cio", "investor", "executive", "other"
  country: text("country"),
  city: text("city"),
  relevanceScore: integer("relevance_score").default(0), // 0-100
  whyImportant: text("why_important"), // AI-generated context
  linkedinUrl: text("linkedin_url"),
  twitterUrl: text("twitter_url"),
  notes: text("notes"),
  source: text("source"), // "manual", "ai_research"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertImportantPersonSchema = createInsertSchema(importantPeople).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertImportantPerson = z.infer<typeof insertImportantPersonSchema>;
export type ImportantPerson = typeof importantPeople.$inferSelect;

// Location Research Sessions Table
export const locationResearch = pgTable("location_research", {
  id: serial("id").primaryKey(),
  locationId: integer("location_id").notNull(),
  query: text("query"), // What was searched
  status: text("status").notNull().default("pending"), // "pending", "running", "completed", "failed"
  results: text("results"), // AI-generated research results
  peopleFound: integer("people_found").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const insertLocationResearchSchema = createInsertSchema(locationResearch).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export type InsertLocationResearch = z.infer<typeof insertLocationResearchSchema>;
export type LocationResearch = typeof locationResearch.$inferSelect;

// Earnings Reports Table
export const earningsReports = pgTable("earnings_reports", {
  id: serial("id").primaryKey(),
  companyName: text("company_name").notNull(),
  quarter: text("quarter").notNull(), // e.g., "Q3 2024"
  fiscalYear: text("fiscal_year").notNull(),
  // Revenue - Actual vs Expected
  revenue: text("revenue"), // e.g., "$24.9B"
  revenueExpected: text("revenue_expected"), // e.g., "$24.5B"
  revenueBeatMiss: text("revenue_beat_miss"), // e.g., "+1.6%" or "-0.5%"
  revenueChange: text("revenue_change"), // e.g., "+11%" YoY
  // EPS - Actual vs Expected
  eps: text("eps"), // e.g., "$2.41"
  epsExpected: text("eps_expected"), // e.g., "$2.35"
  epsBeatMiss: text("eps_beat_miss"), // e.g., "+2.5%" or "-1.0%"
  epsChange: text("eps_change"), // e.g., "+15%" YoY
  // Overall Result
  beatMiss: text("beat_miss"), // "beat", "miss", "inline"
  beatMissDetails: text("beat_miss_details"), // "Beat on both revenue and EPS"
  // Guidance
  guidance: text("guidance"), // "raised", "maintained", "lowered"
  guidanceVsExpectations: text("guidance_vs_expectations"), // "above", "inline", "below"
  guidanceNotes: text("guidance_notes"),
  nextQuarterRevenue: text("next_quarter_revenue"), // Expected next quarter
  nextQuarterEps: text("next_quarter_eps"),
  fullYearRevenue: text("full_year_revenue"), // Full year guidance
  fullYearEps: text("full_year_eps"),
  // Market Reaction
  stockReaction: text("stock_reaction"), // e.g., "+5.2%"
  stockReactionTime: text("stock_reaction_time"), // e.g., "after hours", "next day"
  analystReaction: text("analyst_reaction"), // e.g., "mostly positive", "mixed", "cautious"
  priceTargetChanges: text("price_target_changes"), // e.g., "3 raised, 1 lowered"
  // Links
  transcriptUrl: text("transcript_url"),
  pressReleaseUrl: text("press_release_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEarningsReportSchema = createInsertSchema(earningsReports).omit({
  id: true,
  createdAt: true,
});

export type InsertEarningsReport = z.infer<typeof insertEarningsReportSchema>;
export type EarningsReport = typeof earningsReports.$inferSelect;

// Agent Settings - Cadences Table
export const agentCadences = pgTable("agent_cadences", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  schedule: text("schedule").notNull(), // e.g., "daily", "weekly", "hourly", "custom"
  cronExpression: text("cron_expression"), // for custom schedules
  isActive: integer("is_active").notNull().default(1), // 1 = active, 0 = inactive
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAgentCadenceSchema = createInsertSchema(agentCadences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAgentCadence = z.infer<typeof insertAgentCadenceSchema>;
export type AgentCadence = typeof agentCadences.$inferSelect;

// Agent Settings - Prompts Table
export const agentPrompts = pgTable("agent_prompts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  promptType: text("prompt_type").notNull(), // "research", "analysis", "summary", "discovery"
  content: text("content").notNull(), // The actual prompt template
  isActive: integer("is_active").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAgentPromptSchema = createInsertSchema(agentPrompts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAgentPrompt = z.infer<typeof insertAgentPromptSchema>;
export type AgentPrompt = typeof agentPrompts.$inferSelect;

// Agent Settings - Companies to Track Table
export const trackedCompanies = pgTable("tracked_companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  ticker: text("ticker"), // Stock ticker symbol
  industry: text("industry"),
  companyType: text("company_type"), // "competitor", "partner", "customer", "prospect"
  priority: integer("priority").notNull().default(0), // 0-100, higher = more important
  notes: text("notes"),
  isActive: integer("is_active").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertTrackedCompanySchema = createInsertSchema(trackedCompanies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertTrackedCompany = z.infer<typeof insertTrackedCompanySchema>;
export type TrackedCompany = typeof trackedCompanies.$inferSelect;

// Agent Settings - Spaces (Focus Areas) Table
export const agentSpaces = pgTable("agent_spaces", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  keywords: text("keywords"), // Comma-separated keywords for this space
  sources: text("sources"), // Comma-separated source URLs or types
  priority: integer("priority").notNull().default(0),
  isActive: integer("is_active").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAgentSpaceSchema = createInsertSchema(agentSpaces).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAgentSpace = z.infer<typeof insertAgentSpaceSchema>;
export type AgentSpace = typeof agentSpaces.$inferSelect;

// Competitor Earnings Content Table (analyst reports, transcripts, articles, reactions)
export const competitorContent = pgTable("competitor_content", {
  id: serial("id").primaryKey(),
  competitorId: integer("competitor_id").notNull(),
  contentType: text("content_type").notNull(), // "analyst_report", "transcript", "article", "x_reaction", "call_link"
  title: text("title").notNull(),
  source: text("source"), // e.g., "Goldman Sachs", "CNBC", "@elonmusk"
  summary: text("summary"),
  content: text("content"), // Full content or transcript
  url: text("url"),
  sentiment: text("sentiment"), // "positive", "negative", "neutral"
  engagementCount: integer("engagement_count").default(0), // likes, retweets for X
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCompetitorContentSchema = createInsertSchema(competitorContent).omit({
  id: true,
  createdAt: true,
});

export type InsertCompetitorContent = z.infer<typeof insertCompetitorContentSchema>;
export type CompetitorContent = typeof competitorContent.$inferSelect;
