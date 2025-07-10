import { z } from 'zod';

// Base schemas
export const StockSchema = z.object({
  id: z.number().positive(),
  symbol: z.string().regex(/^[A-Z]{1,5}$/, 'Invalid stock symbol'),
  name: z.string().min(1).max(100),
  sector: z.string().min(1).max(50),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid price format'),
  change: z.string().regex(/^[+-]?\d+(\.\d{1,2})?$/, 'Invalid change format'),
  changePercent: z.string().regex(/^[+-]?\d+(\.\d{1,2})?%$/, 'Invalid percentage format'),
});

export const ChartDataSchema = z.object({
  time: z.string().datetime(),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid price format'),
});

export const PredictionSchema = z.object({
  id: z.number().positive(),
  stockId: z.number().positive(),
  prediction24h: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid prediction format'),
  prediction7d: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid prediction format'),
  confidence: z.number().min(0).max(100),
  createdAt: z.string().datetime(),
});

export const TradingSignalSchema = z.object({
  id: z.number().positive(),
  stockId: z.number().positive(),
  signalType: z.enum(['BUY', 'SELL', 'HOLD']),
  description: z.string().min(1).max(500),
  confidence: z.number().min(0).max(100),
  targetPrice: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid price format'),
  stopLoss: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid price format'),
  createdAt: z.string().datetime(),
});

export const PortfolioSchema = z.object({
  id: z.number().positive(),
  userId: z.number().positive(),
  totalValue: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid value format'),
  dayChange: z.string().regex(/^[+-]?\d+(\.\d{1,2})?$/, 'Invalid change format'),
  dayChangePercent: z.string().regex(/^[+-]?\d+(\.\d{1,2})?%$/, 'Invalid percentage format'),
});

export const WatchlistItemSchema = z.object({
  id: z.number().positive(),
  userId: z.number().positive(),
  stockId: z.number().positive(),
  addedAt: z.string().datetime(),
});

export const MarketSentimentSchema = z.object({
  id: z.number().positive(),
  overall: z.enum(['BULLISH', 'BEARISH', 'NEUTRAL']),
  bullishPercent: z.string().regex(/^\d+(\.\d{1,2})?%$/, 'Invalid percentage format'),
  bearishPercent: z.string().regex(/^\d+(\.\d{1,2})?%$/, 'Invalid percentage format'),
  neutralPercent: z.string().regex(/^\d+(\.\d{1,2})?%$/, 'Invalid percentage format'),
  updatedAt: z.string().datetime(),
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

// Export types
export type Stock = z.infer<typeof StockSchema>;
export type ChartData = z.infer<typeof ChartDataSchema>;
export type Prediction = z.infer<typeof PredictionSchema>;
export type TradingSignal = z.infer<typeof TradingSignalSchema>;
export type Portfolio = z.infer<typeof PortfolioSchema>;
export type WatchlistItem = z.infer<typeof WatchlistItemSchema>;
export type MarketSentiment = z.infer<typeof MarketSentimentSchema>;
export type Recommendation = z.infer<typeof RecommendationSchema>;
export type ApiResponse = z.infer<typeof ApiResponseSchema>;
export type HealthCheck = z.infer<typeof HealthCheckSchema>;

// Validation utilities
export const validateStock = (data: unknown): Stock => StockSchema.parse(data);
export const validateChartData = (data: unknown): ChartData => ChartDataSchema.parse(data);
export const validatePrediction = (data: unknown): Prediction => PredictionSchema.parse(data);
export const validateTradingSignal = (data: unknown): TradingSignal => TradingSignalSchema.parse(data);
export const validatePortfolio = (data: unknown): Portfolio => PortfolioSchema.parse(data);
export const validateWatchlistItem = (data: unknown): WatchlistItem => WatchlistItemSchema.parse(data);
export const validateMarketSentiment = (data: unknown): MarketSentiment => MarketSentimentSchema.parse(data);
export const validateRecommendation = (data: unknown): Recommendation => RecommendationSchema.parse(data);