import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertStockSchema, insertWatchlistSchema } from "@shared/schema";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { AIService } from "./aiService";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  await setupAuth(app);

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
  app.get("/api/watchlist", async (req, res) => {
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

  // AI Analysis routes
  app.get("/api/ai/analyze/:symbol", async (req, res) => {
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