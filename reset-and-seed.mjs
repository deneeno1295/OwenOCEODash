#!/usr/bin/env node
/**
 * Reset and Seed Database Script
 * Run with: node reset-and-seed.mjs
 */

import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

// Use environment variable or fallback to the existing connection string
const connectionString = process.env.DATABASE_URL || 
  "postgresql://neondb_owner:npg_e8F3imwtsKCI@ep-shy-flower-a4so6e38-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require";

const pool = new Pool({ connectionString });

// ============================================
// SCHEMA: Drop and recreate all tables
// ============================================
const schemaSql = `
-- Drop existing tables to ensure clean schema
DROP TABLE IF EXISTS competitor_content CASCADE;
DROP TABLE IF EXISTS agent_spaces CASCADE;
DROP TABLE IF EXISTS tracked_companies CASCADE;
DROP TABLE IF EXISTS agent_prompts CASCADE;
DROP TABLE IF EXISTS agent_cadences CASCADE;
DROP TABLE IF EXISTS earnings_reports CASCADE;
DROP TABLE IF EXISTS location_research CASCADE;
DROP TABLE IF EXISTS important_people CASCADE;
DROP TABLE IF EXISTS travel_locations CASCADE;
DROP TABLE IF EXISTS sentiment_velocity CASCADE;
DROP TABLE IF EXISTS data_cloud_uploads CASCADE;
DROP TABLE IF EXISTS alerts CASCADE;
DROP TABLE IF EXISTS news_items CASCADE;
DROP TABLE IF EXISTS research_sessions CASCADE;
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS stakeholders CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS priority_history CASCADE;
DROP TABLE IF EXISTS priorities CASCADE;
DROP TABLE IF EXISTS startups CASCADE;
DROP TABLE IF EXISTS sentiment_analysis CASCADE;
DROP TABLE IF EXISTS competitors CASCADE;

-- Create all tables
CREATE TABLE competitors (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  score INTEGER NOT NULL,
  trend TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE sentiment_analysis (
  id SERIAL PRIMARY KEY,
  competitor_id INTEGER NOT NULL,
  summary TEXT NOT NULL,
  topics JSONB NOT NULL,
  sources JSONB NOT NULL,
  ai_confidence INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE startups (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  stage TEXT NOT NULL,
  velocity TEXT NOT NULL,
  score INTEGER NOT NULL,
  focus TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'automated',
  description TEXT,
  funding_amount TEXT,
  location TEXT,
  website TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE priorities (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT NOT NULL,
  owner TEXT NOT NULL,
  rank INTEGER NOT NULL DEFAULT 0,
  previous_rank INTEGER,
  trend TEXT NOT NULL DEFAULT 'even',
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE priority_history (
  id SERIAL PRIMARY KEY,
  priority_id INTEGER NOT NULL,
  rank INTEGER NOT NULL,
  recorded_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE stakeholders (
  id SERIAL PRIMARY KEY,
  priority_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  role TEXT,
  email TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE notes (
  id SERIAL PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  note_type TEXT NOT NULL DEFAULT 'general',
  author TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE research_sessions (
  id SERIAL PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id INTEGER NOT NULL,
  context TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  results TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMP
);

CREATE TABLE news_items (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  source TEXT,
  url TEXT,
  competitor_id INTEGER,
  traction INTEGER DEFAULT 0,
  sentiment TEXT,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE alerts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE data_cloud_uploads (
  id SERIAL PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  upload_type TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE sentiment_velocity (
  id SERIAL PRIMARY KEY,
  day TEXT NOT NULL,
  value INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE travel_locations (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  location_type TEXT NOT NULL,
  country TEXT,
  region TEXT,
  travel_date TIMESTAMP,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'planned',
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE important_people (
  id SERIAL PRIMARY KEY,
  location_id INTEGER,
  name TEXT NOT NULL,
  title TEXT,
  organization TEXT,
  person_type TEXT,
  country TEXT,
  city TEXT,
  relevance_score INTEGER DEFAULT 0,
  why_important TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  notes TEXT,
  source TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE location_research (
  id SERIAL PRIMARY KEY,
  location_id INTEGER NOT NULL,
  query TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  results TEXT,
  people_found INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMP
);

CREATE TABLE earnings_reports (
  id SERIAL PRIMARY KEY,
  company_name TEXT NOT NULL,
  quarter TEXT NOT NULL,
  fiscal_year TEXT NOT NULL,
  revenue TEXT,
  revenue_expected TEXT,
  revenue_beat_miss TEXT,
  revenue_change TEXT,
  eps TEXT,
  eps_expected TEXT,
  eps_beat_miss TEXT,
  eps_change TEXT,
  beat_miss TEXT,
  beat_miss_details TEXT,
  guidance TEXT,
  guidance_vs_expectations TEXT,
  guidance_notes TEXT,
  next_quarter_revenue TEXT,
  next_quarter_eps TEXT,
  full_year_revenue TEXT,
  full_year_eps TEXT,
  stock_reaction TEXT,
  stock_reaction_time TEXT,
  analyst_reaction TEXT,
  price_target_changes TEXT,
  transcript_url TEXT,
  press_release_url TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE agent_cadences (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  schedule TEXT NOT NULL,
  cron_expression TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE agent_prompts (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  prompt_type TEXT NOT NULL,
  content TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE tracked_companies (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  ticker TEXT,
  industry TEXT,
  company_type TEXT,
  priority INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE agent_spaces (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  keywords TEXT,
  sources TEXT,
  priority INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE competitor_content (
  id SERIAL PRIMARY KEY,
  competitor_id INTEGER NOT NULL,
  content_type TEXT NOT NULL,
  title TEXT NOT NULL,
  source TEXT,
  summary TEXT,
  content TEXT,
  url TEXT,
  sentiment TEXT,
  engagement_count INTEGER DEFAULT 0,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
`;

// ============================================
// SEED DATA
// ============================================

const competitors = [
  { name: "Microsoft", type: "Enterprise", score: 85, trend: "+1.8%" },
  { name: "Oracle", type: "Enterprise", score: 78, trend: "+0.9%" },
  { name: "ServiceNow", type: "Enterprise", score: 82, trend: "+2.1%" },
  { name: "Workday", type: "Enterprise", score: 76, trend: "-0.5%" },
  { name: "SAP", type: "Enterprise", score: 80, trend: "+0.7%" },
  { name: "HubSpot", type: "Enterprise", score: 82, trend: "+1.2%" },
  { name: "Salesforce", type: "Enterprise", score: 88, trend: "+0.5%" },
  { name: "Zoho", type: "SMB", score: 71, trend: "-2.3%" },
];

const startups = [
  { name: "AutoAgent", stage: "Series A", velocity: "Extreme", score: 98, focus: "Autonomous Sales", category: "watchlist", description: "AI-powered sales automation platform", fundingAmount: "$25M", location: "San Francisco, CA", website: "https://autoagent.ai" },
  { name: "Nexus AI", stage: "Series A", velocity: "High", score: 94, focus: "Generative CRM", category: "watchlist", description: "Next-gen CRM with generative AI capabilities", fundingAmount: "$18M", location: "New York, NY", website: "https://nexusai.com" },
  { name: "Pulse", stage: "Seed", velocity: "High", score: 88, focus: "Employee Sentiment", category: "watchlist", description: "Real-time employee sentiment analysis platform", fundingAmount: "$5M", location: "Austin, TX", website: "https://pulse.io" },
  { name: "DataFlow", stage: "Seed", velocity: "Medium", score: 82, focus: "Data Pipelines", category: "manual", description: "Modern data pipeline infrastructure", fundingAmount: "$8M", location: "Seattle, WA", website: "https://dataflow.dev" },
  { name: "Stratosphere", stage: "Series B", velocity: "Low", score: 76, focus: "Cloud Security", category: "manual", description: "Enterprise cloud security platform", fundingAmount: "$45M", location: "Boston, MA", website: "https://stratosphere.io" },
  { name: "NeuralOps", stage: "Series A", velocity: "High", score: 91, focus: "MLOps", category: "automated", description: "Automated ML operations platform", fundingAmount: "$22M", location: "Palo Alto, CA", website: "https://neuralops.ai" },
  { name: "EdgeCore", stage: "Seed", velocity: "Medium", score: 79, focus: "Edge Computing", category: "automated", description: "Edge computing infrastructure", fundingAmount: "$6M", location: "Denver, CO", website: "https://edgecore.tech" },
  { name: "QuantumFlow", stage: "Series A", velocity: "Extreme", score: 96, focus: "Quantum Computing", category: "automated", description: "Quantum computing applications", fundingAmount: "$30M", location: "Chicago, IL", website: "https://quantumflow.tech" },
];

const priorities = [
  { title: "Project Titan: AI Integration", status: "In Progress", owner: "Product", rank: 1, trend: "even", description: "Comprehensive AI integration roadmap for FY25" },
  { title: "Q3 Market Expansion (APAC)", status: "Planning", owner: "Sales", rank: 2, trend: "up", description: "Strategic expansion into APAC markets" },
  { title: "Legacy System Migration", status: "Blocked", owner: "Engineering", rank: 3, trend: "down", description: "Migrate legacy infrastructure to cloud-native" },
  { title: "Customer Retention Initiative", status: "In Progress", owner: "Success", rank: 4, trend: "up", description: "Reduce churn and improve NPS scores" },
  { title: "Developer Platform Launch", status: "Planning", owner: "Platform", rank: 5, trend: "even", description: "Launch new developer tools and APIs" },
];

const newsItems = [
  { category: "earnings", title: "Microsoft Q3 2024: Cloud revenue surpasses expectations", summary: "Azure and Microsoft 365 drive 20% YoY growth, beating analyst estimates.", source: "Bloomberg", traction: 8500, sentiment: "positive", url: "https://bloomberg.com" },
  { category: "earnings", title: "Salesforce reports solid Q2, raises full-year outlook", summary: "Revenue grew 11% to $8.6B. Einstein AI adoption accelerates.", source: "Reuters", traction: 7200, sentiment: "positive", url: "https://reuters.com" },
  { category: "earnings", title: "Oracle cloud infrastructure sees 52% growth", summary: "OCI gaining ground in enterprise workloads. Multi-cloud strategy resonating.", source: "CNBC", traction: 5400, sentiment: "positive", url: "https://cnbc.com" },
  { category: "tech_news", title: "OpenAI launches GPT-5 with enhanced reasoning capabilities", summary: "New model shows 40% improvement in complex task completion.", source: "TechCrunch", traction: 15000, sentiment: "neutral", url: "https://techcrunch.com" },
  { category: "tech_news", title: "Google announces Gemini 2.0 Ultra for enterprise", summary: "Multimodal AI capabilities now available for business applications.", source: "The Verge", traction: 12500, sentiment: "neutral", url: "https://theverge.com" },
  { category: "tech_news", title: "AWS launches new AI-powered data analytics service", summary: "Amazon QuickSight Q gets major upgrade with natural language query.", source: "VentureBeat", traction: 6800, sentiment: "neutral", url: "https://venturebeat.com" },
  { category: "salesforce", title: "Salesforce announces Agentforce at Dreamforce 2024", summary: "New autonomous AI agents platform unveiled.", source: "Salesforce Blog", traction: 25000, sentiment: "positive", url: "https://salesforce.com/blog" },
  { category: "salesforce", title: "Data Cloud gets real-time streaming capabilities", summary: "Zero-copy integration now supports 50+ data sources.", source: "Salesforce News", traction: 8900, sentiment: "positive", url: "https://salesforce.com/news" },
  { category: "salesforce", title: "Einstein 1 Platform pricing restructured", summary: "New consumption-based model for AI features.", source: "CRM Magazine", traction: 4500, sentiment: "neutral", url: "https://crm-magazine.com" },
];

const alerts = [
  { title: "Competitor Pricing Drop", description: "HubSpot announced 15% discount on Enterprise tier.", severity: "critical" },
  { title: "Sentiment Shift", description: "Negative sentiment spike in EU region regarding latency.", severity: "warning" },
  { title: "New Startup Detected", description: "AI-native CRM 'Nexus' raised Series A.", severity: "info" },
  { title: "Executive Movement", description: "Salesforce VP of Sales moved to Oracle.", severity: "info" },
];

const sentimentVelocity = [
  { day: "Mon", value: 40 },
  { day: "Tue", value: 45 },
  { day: "Wed", value: 42 },
  { day: "Thu", value: 55 },
  { day: "Fri", value: 50 },
  { day: "Sat", value: 65 },
  { day: "Sun", value: 75 },
];

const earningsReports = [
  {
    companyName: "Microsoft", quarter: "Q1", fiscalYear: "FY2025",
    revenue: "$65.6B", revenueExpected: "$64.5B", revenueBeatMiss: "+1.7%", revenueChange: "+16%",
    eps: "$3.30", epsExpected: "$3.10", epsBeatMiss: "+6.5%", epsChange: "+10%",
    beatMiss: "beat", beatMissDetails: "Beat on both revenue and EPS. Cloud segment outperformed.",
    guidance: "raised", guidanceVsExpectations: "above",
    guidanceNotes: "Full-year cloud revenue guidance increased by $2B.",
    stockReaction: "+6.2%", stockReactionTime: "next day",
    analystReaction: "mostly positive", priceTargetChanges: "8 raised, 2 maintained"
  },
  {
    companyName: "Oracle", quarter: "Q2", fiscalYear: "FY2025",
    revenue: "$13.3B", revenueExpected: "$13.1B", revenueBeatMiss: "+1.5%", revenueChange: "+8%",
    eps: "$1.47", epsExpected: "$1.45", epsBeatMiss: "+1.4%", epsChange: "+12%",
    beatMiss: "beat", beatMissDetails: "Slight beat on revenue, EPS in line. OCI growth impressive.",
    guidance: "maintained", guidanceVsExpectations: "inline",
    guidanceNotes: "OCI growth expected to accelerate in H2.",
    stockReaction: "+3.1%", stockReactionTime: "after hours",
    analystReaction: "mixed", priceTargetChanges: "4 raised, 3 maintained, 1 lowered"
  },
  {
    companyName: "Salesforce", quarter: "Q3", fiscalYear: "FY2025",
    revenue: "$9.44B", revenueExpected: "$9.35B", revenueBeatMiss: "+1.0%", revenueChange: "+8%",
    eps: "$2.41", epsExpected: "$2.35", epsBeatMiss: "+2.6%", epsChange: "+14%",
    beatMiss: "beat", beatMissDetails: "Beat on both revenue and EPS. Data Cloud and Einstein AI driving growth.",
    guidance: "raised", guidanceVsExpectations: "above",
    guidanceNotes: "Agentforce launch exceeded expectations; Data Cloud ARR growing 130%+ YoY.",
    stockReaction: "+11.0%", stockReactionTime: "next day",
    analystReaction: "very positive", priceTargetChanges: "15 raised, 3 maintained"
  },
  {
    companyName: "ServiceNow", quarter: "Q3", fiscalYear: "FY2024",
    revenue: "$2.79B", revenueExpected: "$2.72B", revenueBeatMiss: "+2.6%", revenueChange: "+23%",
    eps: "$3.72", epsExpected: "$3.45", epsBeatMiss: "+7.8%", epsChange: "+28%",
    beatMiss: "beat", beatMissDetails: "Strong beat on both metrics. GenAI driving record demand.",
    guidance: "raised", guidanceVsExpectations: "above",
    guidanceNotes: "GenAI features driving record pipeline; raised cRPO guidance by $500M.",
    stockReaction: "+8.5%", stockReactionTime: "next day",
    analystReaction: "mostly positive", priceTargetChanges: "12 raised, 1 maintained"
  },
];

const trackedCompanies = [
  { name: "Microsoft", ticker: "MSFT", industry: "Technology", companyType: "competitor", priority: 1, isActive: 1 },
  { name: "Oracle", ticker: "ORCL", industry: "Technology", companyType: "competitor", priority: 2, isActive: 1 },
  { name: "ServiceNow", ticker: "NOW", industry: "Technology", companyType: "competitor", priority: 3, isActive: 1 },
  { name: "Workday", ticker: "WDAY", industry: "Technology", companyType: "competitor", priority: 4, isActive: 1 },
  { name: "SAP", ticker: "SAP", industry: "Technology", companyType: "competitor", priority: 5, isActive: 1 },
  { name: "Salesforce", ticker: "CRM", industry: "Technology", companyType: "own", priority: 0, isActive: 1 },
];

// ============================================
// MAIN EXECUTION
// ============================================

async function main() {
  console.log("🔄 Resetting and seeding database...\n");

  try {
    // Step 1: Create schema
    console.log("📦 Creating database schema...");
    await pool.query(schemaSql);
    console.log("✅ Schema created!\n");

    // Step 2: Seed competitors
    console.log("🏢 Seeding competitors...");
    for (const c of competitors) {
      await pool.query(
        "INSERT INTO competitors (name, type, score, trend) VALUES ($1, $2, $3, $4)",
        [c.name, c.type, c.score, c.trend]
      );
    }
    console.log(`   Added ${competitors.length} competitors`);

    // Step 3: Seed startups
    console.log("🚀 Seeding startups...");
    for (const s of startups) {
      await pool.query(
        "INSERT INTO startups (name, stage, velocity, score, focus, category, description, funding_amount, location, website) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)",
        [s.name, s.stage, s.velocity, s.score, s.focus, s.category, s.description, s.fundingAmount, s.location, s.website]
      );
    }
    console.log(`   Added ${startups.length} startups`);

    // Step 4: Seed priorities
    console.log("📋 Seeding priorities...");
    for (const p of priorities) {
      await pool.query(
        "INSERT INTO priorities (title, status, owner, rank, trend, description) VALUES ($1, $2, $3, $4, $5, $6)",
        [p.title, p.status, p.owner, p.rank, p.trend, p.description]
      );
    }
    console.log(`   Added ${priorities.length} priorities`);

    // Step 5: Seed news items
    console.log("📰 Seeding news items...");
    for (const n of newsItems) {
      await pool.query(
        "INSERT INTO news_items (category, title, summary, source, traction, sentiment, url) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        [n.category, n.title, n.summary, n.source, n.traction, n.sentiment, n.url]
      );
    }
    console.log(`   Added ${newsItems.length} news items`);

    // Step 6: Seed alerts
    console.log("🚨 Seeding alerts...");
    for (const a of alerts) {
      await pool.query(
        "INSERT INTO alerts (title, description, severity) VALUES ($1, $2, $3)",
        [a.title, a.description, a.severity]
      );
    }
    console.log(`   Added ${alerts.length} alerts`);

    // Step 7: Seed sentiment velocity
    console.log("📊 Seeding sentiment velocity...");
    for (const sv of sentimentVelocity) {
      await pool.query(
        "INSERT INTO sentiment_velocity (day, value) VALUES ($1, $2)",
        [sv.day, sv.value]
      );
    }
    console.log(`   Added ${sentimentVelocity.length} velocity data points`);

    // Step 8: Seed earnings reports
    console.log("💰 Seeding earnings reports...");
    for (const e of earningsReports) {
      await pool.query(
        `INSERT INTO earnings_reports (company_name, quarter, fiscal_year, revenue, revenue_expected, revenue_beat_miss, revenue_change, eps, eps_expected, eps_beat_miss, eps_change, beat_miss, beat_miss_details, guidance, guidance_vs_expectations, guidance_notes, stock_reaction, stock_reaction_time, analyst_reaction, price_target_changes) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)`,
        [e.companyName, e.quarter, e.fiscalYear, e.revenue, e.revenueExpected, e.revenueBeatMiss, e.revenueChange, e.eps, e.epsExpected, e.epsBeatMiss, e.epsChange, e.beatMiss, e.beatMissDetails, e.guidance, e.guidanceVsExpectations, e.guidanceNotes, e.stockReaction, e.stockReactionTime, e.analystReaction, e.priceTargetChanges]
      );
    }
    console.log(`   Added ${earningsReports.length} earnings reports`);

    // Step 9: Seed tracked companies
    console.log("🎯 Seeding tracked companies...");
    for (const tc of trackedCompanies) {
      await pool.query(
        "INSERT INTO tracked_companies (name, ticker, industry, company_type, priority, is_active) VALUES ($1, $2, $3, $4, $5, $6)",
        [tc.name, tc.ticker, tc.industry, tc.companyType, tc.priority, tc.isActive]
      );
    }
    console.log(`   Added ${trackedCompanies.length} tracked companies`);

    // Step 10: Seed sentiment analysis for HubSpot
    console.log("🧠 Seeding sentiment analysis...");
    await pool.query(
      `INSERT INTO sentiment_analysis (competitor_id, summary, topics, sources, ai_confidence) VALUES ($1, $2, $3, $4, $5)`,
      [
        6, // HubSpot is id 6
        "HubSpot is aggressively targeting the enterprise segment with new AI-driven Service Hub features. Sentiment analysis indicates strong adoption among mid-market users, but enterprise hesitation remains due to customization limits.",
        JSON.stringify([
          { topic: "AI Features", sentiment: "Positive", score: 92 },
          { topic: "Pricing Model", sentiment: "Mixed", score: 45 },
          { topic: "Customer Support", sentiment: "Positive", score: 88 },
          { topic: "Customization", sentiment: "Negative", score: 32 },
        ]),
        JSON.stringify(["G2 Crowd", "Twitter/X", "TechCrunch", "Reddit r/saas"]),
        94
      ]
    );
    console.log("   Added sentiment analysis for HubSpot");

    console.log("\n✨ Database reset and seeded successfully!");
    console.log("   You can now start your dev server with: npm run dev\n");

  } catch (error) {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();

