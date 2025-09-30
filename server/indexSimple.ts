import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { registerRoutesSimple } from "./routesSimple";
import path from "path";

const app: Express = express();
const port = process.env.PORT || 5000;

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the React app build directory
const clientBuildPath = path.join(process.cwd(), "dist/public");
app.use(express.static(clientBuildPath));

async function startSimpleServer() {
  try {
    const server = await registerRoutesSimple(app);
    
    // Serve React app for all non-API routes
    app.get("*", (req, res) => {
      res.sendFile(path.join(clientBuildPath, "index.html"));
    });

    server.listen(port, () => {
      console.log(`🚀 Simple server running on port ${port}`);
      console.log(`📊 Development Phases API available at http://localhost:${port}/api/development-phases/health`);
      console.log(`🌐 Frontend available at http://localhost:${port}`);
    });
    
  } catch (error) {
    console.error("Failed to start simple server:", error);
    process.exit(1);
  }
}

startSimpleServer();