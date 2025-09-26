import express from "express";
import cors from "cors";
import { setupVite, serveStatic } from "./viteSetup";
import { createServer } from "http";
import { setupAuth } from "./replitAuth";
import { registerRoutes } from "./routes";

// Import middleware
import {
  errorHandler,
  notFoundHandler,
  requestIdMiddleware,
  handleUnhandledRejections,
  handleUncaughtExceptions,
} from "./middleware/errorHandler";
import { requestLogger, logger } from "./middleware/logger";
import {
  securityHeaders,
  corsOptions,
  generalRateLimit,
  sanitizeRequest,
  apiSecurityHeaders,
} from "./middleware/security";

// Handle unhandled rejections and exceptions
handleUnhandledRejections();
handleUncaughtExceptions();

const app = express();
const server = createServer(app);

// Trust proxy if behind reverse proxy (Replit, nginx, etc.)
app.set("trust proxy", 1);

// Request ID middleware (must be first)
app.use(requestIdMiddleware);

// Request logging
app.use(requestLogger);

// Security middleware - temporarily disabled for development
// app.use(securityHeaders);
app.use(cors(corsOptions));

// Rate limiting
app.use(generalRateLimit);

// Request parsing with size limits
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request sanitization
app.use(sanitizeRequest);

// API security headers for API routes
app.use("/api", apiSecurityHeaders);

// Health check endpoint (before auth)
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    version: process.env.npm_package_version || "1.0.0",
  });
});

async function startServer() {
  // Setup routes (includes authentication)
  await registerRoutes(app);

  // Setup Vite or static serving
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    await setupVite(app, server);
  }

  // 404 handler (must be before error handler)
  app.use(notFoundHandler);

  // Global error handler (must be last)
  app.use(errorHandler);

  const PORT = process.env.PORT || 5000;

  // Graceful shutdown handling
  const gracefulShutdown = () => {
    logger.info("Received shutdown signal, closing server gracefully...");

    server.close(() => {
      logger.info("Server closed successfully");
      process.exit(0);
    });

    // Force close after 30 seconds
    setTimeout(() => {
      logger.error("Forcing server shutdown after timeout");
      process.exit(1);
    }, 30000);
  };

  process.on("SIGTERM", gracefulShutdown);
  process.on("SIGINT", gracefulShutdown);

  server.listen(Number(PORT), "0.0.0.0", () => {
    const mode =
      process.env.NODE_ENV === "production" ? "production" : "development";
    logger.info(`Server starting`, {
      port: PORT,
      mode,
      nodeVersion: process.version,
      platform: process.platform,
    });

    console.log(`[express] serving on port ${PORT} (${mode})`);
    console.log(`[express] server accessible at http://0.0.0.0:${PORT}`);
  });
}

// Start the server
startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
