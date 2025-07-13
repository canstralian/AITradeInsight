import { z } from 'zod';
import { pgTable, serial, text, timestamp, numeric, integer, pgEnum, varchar, jsonb, index } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

// Define enums for database
export const signalTypeEnum = pgEnum('signal_type', ['BUY', 'SELL', 'HOLD', 'WATCH']);
export const sentimentEnum = pgEnum('sentiment', ['BULLISH', 'BEARISH', 'NEUTRAL']);
export const strengthEnum = pgEnum('strength', ['STRONG', 'MODERATE', 'WEAK']);

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Legacy users table (keeping for backward compatibility)
export const usersTable = pgTable('users_legacy', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const stocksTable = pgTable('stocks', {
  id: serial('id').primaryKey(),
  symbol: text('symbol').notNull().unique(),
  name: text('name').notNull(),
  sector: text('sector').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  change: numeric('change', { precision: 10, scale: 2 }).notNull(),
  changePercent: numeric('change_percent', { precision: 5, scale: 2 }).notNull(),
  volume: integer('volume').notNull(),
  marketCap: numeric('market_cap', { precision: 15, scale: 2 }).notNull(),
  lastUpdated: timestamp('last_updated').defaultNow().notNull(),
});

export const portfoliosTable = pgTable('portfolios', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  totalValue: numeric('total_value', { precision: 15, scale: 2 }).notNull(),
  dayPL: numeric('day_pl', { precision: 10, scale: 2 }).notNull(),
  dayPLPercent: numeric('day_pl_percent', { precision: 5, scale: 2 }).notNull(),
  buyingPower: numeric('buying_power', { precision: 15, scale: 2 }).notNull(),
  lastUpdated: timestamp('last_updated').defaultNow().notNull(),
});

export const watchlistTable = pgTable('watchlist', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  stockId: integer('stock_id').notNull(),
  addedAt: timestamp('added_at').defaultNow().notNull(),
});

export const aiPredictionsTable = pgTable('ai_predictions', {
  id: serial('id').primaryKey(),
  stockId: integer('stock_id').notNull(),
  prediction24h: numeric('prediction_24h', { precision: 10, scale: 2 }).notNull(),
  prediction7d: numeric('prediction_7d', { precision: 10, scale: 2 }).notNull(),
  confidence: numeric('confidence', { precision: 5, scale: 2 }).notNull(),
  signal: signalTypeEnum('signal').notNull(),
  aiScore: integer('ai_score').notNull(),
  lastUpdated: timestamp('last_updated').defaultNow().notNull(),
});

export const tradingSignalsTable = pgTable('trading_signals', {
  id: serial('id').primaryKey(),
  stockId: integer('stock_id').notNull(),
  signalType: signalTypeEnum('signal_type').notNull(),
  description: text('description').notNull(),
  strength: strengthEnum('strength').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const marketSentimentTable = pgTable('market_sentiment', {
  id: serial('id').primaryKey(),
  overall: sentimentEnum('overall').notNull(),
  bullishPercent: numeric('bullish_percent', { precision: 5, scale: 2 }).notNull(),
  bearishPercent: numeric('bearish_percent', { precision: 5, scale: 2 }).notNull(),
  neutralPercent: numeric('neutral_percent', { precision: 5, scale: 2 }).notNull(),
  lastUpdated: timestamp('last_updated').defaultNow().notNull(),
});

// Create insert schemas
export const insertUserSchema = createInsertSchema(usersTable);
export const insertStockSchema = createInsertSchema(stocksTable);
export const insertPortfolioSchema = createInsertSchema(portfoliosTable);
export const insertWatchlistSchema = createInsertSchema(watchlistTable);
export const insertAiPredictionSchema = createInsertSchema(aiPredictionsTable);
export const insertTradingSignalSchema = createInsertSchema(tradingSignalsTable);
export const insertMarketSentimentSchema = createInsertSchema(marketSentimentTable);

// Create select schemas
export const selectUserSchema = createSelectSchema(usersTable);
export const selectStockSchema = createSelectSchema(stocksTable);
export const selectPortfolioSchema = createSelectSchema(portfoliosTable);
export const selectWatchlistSchema = createSelectSchema(watchlistTable);
export const selectAiPredictionSchema = createSelectSchema(aiPredictionsTable);
export const selectTradingSignalSchema = createSelectSchema(tradingSignalsTable);
export const selectMarketSentimentSchema = createSelectSchema(marketSentimentTable);

// Infer types for Replit Auth
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Legacy types
export type LegacyUser = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;
export type Stock = typeof stocksTable.$inferSelect;
export type InsertStock = typeof stocksTable.$inferInsert;
export type Portfolio = typeof portfoliosTable.$inferSelect;
export type InsertPortfolio = typeof portfoliosTable.$inferInsert;
export type Watchlist = typeof watchlistTable.$inferSelect;
export type InsertWatchlist = typeof watchlistTable.$inferInsert;
export type AiPrediction = typeof aiPredictionsTable.$inferSelect;
export type InsertAiPrediction = typeof aiPredictionsTable.$inferInsert;
export type TradingSignal = typeof tradingSignalsTable.$inferSelect;
export type InsertTradingSignal = typeof tradingSignalsTable.$inferInsert;
export type MarketSentiment = typeof marketSentimentTable.$inferSelect;
export type InsertMarketSentiment = typeof marketSentimentTable.$inferInsert;

// Security tables
export const mfaTable = pgTable('mfa_settings', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id').notNull(),
  secret: varchar('secret').notNull(),
  backupCodes: jsonb('backup_codes'),
  isVerified: varchar('is_verified').default('false'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const tradingLimitsTable = pgTable('trading_limits', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id').notNull().unique(),
  dailyTradeLimit: numeric('daily_trade_limit', { precision: 15, scale: 2 }),
  maxPositionSize: numeric('max_position_size', { precision: 15, scale: 2 }),
  maxPortfolioValue: numeric('max_portfolio_value', { precision: 15, scale: 2 }),
  riskThreshold: numeric('risk_threshold', { precision: 5, scale: 4 }),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const tradesTable = pgTable('trades', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id').notNull(),
  stockSymbol: varchar('stock_symbol').notNull(),
  amount: numeric('amount', { precision: 15, scale: 2 }).notNull(),
  tradeType: varchar('trade_type').notNull(),
  timestamp: timestamp('timestamp').defaultNow(),
});

export const auditLogsTable = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id').notNull(),
  action: varchar('action').notNull(),
  resource: varchar('resource').notNull(),
  details: jsonb('details'),
  ipAddress: varchar('ip_address'),
  userAgent: text('user_agent'),
  severity: varchar('severity').notNull(),
  timestamp: timestamp('timestamp').defaultNow(),
});

// Additional schemas for API responses
export const StockSchema = z.object({
  id: z.number().positive(),
  symbol: z.string().regex(/^[A-Z]{1,5}$/, 'Invalid stock symbol'),
  name: z.string().min(1).max(100),
  sector: z.string().min(1).max(50),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid price format'),
  change: z.string().regex(/^[+-]?\d+(\.\d{1,2})?$/, 'Invalid change format'),
  changePercent: z.string().regex(/^[+-]?\d+(\.\d{1,2})?%$/, 'Invalid percentage format'),
  volume: z.number(),
  marketCap: z.string(),
  lastUpdated: z.string(),
});

export const ChartDataSchema = z.object({
  time: z.string().datetime(),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid price format'),
  volume: z.number(),
});

export const PredictionSchema = z.object({
  id: z.number().positive(),
  stockId: z.number().positive(),
  prediction24h: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid prediction format'),
  prediction7d: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid prediction format'),
  confidence: z.string(),
  signal: z.enum(['BUY', 'SELL', 'HOLD', 'WATCH']),
  aiScore: z.number().min(0).max(100),
  lastUpdated: z.string(),
});

export const TradingSignalSchema = z.object({
  id: z.number().positive(),
  stockId: z.number().positive(),
  signalType: z.enum(['BUY', 'SELL', 'HOLD', 'WATCH']),
  description: z.string().min(1).max(500),
  strength: z.enum(['STRONG', 'MODERATE', 'WEAK']),
  createdAt: z.string(),
});

export const PortfolioSchema = z.object({
  id: z.number().positive(),
  userId: z.number().positive(),
  totalValue: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid value format'),
  dayPL: z.string().regex(/^[+-]?\d+(\.\d{1,2})?$/, 'Invalid change format'),
  dayPLPercent: z.string().regex(/^[+-]?\d+(\.\d{1,2})?%$/, 'Invalid percentage format'),
  buyingPower: z.string(),
  lastUpdated: z.string(),
});

export const WatchlistItemSchema = z.object({
  id: z.number().positive(),
  userId: z.number().positive(),
  stockId: z.number().positive(),
  addedAt: z.string(),
});

export const MarketSentimentSchema = z.object({
  id: z.number().positive(),
  overall: z.enum(['BULLISH', 'BEARISH', 'NEUTRAL']),
  bullishPercent: z.string().regex(/^\d+(\.\d{1,2})?%$/, 'Invalid percentage format'),
  bearishPercent: z.string().regex(/^\d+(\.\d{1,2})?%$/, 'Invalid percentage format'),
  neutralPercent: z.string().regex(/^\d+(\.\d{1,2})?%$/, 'Invalid percentage format'),
  lastUpdated: z.string(),
});

export const RecommendationSchema = z.object({
  id: z.number().positive(),
  stockId: z.number().positive(),
  prediction24h: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid prediction format'),
  change24h: z.string().regex(/^[+-]?\d+(\.\d{1,2})?%$/, 'Invalid percentage format'),
  aiScore: z.number().min(0).max(100),
  reasoning: z.string().min(1).max(1000),
});

// API Response schemas
export const ApiResponseSchema = z.object({
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
  timestamp: z.string().datetime().optional(),
});

export const HealthCheckSchema = z.object({
  status: z.enum(['OK', 'ERROR']),
  timestamp: z.string().datetime(),
  uptime: z.number(),
  environment: z.string(),
});

// Export additional types
export type ChartData = z.infer<typeof ChartDataSchema>;
export type Prediction = z.infer<typeof PredictionSchema>;
export type Recommendation = z.infer<typeof RecommendationSchema>;
export type ApiResponse = z.infer<typeof ApiResponseSchema>;
export type HealthCheck = z.infer<typeof HealthCheckSchema>;

// Validation utilities
export const validateStock = (data: unknown): z.infer<typeof StockSchema> => StockSchema.parse(data);
export const validateChartData = (data: unknown): ChartData => ChartDataSchema.parse(data);
export const validatePrediction = (data: unknown): Prediction => PredictionSchema.parse(data);
export const validateTradingSignal = (data: unknown): z.infer<typeof TradingSignalSchema> => TradingSignalSchema.parse(data);
export const validatePortfolio = (data: unknown): z.infer<typeof PortfolioSchema> => PortfolioSchema.parse(data);
export const validateWatchlistItem = (data: unknown): z.infer<typeof WatchlistItemSchema> => WatchlistItemSchema.parse(data);
export const validateMarketSentiment = (data: unknown): z.infer<typeof MarketSentimentSchema> => MarketSentimentSchema.parse(data);
export const validateRecommendation = (data: unknown): Recommendation => RecommendationSchema.parse(data);