import { pgTable, text, serial, integer, boolean, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const stocks = pgTable("stocks", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull().unique(),
  name: text("name").notNull(),
  sector: text("sector"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  change: decimal("change", { precision: 10, scale: 2 }).notNull(),
  changePercent: decimal("change_percent", { precision: 5, scale: 2 }).notNull(),
  volume: integer("volume").notNull(),
  marketCap: decimal("market_cap", { precision: 20, scale: 2 }),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const portfolios = pgTable("portfolios", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  totalValue: decimal("total_value", { precision: 15, scale: 2 }).notNull(),
  dayPL: decimal("day_pl", { precision: 15, scale: 2 }).notNull(),
  dayPLPercent: decimal("day_pl_percent", { precision: 5, scale: 2 }).notNull(),
  buyingPower: decimal("buying_power", { precision: 15, scale: 2 }).notNull(),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const watchlists = pgTable("watchlists", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  stockId: integer("stock_id").references(() => stocks.id),
  addedAt: timestamp("added_at").defaultNow(),
});

export const aiPredictions = pgTable("ai_predictions", {
  id: serial("id").primaryKey(),
  stockId: integer("stock_id").references(() => stocks.id),
  prediction24h: decimal("prediction_24h", { precision: 10, scale: 2 }).notNull(),
  prediction7d: decimal("prediction_7d", { precision: 10, scale: 2 }).notNull(),
  confidence: decimal("confidence", { precision: 5, scale: 2 }).notNull(),
  signal: text("signal").notNull(), // 'BUY', 'SELL', 'HOLD', 'WATCH'
  aiScore: integer("ai_score").notNull(),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const tradingSignals = pgTable("trading_signals", {
  id: serial("id").primaryKey(),
  stockId: integer("stock_id").references(() => stocks.id),
  signalType: text("signal_type").notNull(), // 'BUY', 'SELL', 'HOLD', 'WATCH'
  description: text("description").notNull(),
  strength: text("strength").notNull(), // 'STRONG', 'MODERATE', 'WEAK'
  createdAt: timestamp("created_at").defaultNow(),
});

export const marketSentiment = pgTable("market_sentiment", {
  id: serial("id").primaryKey(),
  overall: text("overall").notNull(), // 'BULLISH', 'BEARISH', 'NEUTRAL'
  bullishPercent: decimal("bullish_percent", { precision: 5, scale: 2 }).notNull(),
  bearishPercent: decimal("bearish_percent", { precision: 5, scale: 2 }).notNull(),
  neutralPercent: decimal("neutral_percent", { precision: 5, scale: 2 }).notNull(),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});

export const insertStockSchema = createInsertSchema(stocks).omit({
  id: true,
  lastUpdated: true,
});

export const insertPortfolioSchema = createInsertSchema(portfolios).omit({
  id: true,
  lastUpdated: true,
});

export const insertWatchlistSchema = createInsertSchema(watchlists).omit({
  id: true,
  addedAt: true,
});

export const insertAiPredictionSchema = createInsertSchema(aiPredictions).omit({
  id: true,
  lastUpdated: true,
});

export const insertTradingSignalSchema = createInsertSchema(tradingSignals).omit({
  id: true,
  createdAt: true,
});

export const insertMarketSentimentSchema = createInsertSchema(marketSentiment).omit({
  id: true,
  lastUpdated: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Stock = typeof stocks.$inferSelect;
export type InsertStock = z.infer<typeof insertStockSchema>;
export type Portfolio = typeof portfolios.$inferSelect;
export type InsertPortfolio = z.infer<typeof insertPortfolioSchema>;
export type Watchlist = typeof watchlists.$inferSelect;
export type InsertWatchlist = z.infer<typeof insertWatchlistSchema>;
export type AiPrediction = typeof aiPredictions.$inferSelect;
export type InsertAiPrediction = z.infer<typeof insertAiPredictionSchema>;
export type TradingSignal = typeof tradingSignals.$inferSelect;
export type InsertTradingSignal = z.infer<typeof insertTradingSignalSchema>;
export type MarketSentiment = typeof marketSentiment.$inferSelect;
export type InsertMarketSentiment = z.infer<typeof insertMarketSentimentSchema>;
