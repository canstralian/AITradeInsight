import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimiters } from './rateLimiter.js';
import { registerRoutes } from './routes.js';
import { setupVite, serveStatic } from './vite.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for rate limiting (required in Replit environment)
app.set('trust proxy', 1);

// Security middleware
if (process.env.NODE_ENV === 'production') {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "ws:", "wss:"],
      },
    },
  }));
} else {
  // Disable CSP in development for Vite HMR
  app.use(helmet({
    contentSecurityPolicy: false,
  }));
}

// Apply enhanced rate limiting only in production
if (process.env.NODE_ENV === 'production') {
  app.use('/api', rateLimiters.general);
}
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : true, // Allow all origins in development
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Set up routes and get HTTP server
const server = await registerRoutes(app);

// Development middleware
if (process.env.NODE_ENV === 'development') {
  await setupVite(app, server);
} else {
  serveStatic(app);
}

// Global error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

server.listen(PORT, '0.0.0.0', () => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`${timestamp} [express] serving on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});