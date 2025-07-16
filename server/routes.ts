import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertStockSchema, insertWatchlistSchema } from "@shared/schema";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { AIService } from "./aiService";
import { rateLimiters } from "./rateLimiter";
import { MFAService } from "./mfaService";
import { TradingLimitsService } from "./tradingLimits";
import { AuditLogger, auditMiddleware } from './auditLogger';
import { algoliaMCP } from './mcpService';

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  await setupAuth(app);

  // Apply audit middleware to all routes
  app.use('/api', auditMiddleware);

  // MFA routes
  app.post('/api/auth/mfa/setup', rateLimiters.auth, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const userEmail = req.user?.claims?.email;

      if (!userId || !userEmail) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const mfaSetup = await MFAService.setupMFA(userId, userEmail);

      await AuditLogger.logAction(userId, 'MFA_SETUP_INITIATED', 'AUTH', {}, req, 'MEDIUM');

      res.json({
        qrCodeUrl: mfaSetup.qrCodeUrl,
        backupCodes: mfaSetup.backupCodes,
      });
    } catch (error) {
      console.error("MFA setup error:", error);
      res.status(500).json({ message: "Failed to setup MFA" });
    }
  });

  app.post('/api/auth/mfa/verify', rateLimiters.auth, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { token } = req.body;

      if (!userId || !token) {
        return res.status(400).json({ message: "Missing required data" });
      }

      const isSetup = await MFAService.completeMFASetup(userId, token);

      if (isSetup) {
        await AuditLogger.logAction(userId, 'MFA_SETUP_COMPLETED', 'AUTH', {}, req, 'HIGH');
        res.json({ message: "MFA setup completed successfully" });
      } else {
        await AuditLogger.logAction(userId, 'MFA_SETUP_FAILED', 'AUTH', { token: token.substring(0, 2) + '****' }, req, 'MEDIUM');
        res.status(400).json({ message: "Invalid verification code" });
      }
    } catch (error) {
      console.error("MFA verification error:", error);
      res.status(500).json({ message: "Failed to verify MFA" });
    }
  });

  app.get('/api/auth/trading-limits', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const limits = await TradingLimitsService.getUserLimits(userId);
      res.json(limits);
    } catch (error) {
      console.error("Error fetching trading limits:", error);
      res.status(500).json({ message: "Failed to fetch trading limits" });
    }
  });

  app.post('/api/auth/trading-limits', rateLimiters.trading, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const limits = req.body;

      await TradingLimitsService.setUserLimits(userId, limits);
      await AuditLogger.logAction(userId, 'TRADING_LIMITS_UPDATED', 'SETTINGS', limits, req, 'MEDIUM');

      res.json({ message: "Trading limits updated successfully" });
    } catch (error) {
      console.error("Error updating trading limits:", error);
      res.status(500).json({ message: "Failed to update trading limits" });
    }
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "User ID not found" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  // Stock routes
  app.get("/api/stocks", async (req, res) => {
    try {
      const stocks = await storage.getStocks();
      res.json(stocks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stocks" });
    }
  });

  app.get("/api/stocks/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ error: "Query parameter 'q' is required" });
      }

      const stocks = await storage.searchStocks(query);
      res.json(stocks);
    } catch (error) {
      res.status(500).json({ error: "Failed to search stocks" });
    }
  });

  app.get("/api/stocks/:symbol", async (req, res) => {
    try {
      const symbol = req.params.symbol.toUpperCase();
      const stock = await storage.getStockBySymbol(symbol);

      if (!stock) {
        return res.status(404).json({ error: "Stock not found" });
      }

      res.json(stock);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stock" });
    }
  });

  // Portfolio routes
  app.get("/api/portfolio", async (req, res) => {
    try {
      // For MVP, using userId = 1
      const portfolio = await storage.getPortfolio(1);

      if (!portfolio) {
        return res.status(404).json({ error: "Portfolio not found" });
      }

      res.json(portfolio);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch portfolio" });
    }
  });

  // Watchlist routes
  app.get("/api/watchlist", rateLimiters.watchlist, async (req, res) => {
    try {
      // For MVP, using userId = 1
      const watchlist = await storage.getWatchlistWithStocks(1);
      res.json(watchlist);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch watchlist" });
    }
  });

  app.post("/api/watchlist", async (req, res) => {
    try {
      const watchlistSchema = insertWatchlistSchema.extend({
        stockSymbol: z.string().min(1)
      });

      const { stockSymbol } = watchlistSchema.parse(req.body);

      // Find stock by symbol
      const stock = await storage.getStockBySymbol(stockSymbol.toUpperCase());
      if (!stock) {
        return res.status(404).json({ error: "Stock not found" });
      }

      // Add to watchlist (userId = 1 for MVP)
      const watchlistItem = await storage.addToWatchlist({
        userId: 1,
        stockId: stock.id
      });

      res.status(201).json(watchlistItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to add to watchlist" });
    }
  });

  app.delete("/api/watchlist/:stockId", async (req, res) => {
    try {
      const stockId = parseInt(req.params.stockId);
      if (isNaN(stockId)) {
        return res.status(400).json({ error: "Invalid stock ID" });
      }

      const removed = await storage.removeFromWatchlist(1, stockId);
      if (!removed) {
        return res.status(404).json({ error: "Watchlist item not found" });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to remove from watchlist" });
    }
  });

  // AI Predictions routes
  app.get("/api/predictions", async (req, res) => {
    try {
      const predictions = await storage.getAiPredictions();
      res.json(predictions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch AI predictions" });
    }
  });

  app.get("/api/predictions/:stockId", async (req, res) => {
    try {
      const stockId = parseInt(req.params.stockId);
      if (isNaN(stockId)) {
        return res.status(400).json({ error: "Invalid stock ID" });
      }

      const prediction = await storage.getAiPrediction(stockId);
      if (!prediction) {
        return res.status(404).json({ error: "Prediction not found" });
      }

      res.json(prediction);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch prediction" });
    }
  });

  // Trading Signals routes
  app.get("/api/signals", async (req, res) => {
    try {
      const signals = await storage.getTradingSignals();
      res.json(signals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch trading signals" });
    }
  });

  app.get("/api/signals/:stockId", async (req, res) => {
    try {
      const stockId = parseInt(req.params.stockId);
      if (isNaN(stockId)) {
        return res.status(400).json({ error: "Invalid stock ID" });
      }

      const signals = await storage.getTradingSignalsByStock(stockId);
      res.json(signals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch signals for stock" });
    }
  });

  // Market Sentiment routes
  app.get("/api/sentiment", async (req, res) => {
    try {
      const sentiment = await storage.getMarketSentiment();
      if (!sentiment) {
        return res.status(404).json({ error: "Market sentiment not found" });
      }

      res.json(sentiment);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch market sentiment" });
    }
  });

  // Stock recommendations route
  app.get("/api/recommendations", async (req, res) => {
    try {
      const predictions = await storage.getAiPredictions();
      const stocks = await storage.getStocks();

      // Get top 5 recommendations based on AI score
      const recommendations = predictions
        .sort((a, b) => b.aiScore - a.aiScore)
        .slice(0, 5)
        .map(prediction => {
          const stock = stocks.find(s => s.id === prediction.stockId);
          return { ...prediction, stock };
        })
        .filter(item => item.stock);

      res.json(recommendations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recommendations" });
    }
  });

  // Chart data route (mock data for TradingView)
  app.get("/api/chart/:symbol", async (req, res) => {
    try {
      const symbol = req.params.symbol.toUpperCase();
      const stock = await storage.getStockBySymbol(symbol);

      if (!stock) {
        return res.status(404).json({ error: "Stock not found" });
      }

      // Generate mock chart data
      const now = new Date();
      const chartData = [];
      const basePrice = parseFloat(stock.price);

      for (let i = 13; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 30 * 60 * 1000); // 30 minutes intervals
        const priceVariation = (Math.random() - 0.5) * 0.02; // ±1% variation
        const price = basePrice + (basePrice * priceVariation);

        chartData.push({
          time: time.toISOString(),
          price: price.toFixed(2),
          volume: Math.floor(Math.random() * 1000000) + 500000
        });
      }

      res.json(chartData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chart data" });
    }
  });

  // Trading Strategy routes
  app.get("/api/strategies/search", async (req, res) => {
    try {
      const query = req.query.query as string;
      const strategyType = req.query.strategy_type as string;
      const riskLevel = req.query.risk_level as string;

      if (query) {
        // Text-based search using MCP service
        const results = await algoliaMCP.searchTradingStrategies(query);
        res.json(results || []);
      } else if (strategyType) {
        // Filter-based search using MCP service
        const results = await algoliaMCP.searchByStrategy(strategyType, riskLevel);
        res.json(results || []);
      } else {
        res.status(400).json({ error: "Query or strategy_type parameter is required" });
      }
    } catch (error) {
      console.error("Strategy search error:", error);
      // Fallback to mock data if MCP service fails
      const mockStrategies = [
        {
          name: "Momentum Trading Strategy",
          description: "A strategy that capitalizes on the continuation of existing trends in stock prices.",
          strategy_type: "momentum",
          risk_level: "medium",
          win_rate: "68",
          avg_return: "12.5",
          key_features: ["Trend following", "Volume analysis", "Moving averages"]
        },
        {
          name: "Mean Reversion Strategy",
          description: "Exploits the tendency of stock prices to revert to their historical average.",
          strategy_type: "mean_reversion",
          risk_level: "low",
          win_rate: "72",
          avg_return: "8.3",
          key_features: ["Statistical analysis", "Bollinger Bands", "RSI indicators"]
        },
        {
          name: "Breakout Trading",
          description: "Identifies and trades on significant price movements beyond support/resistance levels.",
          strategy_type: "breakout",
          risk_level: "high",
          win_rate: "58",
          avg_return: "18.7",
          key_features: ["Volume confirmation", "Pattern recognition", "Stop-loss management"]
        }
      ];
      
      let filteredStrategies = mockStrategies;
      if (query) {
        filteredStrategies = mockStrategies.filter(s => 
          s.name.toLowerCase().includes(query.toLowerCase()) ||
          s.description.toLowerCase().includes(query.toLowerCase())
        );
      }
      if (strategyType) {
        filteredStrategies = filteredStrategies.filter(s => s.strategy_type === strategyType);
      }
      if (riskLevel) {
        filteredStrategies = filteredStrategies.filter(s => s.risk_level === riskLevel);
      }
      
      res.json(filteredStrategies);
    }
  });

  app.get("/api/strategies/recommended", async (req, res) => {
    try {
      const marketCondition = req.query.market_condition as string;
      const experienceLevel = req.query.experience_level as string;

      // Mock recommended strategies data
      const recommendedStrategies = [
        {
          name: "AI-Enhanced Momentum Strategy",
          description: "Machine learning powered momentum strategy with real-time market sentiment analysis.",
          risk_level: "medium",
          win_rate: "74",
          avg_return: "15.2",
          key_features: ["AI sentiment analysis", "Dynamic stop-loss", "Multi-timeframe analysis"],
          confidence_score: 95
        },
        {
          name: "Options Wheel Strategy",
          description: "Conservative income generation through cash-secured puts and covered calls.",
          risk_level: "low",
          win_rate: "82",
          avg_return: "12.8",
          key_features: ["Income generation", "Risk management", "Theta decay"],
          confidence_score: 88
        },
        {
          name: "Swing Trading Pro",
          description: "Professional swing trading strategy optimized for 3-7 day holding periods.",
          risk_level: "medium",
          win_rate: "69",
          avg_return: "16.4",
          key_features: ["Technical analysis", "Risk/reward optimization", "Market timing"],
          confidence_score: 91
        }
      ];

      res.json(recommendedStrategies);
    } catch (error) {
      console.error("Error fetching recommended strategies:", error);
      res.status(500).json({ error: "Failed to fetch recommended strategies" });
    }
  });

  app.get("/api/strategies/filter", async (req, res) => {
    try {
      const strategyType = req.query.strategy_type as string;
      const riskLevel = req.query.risk_level as string;

      // This endpoint can be an alias to the search endpoint with filters
      const results = await algoliaMCP.searchByStrategy(strategyType, riskLevel);
      res.json(results || []);
    } catch (error) {
      console.error("Strategy filter error:", error);
      // Fallback mock data
      const mockFilteredStrategies = [
        {
          name: "Scalping Master",
          description: "High-frequency trading strategy for quick profits on small price movements.",
          strategy_type: "scalping",
          risk_level: "high",
          win_rate: "62",
          avg_return: "25.1",
          key_features: ["High frequency", "Small profits", "Quick execution"]
        },
        {
          name: "Day Trading Elite",
          description: "Professional day trading strategy with advanced risk management.",
          strategy_type: "day_trading",
          risk_level: "medium",
          win_rate: "65",
          avg_return: "19.3",
          key_features: ["Intraday focus", "Risk management", "Technical indicators"]
        }
      ];
      res.json(mockFilteredStrategies);
    }
  });

  // AI Analysis routes
  app.get("/api/ai/analyze/:symbol", rateLimiters.aiAnalysis, async (req, res) => {
    try {
      const symbol = req.params.symbol.toUpperCase();
      const stock = await storage.getStockBySymbol(symbol);

      if (!stock) {
        return res.status(404).json({ error: "Stock not found" });
      }

      const analysis = await AIService.analyzeStock(symbol, stock);
      res.json({ symbol, analysis });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate AI analysis" });
    }
  });

  app.get("/api/ai/market-sentiment", async (req, res) => {
    try {
      const stocks = await storage.getStocks();
      const sentiment = await AIService.generateMarketSentiment(stocks.slice(0, 10));
      res.json({ sentiment });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate market sentiment" });
    }
  });



  const httpServer = createServer(app);
  return httpServer;
}