import {
  users,
  stocksTable,
  portfoliosTable,
  watchlistTable,
  aiPredictionsTable,
  tradingSignalsTable,
  marketSentimentTable,
  type User,
  type UpsertUser,
  type Stock,
  type InsertStock,
  type Portfolio,
  type InsertPortfolio,
  type Watchlist,
  type InsertWatchlist,
  type AiPrediction,
  type InsertAiPrediction,
  type TradingSignal,
  type InsertTradingSignal,
  type MarketSentiment,
  type InsertMarketSentiment,
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // User methods (for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Legacy user methods (not used with Replit Auth)
  async getUserByUsername(username: string): Promise<User | undefined> {
    // This is a legacy method - not applicable for Replit Auth users
    return undefined;
  }

  async createUser(user: any): Promise<User> {
    // This is a legacy method - not used with Replit Auth
    throw new Error("Use upsertUser for Replit Auth");
  }

  // Stock methods
  async getStocks(): Promise<Stock[]> {
    return await db.select().from(stocksTable);
  }

  async getStock(id: number): Promise<Stock | undefined> {
    const [stock] = await db.select().from(stocksTable).where(eq(stocksTable.id, id));
    return stock;
  }

  async getStockBySymbol(symbol: string): Promise<Stock | undefined> {
    const [stock] = await db.select().from(stocksTable).where(eq(stocksTable.symbol, symbol));
    return stock;
  }

  async createStock(stock: InsertStock): Promise<Stock> {
    const [newStock] = await db.insert(stocksTable).values(stock).returning();
    return newStock;
  }

  async updateStock(id: number, stock: Partial<InsertStock>): Promise<Stock | undefined> {
    const [updatedStock] = await db
      .update(stocksTable)
      .set(stock)
      .where(eq(stocksTable.id, id))
      .returning();
    return updatedStock;
  }

  async searchStocks(query: string): Promise<Stock[]> {
    // For simplicity, searching by symbol or name
    return await db
      .select()
      .from(stocksTable)
      .where(
        // Use ilike for case-insensitive search
        // This is a simplified version - in production you'd use proper text search
        eq(stocksTable.symbol, query.toUpperCase())
      );
  }

  // Portfolio methods
  async getPortfolio(userId: number): Promise<Portfolio | undefined> {
    const [portfolio] = await db
      .select()
      .from(portfoliosTable)
      .where(eq(portfoliosTable.userId, userId));
    return portfolio;
  }

  async createPortfolio(portfolio: InsertPortfolio): Promise<Portfolio> {
    const [newPortfolio] = await db.insert(portfoliosTable).values(portfolio).returning();
    return newPortfolio;
  }

  async updatePortfolio(userId: number, portfolio: Partial<InsertPortfolio>): Promise<Portfolio | undefined> {
    const [updatedPortfolio] = await db
      .update(portfoliosTable)
      .set(portfolio)
      .where(eq(portfoliosTable.userId, userId))
      .returning();
    return updatedPortfolio;
  }

  // Watchlist methods
  async getWatchlist(userId: number): Promise<Watchlist[]> {
    return await db.select().from(watchlistTable).where(eq(watchlistTable.userId, userId));
  }

  async getWatchlistWithStocks(userId: number): Promise<(Watchlist & { stock: Stock })[]> {
    const watchlistItems = await db
      .select({
        id: watchlistTable.id,
        userId: watchlistTable.userId,
        stockId: watchlistTable.stockId,
        addedAt: watchlistTable.addedAt,
        stock: {
          id: stocksTable.id,
          symbol: stocksTable.symbol,
          name: stocksTable.name,
          sector: stocksTable.sector,
          price: stocksTable.price,
          change: stocksTable.change,
          changePercent: stocksTable.changePercent,
          volume: stocksTable.volume,
          marketCap: stocksTable.marketCap,
          lastUpdated: stocksTable.lastUpdated,
        },
      })
      .from(watchlistTable)
      .innerJoin(stocksTable, eq(watchlistTable.stockId, stocksTable.id))
      .where(eq(watchlistTable.userId, userId));

    return watchlistItems as (Watchlist & { stock: Stock })[];
  }

  async addToWatchlist(watchlistItem: InsertWatchlist): Promise<Watchlist> {
    const [newWatchlistItem] = await db.insert(watchlistTable).values(watchlistItem).returning();
    return newWatchlistItem;
  }

  async removeFromWatchlist(userId: number, stockId: number): Promise<boolean> {
    const result = await db
      .delete(watchlistTable)
      .where(eq(watchlistTable.userId, userId) && eq(watchlistTable.stockId, stockId));
    return result.rowCount > 0;
  }

  // AI Predictions methods
  async getAiPredictions(): Promise<AiPrediction[]> {
    return await db.select().from(aiPredictionsTable);
  }

  async getAiPrediction(stockId: number): Promise<AiPrediction | undefined> {
    const [prediction] = await db
      .select()
      .from(aiPredictionsTable)
      .where(eq(aiPredictionsTable.stockId, stockId));
    return prediction;
  }

  async createAiPrediction(prediction: InsertAiPrediction): Promise<AiPrediction> {
    const [newPrediction] = await db.insert(aiPredictionsTable).values(prediction).returning();
    return newPrediction;
  }

  async updateAiPrediction(stockId: number, prediction: Partial<InsertAiPrediction>): Promise<AiPrediction | undefined> {
    const [updatedPrediction] = await db
      .update(aiPredictionsTable)
      .set(prediction)
      .where(eq(aiPredictionsTable.stockId, stockId))
      .returning();
    return updatedPrediction;
  }

  // Trading Signals methods
  async getTradingSignals(): Promise<TradingSignal[]> {
    return await db.select().from(tradingSignalsTable);
  }

  async getTradingSignalsByStock(stockId: number): Promise<TradingSignal[]> {
    return await db.select().from(tradingSignalsTable).where(eq(tradingSignalsTable.stockId, stockId));
  }

  async createTradingSignal(signal: InsertTradingSignal): Promise<TradingSignal> {
    const [newSignal] = await db.insert(tradingSignalsTable).values(signal).returning();
    return newSignal;
  }

  // Market Sentiment methods
  async getMarketSentiment(): Promise<MarketSentiment | undefined> {
    const [sentiment] = await db.select().from(marketSentimentTable).limit(1);
    return sentiment;
  }

  async createMarketSentiment(sentiment: InsertMarketSentiment): Promise<MarketSentiment> {
    const [newSentiment] = await db.insert(marketSentimentTable).values(sentiment).returning();
    return newSentiment;
  }

  async updateMarketSentiment(sentiment: Partial<InsertMarketSentiment>): Promise<MarketSentiment | undefined> {
    const [updatedSentiment] = await db
      .update(marketSentimentTable)
      .set(sentiment)
      .returning();
    return updatedSentiment;
  }
}