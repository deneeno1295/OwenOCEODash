import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertCompetitorSchema,
  insertSentimentAnalysisSchema,
  insertStartupSchema,
  insertPrioritySchema,
  insertPriorityHistorySchema,
  insertCommentSchema,
  insertStakeholderSchema,
  insertNoteSchema,
  insertResearchSessionSchema,
  insertNewsItemSchema,
  insertAlertSchema,
  insertDataCloudUploadSchema,
  insertSentimentVelocitySchema,
  insertEarningsReportSchema,
  insertTravelLocationSchema,
  insertImportantPersonSchema,
  insertLocationResearchSchema,
  insertCompetitorContentSchema
} from "@shared/schema";
import { z } from "zod";
import OpenAI from "openai";
import { requireAuth } from "./auth";

function apiAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  if (process.env.SALESFORCE_CLIENT_ID && process.env.SALESFORCE_CLIENT_SECRET) {
    return requireAuth(req, res, next);
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.use("/api", apiAuthMiddleware);
  // Competitors Routes
  app.get("/api/competitors", async (req, res) => {
    try {
      const competitors = await storage.getCompetitors();
      res.json(competitors);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch competitors" });
    }
  });

  app.get("/api/competitors/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const competitor = await storage.getCompetitor(id);
      if (!competitor) {
        return res.status(404).json({ error: "Competitor not found" });
      }
      res.json(competitor);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch competitor" });
    }
  });

  app.post("/api/competitors", async (req, res) => {
    try {
      const data = insertCompetitorSchema.parse(req.body);
      const competitor = await storage.createCompetitor(data);
      res.status(201).json(competitor);
    } catch (error) {
      res.status(400).json({ error: "Invalid competitor data" });
    }
  });

  // Competitor Content Routes
  app.get("/api/competitors/:id/content", async (req, res) => {
    try {
      const competitorId = parseInt(req.params.id);
      const contentType = req.query.type as string | undefined;
      const content = await storage.getCompetitorContent(competitorId, contentType);
      res.json(content);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch competitor content" });
    }
  });

  app.post("/api/competitors/:id/content", async (req, res) => {
    try {
      const competitorId = parseInt(req.params.id);
      const data = insertCompetitorContentSchema.parse({
        ...req.body,
        competitorId
      });
      const content = await storage.createCompetitorContent(data);
      res.status(201).json(content);
    } catch (error) {
      res.status(400).json({ error: "Invalid content data" });
    }
  });

  app.delete("/api/competitors/:competitorId/content/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteCompetitorContent(id);
      if (!deleted) {
        return res.status(404).json({ error: "Content not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete content" });
    }
  });

  // Sentiment Analysis Routes
  app.get("/api/sentiment/:competitorId", async (req, res) => {
    try {
      const competitorId = parseInt(req.params.competitorId);
      const analysis = await storage.getSentimentAnalysisByCompetitor(competitorId);
      if (!analysis) {
        return res.status(404).json({ error: "Sentiment analysis not found" });
      }
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sentiment analysis" });
    }
  });

  app.post("/api/sentiment", async (req, res) => {
    try {
      const data = insertSentimentAnalysisSchema.parse(req.body);
      const analysis = await storage.createSentimentAnalysis(data);
      res.status(201).json(analysis);
    } catch (error) {
      res.status(400).json({ error: "Invalid sentiment data" });
    }
  });

  // Startups Routes
  app.get("/api/startups", async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      let startups;
      if (category) {
        startups = await storage.getStartupsByCategory(category);
      } else {
        startups = await storage.getStartups();
      }
      res.json(startups);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch startups" });
    }
  });

  app.get("/api/startups/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.json([]);
      }
      const startups = await storage.searchStartups(query);
      res.json(startups);
    } catch (error) {
      res.status(500).json({ error: "Failed to search startups" });
    }
  });

  app.get("/api/startups/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const startup = await storage.getStartup(id);
      if (!startup) {
        return res.status(404).json({ error: "Startup not found" });
      }
      res.json(startup);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch startup" });
    }
  });

  app.post("/api/startups", async (req, res) => {
    try {
      const createStartupSchema = z.object({
        name: z.string().min(1),
        stage: z.string().min(1),
        velocity: z.string().min(1),
        score: z.number().int().min(0).max(100),
        focus: z.string().min(1),
        category: z.string().optional().default("automated"),
        description: z.string().optional().nullable(),
        fundingAmount: z.string().optional().nullable(),
        location: z.string().optional().nullable(),
        website: z.string().optional().nullable(),
      });
      const data = createStartupSchema.parse(req.body);
      const startup = await storage.createStartup(data);
      res.status(201).json(startup);
    } catch (error) {
      console.error("Create startup error:", error);
      res.status(400).json({ error: "Invalid startup data" });
    }
  });

  app.patch("/api/startups/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const startup = await storage.updateStartup(id, req.body);
      if (!startup) {
        return res.status(404).json({ error: "Startup not found" });
      }
      res.json(startup);
    } catch (error) {
      res.status(400).json({ error: "Failed to update startup" });
    }
  });

  app.delete("/api/startups/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteStartup(id);
      if (!deleted) {
        return res.status(404).json({ error: "Startup not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete startup" });
    }
  });

  // Priorities Routes
  app.get("/api/priorities", async (req, res) => {
    try {
      const priorities = await storage.getPriorities();
      res.json(priorities);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch priorities" });
    }
  });

  app.get("/api/priorities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const priority = await storage.getPriority(id);
      if (!priority) {
        return res.status(404).json({ error: "Priority not found" });
      }
      res.json(priority);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch priority" });
    }
  });

  app.post("/api/priorities", async (req, res) => {
    try {
      const data = insertPrioritySchema.parse(req.body);
      const priority = await storage.createPriority(data);
      res.status(201).json(priority);
    } catch (error) {
      res.status(400).json({ error: "Invalid priority data" });
    }
  });

  app.post("/api/priorities/bulk", async (req, res) => {
    try {
      const bulkSchema = z.object({
        text: z.string().min(1, "Text is required"),
        owner: z.string().optional().default("CEO Office"),
      });
      
      const parsed = bulkSchema.parse(req.body);
      
      const lines = parsed.text.split("\n")
        .map((line: string) => line.trim())
        .filter((line: string) => line.length > 0);
      
      if (lines.length === 0) {
        return res.status(400).json({ error: "No valid priorities found in text" });
      }

      const existing = await storage.getPriorities();
      const maxRank = existing.length > 0 ? Math.max(...existing.map((p: any) => p.rank || 0)) : 0;

      const priorities = lines.map((title: string, index: number) => ({
        title,
        status: "New",
        owner: parsed.owner,
        rank: maxRank + index + 1,
        trend: "even" as const,
      }));

      const created = await storage.createPrioritiesBulk(priorities);
      res.status(201).json(created);
    } catch (error) {
      console.error("Bulk priority error:", error);
      res.status(400).json({ error: "Failed to create priorities" });
    }
  });

  app.patch("/api/priorities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const priority = await storage.updatePriority(id, req.body);
      if (!priority) {
        return res.status(404).json({ error: "Priority not found" });
      }
      res.json(priority);
    } catch (error) {
      res.status(400).json({ error: "Failed to update priority" });
    }
  });

  app.delete("/api/priorities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deletePriority(id);
      if (!deleted) {
        return res.status(404).json({ error: "Priority not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete priority" });
    }
  });

  // Priority History Routes
  app.get("/api/priorities/:id/history", async (req, res) => {
    try {
      const priorityId = parseInt(req.params.id);
      const history = await storage.getPriorityHistory(priorityId);
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch priority history" });
    }
  });

  app.post("/api/priorities/:id/history", async (req, res) => {
    try {
      const priorityId = parseInt(req.params.id);
      const data = insertPriorityHistorySchema.parse({ ...req.body, priorityId });
      const history = await storage.createPriorityHistory(data);
      res.status(201).json(history);
    } catch (error) {
      res.status(400).json({ error: "Invalid history data" });
    }
  });

  // Comments Routes
  app.get("/api/comments/:entityType/:entityId", async (req, res) => {
    try {
      const { entityType, entityId } = req.params;
      const comments = await storage.getComments(entityType, parseInt(entityId));
      res.json(comments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  });

  app.post("/api/comments", async (req, res) => {
    try {
      const schema = z.object({
        entityType: z.string(),
        entityId: z.number(),
        content: z.string().min(1),
        author: z.string().min(1),
      });
      const data = schema.parse(req.body);
      const comment = await storage.createComment(data);
      res.status(201).json(comment);
    } catch (error) {
      res.status(400).json({ error: "Invalid comment data" });
    }
  });

  app.delete("/api/comments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteComment(id);
      if (!deleted) {
        return res.status(404).json({ error: "Comment not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete comment" });
    }
  });

  // Stakeholders Routes
  app.get("/api/priorities/:id/stakeholders", async (req, res) => {
    try {
      const priorityId = parseInt(req.params.id);
      const stakeholders = await storage.getStakeholders(priorityId);
      res.json(stakeholders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stakeholders" });
    }
  });

  app.post("/api/stakeholders", async (req, res) => {
    try {
      const schema = z.object({
        priorityId: z.number(),
        name: z.string().min(1),
        role: z.string().optional().nullable(),
        email: z.string().optional().nullable(),
      });
      const data = schema.parse(req.body);
      const stakeholder = await storage.createStakeholder(data);
      res.status(201).json(stakeholder);
    } catch (error) {
      res.status(400).json({ error: "Invalid stakeholder data" });
    }
  });

  app.delete("/api/stakeholders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteStakeholder(id);
      if (!deleted) {
        return res.status(404).json({ error: "Stakeholder not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete stakeholder" });
    }
  });

  // Notes Routes
  app.get("/api/notes/:entityType/:entityId", async (req, res) => {
    try {
      const { entityType, entityId } = req.params;
      const notes = await storage.getNotes(entityType, parseInt(entityId));
      res.json(notes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notes" });
    }
  });

  app.post("/api/notes", async (req, res) => {
    try {
      const schema = z.object({
        entityType: z.string(),
        entityId: z.number(),
        content: z.string().min(1),
        noteType: z.string().optional().default("general"),
        author: z.string().optional().nullable(),
      });
      const data = schema.parse(req.body);
      const note = await storage.createNote(data);
      res.status(201).json(note);
    } catch (error) {
      res.status(400).json({ error: "Invalid note data" });
    }
  });

  app.delete("/api/notes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteNote(id);
      if (!deleted) {
        return res.status(404).json({ error: "Note not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete note" });
    }
  });

  // Research Sessions Routes
  app.get("/api/research/:entityType/:entityId", async (req, res) => {
    try {
      const { entityType, entityId } = req.params;
      const sessions = await storage.getResearchSessions(entityType, parseInt(entityId));
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch research sessions" });
    }
  });

  app.post("/api/research", async (req, res) => {
    try {
      const schema = z.object({
        entityType: z.string(),
        entityId: z.number(),
        context: z.string().optional().nullable(),
        status: z.string().optional().default("pending"),
      });
      const data = schema.parse(req.body);
      const session = await storage.createResearchSession(data);
      res.status(201).json(session);
    } catch (error) {
      res.status(400).json({ error: "Invalid research session data" });
    }
  });

  app.patch("/api/research/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const session = await storage.updateResearchSession(id, req.body);
      if (!session) {
        return res.status(404).json({ error: "Research session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(400).json({ error: "Failed to update research session" });
    }
  });

  // News Items Routes
  app.get("/api/news", async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const news = await storage.getNewsItems(category, limit);
      res.json(news);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch news" });
    }
  });

  app.post("/api/news", async (req, res) => {
    try {
      const schema = z.object({
        category: z.string(),
        title: z.string().min(1),
        summary: z.string().optional().nullable(),
        source: z.string().optional().nullable(),
        url: z.string().optional().nullable(),
        competitorId: z.number().optional().nullable(),
        traction: z.number().optional().default(0),
        sentiment: z.string().optional().nullable(),
        publishedAt: z.string().optional().nullable(),
      });
      const data = schema.parse(req.body);
      const newsItem = await storage.createNewsItem({
        ...data,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
      });
      res.status(201).json(newsItem);
    } catch (error) {
      res.status(400).json({ error: "Invalid news data" });
    }
  });

  // Alerts Routes
  app.get("/api/alerts", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const alerts = await storage.getRecentAlerts(limit);
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch alerts" });
    }
  });

  app.post("/api/alerts", async (req, res) => {
    try {
      const data = insertAlertSchema.parse(req.body);
      const alert = await storage.createAlert(data);
      res.status(201).json(alert);
    } catch (error) {
      res.status(400).json({ error: "Invalid alert data" });
    }
  });

  // Data Cloud Uploads Routes
  app.get("/api/uploads", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const uploads = await storage.getRecentUploads(limit);
      res.json(uploads);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch uploads" });
    }
  });

  app.post("/api/uploads", async (req, res) => {
    try {
      const data = insertDataCloudUploadSchema.parse(req.body);
      const upload = await storage.createUpload(data);
      res.status(201).json(upload);
    } catch (error) {
      res.status(400).json({ error: "Invalid upload data" });
    }
  });

  // Sentiment Velocity Routes
  app.get("/api/sentiment-velocity", async (req, res) => {
    try {
      const velocity = await storage.getSentimentVelocity();
      res.json(velocity);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sentiment velocity" });
    }
  });

  app.post("/api/sentiment-velocity", async (req, res) => {
    try {
      const data = insertSentimentVelocitySchema.parse(req.body);
      const velocity = await storage.createSentimentVelocity(data);
      res.status(201).json(velocity);
    } catch (error) {
      res.status(400).json({ error: "Invalid velocity data" });
    }
  });

  // Earnings Reports Routes
  app.get("/api/earnings", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const company = req.query.company as string | undefined;
      
      if (company) {
        const reports = await storage.getEarningsReportsByCompany(company);
        res.json(reports);
      } else {
        const reports = await storage.getEarningsReports(limit);
        res.json(reports);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch earnings reports" });
    }
  });

  app.get("/api/earnings/:companyName", async (req, res) => {
    try {
      const companyName = req.params.companyName;
      const reports = await storage.getEarningsReportsByCompany(companyName);
      res.json(reports);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch earnings reports" });
    }
  });

  app.post("/api/earnings", async (req, res) => {
    try {
      const data = insertEarningsReportSchema.parse(req.body);
      const report = await storage.createEarningsReport(data);
      res.status(201).json(report);
    } catch (error) {
      res.status(400).json({ error: "Invalid earnings data" });
    }
  });

  // Travel Locations Routes
  app.get("/api/locations", async (req, res) => {
    try {
      const locations = await storage.getTravelLocations();
      res.json(locations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch locations" });
    }
  });

  app.get("/api/locations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const location = await storage.getTravelLocation(id);
      if (!location) {
        return res.status(404).json({ error: "Location not found" });
      }
      res.json(location);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch location" });
    }
  });

  app.post("/api/locations", async (req, res) => {
    try {
      const schema = z.object({
        name: z.string().min(1),
        locationType: z.string().min(1),
        country: z.string().optional().nullable(),
        region: z.string().optional().nullable(),
        travelDate: z.string().optional().nullable(),
        notes: z.string().optional().nullable(),
        status: z.string().optional().default("planned"),
      });
      const data = schema.parse(req.body);
      const location = await storage.createTravelLocation({
        ...data,
        travelDate: data.travelDate ? new Date(data.travelDate) : null,
      });
      res.status(201).json(location);
    } catch (error) {
      console.error("Create location error:", error);
      res.status(400).json({ error: "Invalid location data" });
    }
  });

  app.patch("/api/locations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const location = await storage.updateTravelLocation(id, req.body);
      if (!location) {
        return res.status(404).json({ error: "Location not found" });
      }
      res.json(location);
    } catch (error) {
      res.status(400).json({ error: "Failed to update location" });
    }
  });

  app.delete("/api/locations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteTravelLocation(id);
      if (!deleted) {
        return res.status(404).json({ error: "Location not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete location" });
    }
  });

  // Important People Routes
  app.get("/api/people", async (req, res) => {
    try {
      const locationId = req.query.locationId ? parseInt(req.query.locationId as string) : undefined;
      const people = await storage.getImportantPeople(locationId);
      res.json(people);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch people" });
    }
  });

  app.get("/api/people/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const person = await storage.getImportantPerson(id);
      if (!person) {
        return res.status(404).json({ error: "Person not found" });
      }
      res.json(person);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch person" });
    }
  });

  app.post("/api/people", async (req, res) => {
    try {
      const schema = z.object({
        locationId: z.number().optional().nullable(),
        name: z.string().min(1),
        title: z.string().optional().nullable(),
        organization: z.string().optional().nullable(),
        personType: z.string().optional().nullable(),
        country: z.string().optional().nullable(),
        city: z.string().optional().nullable(),
        relevanceScore: z.number().optional().default(0),
        whyImportant: z.string().optional().nullable(),
        linkedinUrl: z.string().optional().nullable(),
        twitterUrl: z.string().optional().nullable(),
        notes: z.string().optional().nullable(),
        source: z.string().optional().default("manual"),
      });
      const data = schema.parse(req.body);
      const person = await storage.createImportantPerson(data);
      res.status(201).json(person);
    } catch (error) {
      console.error("Create person error:", error);
      res.status(400).json({ error: "Invalid person data" });
    }
  });

  app.post("/api/people/bulk", async (req, res) => {
    try {
      const schema = z.object({
        people: z.array(z.object({
          locationId: z.number().optional().nullable(),
          name: z.string().min(1),
          title: z.string().optional().nullable(),
          organization: z.string().optional().nullable(),
          personType: z.string().optional().nullable(),
          country: z.string().optional().nullable(),
          city: z.string().optional().nullable(),
          relevanceScore: z.number().optional().default(0),
          whyImportant: z.string().optional().nullable(),
          linkedinUrl: z.string().optional().nullable(),
          twitterUrl: z.string().optional().nullable(),
          notes: z.string().optional().nullable(),
          source: z.string().optional().default("ai_research"),
        })),
      });
      const data = schema.parse(req.body);
      const created = await storage.createImportantPeopleBulk(data.people);
      res.status(201).json(created);
    } catch (error) {
      console.error("Bulk create people error:", error);
      res.status(400).json({ error: "Invalid people data" });
    }
  });

  app.patch("/api/people/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const person = await storage.updateImportantPerson(id, req.body);
      if (!person) {
        return res.status(404).json({ error: "Person not found" });
      }
      res.json(person);
    } catch (error) {
      res.status(400).json({ error: "Failed to update person" });
    }
  });

  app.delete("/api/people/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteImportantPerson(id);
      if (!deleted) {
        return res.status(404).json({ error: "Person not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete person" });
    }
  });

  // Location Research Routes
  app.get("/api/locations/:id/research", async (req, res) => {
    try {
      const locationId = parseInt(req.params.id);
      const research = await storage.getLocationResearch(locationId);
      res.json(research);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch research" });
    }
  });

  app.post("/api/locations/:id/research", async (req, res) => {
    try {
      const locationId = parseInt(req.params.id);
      const schema = z.object({
        query: z.string().optional().nullable(),
        status: z.string().optional().default("pending"),
      });
      const data = schema.parse(req.body);
      const research = await storage.createLocationResearch({
        locationId,
        ...data,
      });
      res.status(201).json(research);
    } catch (error) {
      res.status(400).json({ error: "Invalid research data" });
    }
  });

  app.patch("/api/research/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const research = await storage.updateLocationResearch(id, req.body);
      if (!research) {
        return res.status(404).json({ error: "Research not found" });
      }
      res.json(research);
    } catch (error) {
      res.status(400).json({ error: "Failed to update research" });
    }
  });

  // AI Deep Research for Important People
  app.post("/api/ai/research-people", async (req, res) => {
    try {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "OpenAI API key not configured" });
      }

      const { locationId, locationName, locationType, country } = req.body;
      
      if (!locationName) {
        return res.status(400).json({ error: "Location name is required" });
      }

      const openai = new OpenAI({ apiKey });

      const locationContext = locationType === "city" 
        ? `the city of ${locationName}${country ? ` in ${country}` : ""}`
        : locationType === "conference"
          ? `the ${locationName} conference/event`
          : `the country of ${locationName}`;

      const prompt = `You are a research assistant helping prepare executive briefings for travel to ${locationContext}.

Generate a comprehensive list of the most important people that a CEO or senior executive should consider meeting when visiting this location.

For each person, provide:
1. Name (full name)
2. Title (current position)
3. Organization (company/government entity)
4. Person Type (one of: government, ceo, cio, investor, executive, other)
5. Why Important (1-2 sentence explanation of their significance and why meeting them would be valuable)
6. Relevance Score (0-100, based on their influence and importance for business/government relations)

Focus on:
- Government officials (presidents, ministers, heads of agencies)
- Major CEOs and business leaders based in or associated with this region
- CIOs and technology leaders at major companies
- Key investors and venture capitalists active in the region
- Cultural and industry thought leaders

Respond with a JSON object in this exact format:
{
  "people": [
    {
      "name": "Full Name",
      "title": "Current Title",
      "organization": "Organization Name",
      "personType": "government|ceo|cio|investor|executive|other",
      "country": "${country || locationName}",
      "city": "${locationType === 'city' ? locationName : ''}",
      "whyImportant": "Why this person is important to meet",
      "relevanceScore": 85
    }
  ],
  "summary": "Brief overview of the political/business landscape"
}

Provide at least 10-15 high-quality, relevant contacts.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are an expert executive briefing researcher who helps prepare leaders for important travel. Respond only with valid JSON." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const responseText = completion.choices[0]?.message?.content || "{}";
      const result = JSON.parse(responseText);

      res.json(result);
    } catch (error) {
      console.error("AI research error:", error);
      res.status(500).json({ error: "Failed to run AI research" });
    }
  });

  // Agent Cadences Routes
  app.get("/api/settings/cadences", async (req, res) => {
    try {
      const cadences = await storage.getAgentCadences();
      res.json(cadences);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cadences" });
    }
  });

  app.get("/api/settings/cadences/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const cadence = await storage.getAgentCadence(id);
      if (!cadence) {
        return res.status(404).json({ error: "Cadence not found" });
      }
      res.json(cadence);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cadence" });
    }
  });

  app.post("/api/settings/cadences", async (req, res) => {
    try {
      const cadenceSchema = z.object({
        name: z.string().min(1),
        description: z.string().optional().nullable(),
        schedule: z.string().min(1),
        cronExpression: z.string().optional().nullable(),
        isActive: z.number().optional().default(1),
      });
      const data = cadenceSchema.parse(req.body);
      const cadence = await storage.createAgentCadence(data);
      res.status(201).json(cadence);
    } catch (error) {
      console.error("Create cadence error:", error);
      res.status(400).json({ error: "Invalid cadence data" });
    }
  });

  app.patch("/api/settings/cadences/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const cadence = await storage.updateAgentCadence(id, req.body);
      if (!cadence) {
        return res.status(404).json({ error: "Cadence not found" });
      }
      res.json(cadence);
    } catch (error) {
      res.status(400).json({ error: "Failed to update cadence" });
    }
  });

  app.delete("/api/settings/cadences/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteAgentCadence(id);
      if (!deleted) {
        return res.status(404).json({ error: "Cadence not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete cadence" });
    }
  });

  // Agent Prompts Routes
  app.get("/api/settings/prompts", async (req, res) => {
    try {
      const prompts = await storage.getAgentPrompts();
      res.json(prompts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch prompts" });
    }
  });

  app.get("/api/settings/prompts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const prompt = await storage.getAgentPrompt(id);
      if (!prompt) {
        return res.status(404).json({ error: "Prompt not found" });
      }
      res.json(prompt);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch prompt" });
    }
  });

  app.post("/api/settings/prompts", async (req, res) => {
    try {
      const promptSchema = z.object({
        name: z.string().min(1),
        description: z.string().optional().nullable(),
        promptType: z.string().min(1),
        content: z.string().min(1),
        isActive: z.number().optional().default(1),
      });
      const data = promptSchema.parse(req.body);
      const prompt = await storage.createAgentPrompt(data);
      res.status(201).json(prompt);
    } catch (error) {
      console.error("Create prompt error:", error);
      res.status(400).json({ error: "Invalid prompt data" });
    }
  });

  app.patch("/api/settings/prompts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const prompt = await storage.updateAgentPrompt(id, req.body);
      if (!prompt) {
        return res.status(404).json({ error: "Prompt not found" });
      }
      res.json(prompt);
    } catch (error) {
      res.status(400).json({ error: "Failed to update prompt" });
    }
  });

  app.delete("/api/settings/prompts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteAgentPrompt(id);
      if (!deleted) {
        return res.status(404).json({ error: "Prompt not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete prompt" });
    }
  });

  // Tracked Companies Routes
  app.get("/api/settings/companies", async (req, res) => {
    try {
      const companies = await storage.getTrackedCompanies();
      res.json(companies);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch companies" });
    }
  });

  app.get("/api/settings/companies/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const company = await storage.getTrackedCompany(id);
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }
      res.json(company);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch company" });
    }
  });

  app.post("/api/settings/companies", async (req, res) => {
    try {
      const companySchema = z.object({
        name: z.string().min(1),
        ticker: z.string().optional().nullable(),
        industry: z.string().optional().nullable(),
        companyType: z.string().optional().nullable(),
        priority: z.number().optional().default(0),
        notes: z.string().optional().nullable(),
        isActive: z.number().optional().default(1),
      });
      const data = companySchema.parse(req.body);
      const company = await storage.createTrackedCompany(data);
      res.status(201).json(company);
    } catch (error) {
      console.error("Create company error:", error);
      res.status(400).json({ error: "Invalid company data" });
    }
  });

  app.patch("/api/settings/companies/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const company = await storage.updateTrackedCompany(id, req.body);
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }
      res.json(company);
    } catch (error) {
      res.status(400).json({ error: "Failed to update company" });
    }
  });

  app.delete("/api/settings/companies/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteTrackedCompany(id);
      if (!deleted) {
        return res.status(404).json({ error: "Company not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete company" });
    }
  });

  // Agent Spaces Routes
  app.get("/api/settings/spaces", async (req, res) => {
    try {
      const spaces = await storage.getAgentSpaces();
      res.json(spaces);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch spaces" });
    }
  });

  app.get("/api/settings/spaces/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const space = await storage.getAgentSpace(id);
      if (!space) {
        return res.status(404).json({ error: "Space not found" });
      }
      res.json(space);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch space" });
    }
  });

  app.post("/api/settings/spaces", async (req, res) => {
    try {
      const spaceSchema = z.object({
        name: z.string().min(1),
        description: z.string().optional().nullable(),
        keywords: z.string().optional().nullable(),
        sources: z.string().optional().nullable(),
        priority: z.number().optional().default(0),
        isActive: z.number().optional().default(1),
      });
      const data = spaceSchema.parse(req.body);
      const space = await storage.createAgentSpace(data);
      res.status(201).json(space);
    } catch (error) {
      console.error("Create space error:", error);
      res.status(400).json({ error: "Invalid space data" });
    }
  });

  app.patch("/api/settings/spaces/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const space = await storage.updateAgentSpace(id, req.body);
      if (!space) {
        return res.status(404).json({ error: "Space not found" });
      }
      res.json(space);
    } catch (error) {
      res.status(400).json({ error: "Failed to update space" });
    }
  });

  app.delete("/api/settings/spaces/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteAgentSpace(id);
      if (!deleted) {
        return res.status(404).json({ error: "Space not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete space" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
