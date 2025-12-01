import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ 
  connectionString: "postgresql://neondb_owner:npg_e8F3imwtsKCI@ep-shy-flower-a4so6e38-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require" 
});

const sql = `
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

-- Create tables
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

async function main() {
  try {
    console.log("Creating database tables...");
    await pool.query(sql);
    console.log("✅ All tables created successfully!");
  } catch (error) {
    console.error("Error creating tables:", error);
  } finally {
    await pool.end();
  }
}

main();

