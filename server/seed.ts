import { storage } from "./storage";

export async function seedDatabase() {
  try {
    // Check if data already exists
    const existingCompetitors = await storage.getCompetitors();
    if (existingCompetitors.length > 0) {
      console.log("Database already seeded, skipping...");
      return;
    }

    console.log("Seeding database...");

    // Seed Competitors
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

    for (const comp of competitors) {
      await storage.createCompetitor(comp);
    }

    // Seed Startups with categories
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

    for (const startup of startups) {
      await storage.createStartup(startup);
    }

    // Seed Priorities with ranks and trends
    const priorities = [
      { title: "Project Titan: AI Integration", status: "In Progress", owner: "Product", rank: 1, trend: "even", description: "Comprehensive AI integration roadmap for FY25" },
      { title: "Q3 Market Expansion (APAC)", status: "Planning", owner: "Sales", rank: 2, trend: "up", description: "Strategic expansion into APAC markets" },
      { title: "Legacy System Migration", status: "Blocked", owner: "Engineering", rank: 3, trend: "down", description: "Migrate legacy infrastructure to cloud-native" },
      { title: "Customer Retention Initiative", status: "In Progress", owner: "Success", rank: 4, trend: "up", description: "Reduce churn and improve NPS scores" },
      { title: "Developer Platform Launch", status: "Planning", owner: "Platform", rank: 5, trend: "even", description: "Launch new developer tools and APIs" },
    ];

    for (const priority of priorities) {
      await storage.createPriority(priority);
    }

    // Seed News Items for Dashboard
    const newsItems = [
      // Earnings/Reactions
      { category: "earnings", title: "Microsoft Q3 2024: Cloud revenue surpasses expectations", summary: "Azure and Microsoft 365 drive 20% YoY growth, beating analyst estimates. Competitive pressure noted from AWS.", source: "Bloomberg", traction: 8500, sentiment: "positive", url: "https://bloomberg.com" },
      { category: "earnings", title: "Salesforce reports solid Q2, raises full-year outlook", summary: "Revenue grew 11% to $8.6B. Einstein AI adoption accelerates across enterprise customers.", source: "Reuters", traction: 7200, sentiment: "positive", url: "https://reuters.com" },
      { category: "earnings", title: "Oracle cloud infrastructure sees 52% growth", summary: "OCI gaining ground in enterprise workloads. Multi-cloud strategy resonating with customers.", source: "CNBC", traction: 5400, sentiment: "positive", url: "https://cnbc.com" },
      { category: "earnings", title: "ServiceNow beats estimates, workflow automation demand strong", summary: "Platform revenue up 23%. GenAI features driving new customer acquisitions.", source: "WSJ", traction: 4800, sentiment: "positive", url: "https://wsj.com" },
      
      // Tech News
      { category: "tech_news", title: "OpenAI launches GPT-5 with enhanced reasoning capabilities", summary: "New model shows 40% improvement in complex task completion. Enterprise API pricing adjusted.", source: "TechCrunch", traction: 15000, sentiment: "neutral", url: "https://techcrunch.com" },
      { category: "tech_news", title: "Google announces Gemini 2.0 Ultra for enterprise", summary: "Multimodal AI capabilities now available for business applications. Direct competition with Azure AI.", source: "The Verge", traction: 12500, sentiment: "neutral", url: "https://theverge.com" },
      { category: "tech_news", title: "AWS launches new AI-powered data analytics service", summary: "Amazon QuickSight Q gets major upgrade with natural language query capabilities.", source: "VentureBeat", traction: 6800, sentiment: "neutral", url: "https://venturebeat.com" },
      { category: "tech_news", title: "Anthropic raises $2B in Series D funding", summary: "AI safety company valued at $15B. Enterprise adoption of Claude growing rapidly.", source: "Wired", traction: 9200, sentiment: "positive", url: "https://wired.com" },
      
      // Salesforce Announcements
      { category: "salesforce", title: "Salesforce announces Agentforce at Dreamforce 2024", summary: "New autonomous AI agents platform unveiled. Designed to handle customer service tasks independently.", source: "Salesforce Blog", traction: 25000, sentiment: "positive", url: "https://salesforce.com/blog" },
      { category: "salesforce", title: "Data Cloud gets real-time streaming capabilities", summary: "Zero-copy integration now supports 50+ data sources. Partners including Snowflake, Databricks.", source: "Salesforce News", traction: 8900, sentiment: "positive", url: "https://salesforce.com/news" },
      { category: "salesforce", title: "Einstein 1 Platform pricing restructured", summary: "New consumption-based model for AI features. Aimed at improving adoption among mid-market customers.", source: "CRM Magazine", traction: 4500, sentiment: "neutral", url: "https://crm-magazine.com" },
      { category: "salesforce", title: "Slack integration deepens with new AI features", summary: "Slack GPT now integrates directly with Sales Cloud workflows. Productivity gains estimated at 30%.", source: "Forbes", traction: 7600, sentiment: "positive", url: "https://forbes.com" },
    ];

    for (const item of newsItems) {
      await storage.createNewsItem(item);
    }

    // Seed Alerts
    const alerts = [
      { title: "Competitor Pricing Drop", description: "HubSpot announced 15% discount on Enterprise tier.", severity: "critical" },
      { title: "Sentiment Shift", description: "Negative sentiment spike in EU region regarding latency.", severity: "warning" },
      { title: "New Startup Detected", description: "AI-native CRM 'Nexus' raised Series A.", severity: "info" },
      { title: "Executive Movement", description: "Salesforce VP of Sales moved to Oracle.", severity: "info" },
    ];

    for (const alert of alerts) {
      await storage.createAlert(alert);
    }

    // Seed Sentiment Velocity
    const velocityData = [
      { day: "Mon", value: 40 },
      { day: "Tue", value: 45 },
      { day: "Wed", value: 42 },
      { day: "Thu", value: 55 },
      { day: "Fri", value: 50 },
      { day: "Sat", value: 65 },
      { day: "Sun", value: 75 },
    ];

    for (const velocity of velocityData) {
      await storage.createSentimentVelocity(velocity);
    }

    // Seed Sentiment Analysis for HubSpot (competitor id 1)
    await storage.createSentimentAnalysis({
      competitorId: 1,
      summary: "HubSpot is aggressively targeting the enterprise segment with new AI-driven Service Hub features. Sentiment analysis indicates strong adoption among mid-market users, but enterprise hesitation remains due to customization limits.",
      topics: JSON.stringify([
        { topic: "AI Features", sentiment: "Positive", score: 92 },
        { topic: "Pricing Model", sentiment: "Mixed", score: 45 },
        { topic: "Customer Support", sentiment: "Positive", score: 88 },
        { topic: "Customization", sentiment: "Negative", score: 32 },
      ]),
      sources: JSON.stringify(["G2 Crowd", "Twitter/X", "TechCrunch", "Reddit r/saas"]),
      aiConfidence: 94,
    });

    // Seed Earnings Reports with expectations vs actuals
    const earningsReports = [
      {
        companyName: "Microsoft",
        quarter: "Q1",
        fiscalYear: "FY2025",
        revenue: "$65.6B",
        revenueExpected: "$64.5B",
        revenueBeatMiss: "+1.7%",
        revenueChange: "+16%",
        eps: "$3.30",
        epsExpected: "$3.10",
        epsBeatMiss: "+6.5%",
        epsChange: "+10%",
        beatMiss: "beat",
        beatMissDetails: "Beat on both revenue and EPS. Cloud segment outperformed.",
        guidance: "raised",
        guidanceVsExpectations: "above",
        guidanceNotes: "Full-year cloud revenue guidance increased by $2B. Expecting AI services to drive 20%+ growth.",
        nextQuarterRevenue: "$68.0B",
        nextQuarterEps: "$3.45",
        fullYearRevenue: "$270B",
        fullYearEps: "$13.80",
        stockReaction: "+6.2%",
        stockReactionTime: "next day",
        analystReaction: "mostly positive",
        priceTargetChanges: "8 raised, 2 maintained",
        transcriptUrl: "https://microsoft.com/investor-relations/q1-2025-transcript",
        pressReleaseUrl: "https://microsoft.com/investor-relations/q1-2025-press"
      },
      {
        companyName: "Oracle",
        quarter: "Q2",
        fiscalYear: "FY2025",
        revenue: "$13.3B",
        revenueExpected: "$13.1B",
        revenueBeatMiss: "+1.5%",
        revenueChange: "+8%",
        eps: "$1.47",
        epsExpected: "$1.45",
        epsBeatMiss: "+1.4%",
        epsChange: "+12%",
        beatMiss: "beat",
        beatMissDetails: "Slight beat on revenue, EPS in line. OCI growth impressive.",
        guidance: "maintained",
        guidanceVsExpectations: "inline",
        guidanceNotes: "OCI growth expected to accelerate in H2. Database cloud ARR growing 25%.",
        nextQuarterRevenue: "$13.8B",
        nextQuarterEps: "$1.55",
        fullYearRevenue: "$55B",
        fullYearEps: "$6.20",
        stockReaction: "+3.1%",
        stockReactionTime: "after hours",
        analystReaction: "mixed",
        priceTargetChanges: "4 raised, 3 maintained, 1 lowered",
        transcriptUrl: "https://oracle.com/investor-relations/q2-2025-transcript",
        pressReleaseUrl: "https://oracle.com/investor-relations/q2-2025-press"
      },
      {
        companyName: "ServiceNow",
        quarter: "Q3",
        fiscalYear: "FY2024",
        revenue: "$2.79B",
        revenueExpected: "$2.72B",
        revenueBeatMiss: "+2.6%",
        revenueChange: "+23%",
        eps: "$3.72",
        epsExpected: "$3.45",
        epsBeatMiss: "+7.8%",
        epsChange: "+28%",
        beatMiss: "beat",
        beatMissDetails: "Strong beat on both metrics. GenAI driving record demand.",
        guidance: "raised",
        guidanceVsExpectations: "above",
        guidanceNotes: "GenAI features driving record pipeline; raised cRPO guidance by $500M. Pro+ subscriptions accelerating.",
        nextQuarterRevenue: "$2.95B",
        nextQuarterEps: "$3.95",
        fullYearRevenue: "$11.2B",
        fullYearEps: "$14.50",
        stockReaction: "+8.5%",
        stockReactionTime: "next day",
        analystReaction: "mostly positive",
        priceTargetChanges: "12 raised, 1 maintained",
        transcriptUrl: "https://servicenow.com/investor-relations/q3-2024-transcript",
        pressReleaseUrl: "https://servicenow.com/investor-relations/q3-2024-press"
      },
      {
        companyName: "Workday",
        quarter: "Q3",
        fiscalYear: "FY2025",
        revenue: "$2.16B",
        revenueExpected: "$2.17B",
        revenueBeatMiss: "-0.5%",
        revenueChange: "+15%",
        eps: "$1.89",
        epsExpected: "$1.75",
        epsBeatMiss: "+8.0%",
        epsChange: "+18%",
        beatMiss: "inline",
        beatMissDetails: "Revenue slightly below estimates, but EPS beat on cost discipline.",
        guidance: "maintained",
        guidanceVsExpectations: "inline",
        guidanceNotes: "Enterprise deals remain strong; cautious on mid-market spending. AI Copilot gaining traction.",
        nextQuarterRevenue: "$2.25B",
        nextQuarterEps: "$1.95",
        fullYearRevenue: "$8.5B",
        fullYearEps: "$7.60",
        stockReaction: "-2.3%",
        stockReactionTime: "after hours",
        analystReaction: "cautious",
        priceTargetChanges: "2 raised, 5 maintained, 3 lowered",
        transcriptUrl: "https://workday.com/investor-relations/q3-2025-transcript",
        pressReleaseUrl: "https://workday.com/investor-relations/q3-2025-press"
      },
      {
        companyName: "SAP",
        quarter: "Q3",
        fiscalYear: "FY2024",
        revenue: "€8.5B",
        revenueExpected: "€8.3B",
        revenueBeatMiss: "+2.4%",
        revenueChange: "+9%",
        eps: "€1.23",
        epsExpected: "€1.15",
        epsBeatMiss: "+7.0%",
        epsChange: "+15%",
        beatMiss: "beat",
        beatMissDetails: "Beat on both metrics. S/4HANA cloud adoption exceeding targets.",
        guidance: "raised",
        guidanceVsExpectations: "above",
        guidanceNotes: "Cloud backlog up 29%; S/4HANA migration accelerating. AI initiatives gaining momentum in enterprise.",
        nextQuarterRevenue: "€8.8B",
        nextQuarterEps: "€1.30",
        fullYearRevenue: "€34B",
        fullYearEps: "€5.00",
        stockReaction: "+4.8%",
        stockReactionTime: "next day",
        analystReaction: "mostly positive",
        priceTargetChanges: "7 raised, 2 maintained",
        transcriptUrl: "https://sap.com/investor-relations/q3-2024-transcript",
        pressReleaseUrl: "https://sap.com/investor-relations/q3-2024-press"
      },
      {
        companyName: "Salesforce",
        quarter: "Q3",
        fiscalYear: "FY2025",
        revenue: "$9.44B",
        revenueExpected: "$9.35B",
        revenueBeatMiss: "+1.0%",
        revenueChange: "+8%",
        eps: "$2.41",
        epsExpected: "$2.35",
        epsBeatMiss: "+2.6%",
        epsChange: "+14%",
        beatMiss: "beat",
        beatMissDetails: "Beat on both revenue and EPS. Data Cloud and Einstein AI driving growth.",
        guidance: "raised",
        guidanceVsExpectations: "above",
        guidanceNotes: "Agentforce launch exceeded expectations; raised full-year revenue guidance. Data Cloud ARR growing 130%+ YoY.",
        nextQuarterRevenue: "$9.90B",
        nextQuarterEps: "$2.55",
        fullYearRevenue: "$37.8B",
        fullYearEps: "$9.95",
        stockReaction: "+11.0%",
        stockReactionTime: "next day",
        analystReaction: "very positive",
        priceTargetChanges: "15 raised, 3 maintained",
        transcriptUrl: "https://salesforce.com/investor-relations/q3-2025-transcript",
        pressReleaseUrl: "https://salesforce.com/investor-relations/q3-2025-press"
      },
      // Q4 FY2025 - LIVE TODAY - Placeholder for real-time updates
      {
        companyName: "Salesforce",
        quarter: "Q4",
        fiscalYear: "FY2025",
        revenue: null,
        revenueExpected: "$9.90B",
        revenueBeatMiss: null,
        revenueChange: null,
        eps: null,
        epsExpected: "$2.55",
        epsBeatMiss: null,
        epsChange: null,
        beatMiss: null,
        beatMissDetails: "Earnings reporting TODAY - Click to refresh for live updates",
        guidance: null,
        guidanceVsExpectations: null,
        guidanceNotes: "Consensus expects continued momentum from Agentforce, Data Cloud growth, and AI initiatives. Watch for FY26 guidance.",
        nextQuarterRevenue: null,
        nextQuarterEps: null,
        fullYearRevenue: null,
        fullYearEps: null,
        stockReaction: null,
        stockReactionTime: null,
        analystReaction: "expectations high",
        priceTargetChanges: "Watching for updates",
        transcriptUrl: null,
        pressReleaseUrl: null
      },
    ];

    for (const report of earningsReports) {
      await storage.createEarningsReport(report);
    }

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}
