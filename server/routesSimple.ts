import type { Express } from "express";
import { createServer, type Server } from "http";
import developmentPhasesRoutes from "./routes/developmentPhases";

export async function registerRoutesSimple(app: Express): Promise<Server> {
  // Simple CORS middleware for development
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  // Register development phases routes without authentication
  app.use("/api/development-phases", developmentPhasesRoutes);

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ 
      success: true, 
      message: "Development Phases API is running",
      timestamp: new Date().toISOString()
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}