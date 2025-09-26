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

// Crypto-specific tables
export const cryptoCoinsTable = pgTable('crypto_coins', {
  id: serial('id').primaryKey(),
  symbol: varchar('symbol', { length: 20 }).unique().notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  price: numeric('price', { precision: 18, scale: 8 }).notNull(),
  change24h: numeric('change_24h', { precision: 10, scale: 2 }).notNull(),
  changePercent24h: numeric('change_percent_24h', { precision: 10, scale: 2 }).notNull(),
  volume24h: numeric('volume_24h', { precision: 20, scale: 2 }).notNull(),
  marketCap: numeric('market_cap', { precision: 20, scale: 2 }).notNull(),
  whaleActivity: numeric('whale_activity', { precision: 10, scale: 2 }).default('0').notNull(),
  socialScore: numeric('social_score', { precision: 5, scale: 2 }).default('0').notNull(),
  technicalScore: numeric('technical_score', { precision: 5, scale: 2 }).default('0').notNull(),
  lastUpdated: timestamp('last_updated').defaultNow().notNull(),
});

export const cryptoRadarTable = pgTable('crypto_radar', {
  id: serial('id').primaryKey(),
  coinId: integer('coin_id').notNull(),
  radarType: varchar('radar_type', { length: 50 }).notNull(), // 'whale', 'social', 'technical'
  signal: signalTypeEnum('signal').notNull(),
  confidence: numeric('confidence', { precision: 5, scale: 2 }).notNull(),
  reasoning: text('reasoning').notNull(),
  whaleData: text('whale_data'), // JSON string
  socialData: text('social_data'), // JSON string
  technicalData: text('technical_data'), // JSON string
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const automaticTradesTable = pgTable('automatic_trades', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  coinId: integer('coin_id').notNull(),
  tradeType: varchar('trade_type', { length: 10 }).notNull(), // 'BUY', 'SELL'
  amount: numeric('amount', { precision: 18, scale: 8 }).notNull(),
  price: numeric('price', { precision: 18, scale: 8 }).notNull(),
  stopLoss: numeric('stop_loss', { precision: 18, scale: 8 }),
  takeProfit: numeric('take_profit', { precision: 18, scale: 8 }),
  status: varchar('status', { length: 20 }).default('PENDING').notNull(),
  executedAt: timestamp('executed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type CryptoCoin = typeof cryptoCoinsTable.$inferSelect;
export type InsertCryptoCoin = typeof cryptoCoinsTable.$inferInsert;
export type CryptoRadar = typeof cryptoRadarTable.$inferSelect;
export type InsertCryptoRadar = typeof cryptoRadarTable.$inferInsert;
export type AutomaticTrade = typeof automaticTradesTable.$inferSelect;
export type InsertAutomaticTrade = typeof automaticTradesTable.$inferInsert;

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

// Broker Integration Tables
export const brokerAccountsTable = pgTable('broker_accounts', {
  id: varchar('id').primaryKey(),
  userId: varchar('user_id').notNull(),
  brokerId: varchar('broker_id').notNull(),
  accountId: varchar('account_id').notNull(),
  accountName: varchar('account_name').notNull(),
  accountType: varchar('account_type').notNull(),
  isActive: varchar('is_active').default('true'),
  balance: numeric('balance', { precision: 15, scale: 2 }).default('0'),
  buyingPower: numeric('buying_power', { precision: 15, scale: 2 }).default('0'),
  credentials: jsonb('credentials'),
  lastSync: timestamp('last_sync').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const brokerPositionsTable = pgTable('broker_positions', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id').notNull(),
  accountId: varchar('account_id').notNull(),
  symbol: varchar('symbol').notNull(),
  quantity: numeric('quantity', { precision: 15, scale: 8 }).notNull(),
  avgPrice: numeric('avg_price', { precision: 15, scale: 8 }).notNull(),
  currentPrice: numeric('current_price', { precision: 15, scale: 8 }).notNull(),
  marketValue: numeric('market_value', { precision: 15, scale: 2 }).notNull(),
  unrealizedPL: numeric('unrealized_pl', { precision: 15, scale: 2 }).notNull(),
  unrealizedPLPercent: numeric('unrealized_pl_percent', { precision: 10, scale: 4 }).notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const brokerTradesTable = pgTable('broker_trades', {
  id: varchar('id').primaryKey(),
  userId: varchar('user_id').notNull(),
  accountId: varchar('account_id').notNull(),
  symbol: varchar('symbol').notNull(),
  side: varchar('side').notNull(),
  quantity: numeric('quantity', { precision: 15, scale: 8 }).notNull(),
  price: numeric('price', { precision: 15, scale: 8 }).notNull(),
  orderType: varchar('order_type').notNull(),
  status: varchar('status').notNull(),
  timestamp: timestamp('timestamp').defaultNow(),
});

// Calendar Integration Tables
export const calendarPreferencesTable = pgTable('calendar_preferences', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id').notNull().unique(),
  earningsAlerts: varchar('earnings_alerts').default('true'),
  economicAlerts: varchar('economic_alerts').default('true'),
  dividendAlerts: varchar('dividend_alerts').default('true'),
  alertTiming: integer('alert_timing').default(1),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const calendarEventsTable = pgTable('calendar_events', {
  id: varchar('id').primaryKey(),
  type: varchar('type').notNull(), // 'earnings', 'economic', 'dividend'
  symbol: varchar('symbol'),
  title: varchar('title').notNull(),
  description: text('description'),
  eventDate: timestamp('event_date').notNull(),
  importance: varchar('importance').default('MEDIUM'),
  data: jsonb('data'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Reporting Tables
export const reportConfigsTable = pgTable('report_configs', {
  id: varchar('id').primaryKey(),
  userId: varchar('user_id').notNull(),
  name: varchar('name').notNull(),
  type: varchar('type').notNull(),
  frequency: varchar('frequency').notNull(),
  format: varchar('format').notNull(),
  sections: jsonb('sections'),
  delivery: jsonb('delivery'),
  isActive: varchar('is_active').default('true'),
  lastGenerated: timestamp('last_generated'),
  nextScheduled: timestamp('next_scheduled'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const reportHistoryTable = pgTable('report_history', {
  id: serial('id').primaryKey(),
  reportId: varchar('report_id').notNull(),
  userId: varchar('user_id').notNull(),
  generatedAt: timestamp('generated_at').defaultNow(),
  format: varchar('format').notNull(),
  fileSize: integer('file_size'),
  status: varchar('status').notNull(),
  errorMessage: text('error_message'),
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