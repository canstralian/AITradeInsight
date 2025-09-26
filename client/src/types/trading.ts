export interface StockData {
  id: number;
  symbol: string;
  name: string;
  sector: string;
  price: string;
  change: string;
  changePercent: string;
  volume: number;
  marketCap: string;
  lastUpdated: string;
}

export interface PortfolioData {
  id: number;
  userId: number;
  totalValue: string;
  dayPL: string;
  dayPLPercent: string;
  buyingPower: string;
  lastUpdated: string;
}

export interface AiPredictionData {
  id: number;
  stockId: number;
  prediction24h: string;
  prediction7d: string;
  confidence: string;
  signal: "BUY" | "SELL" | "HOLD" | "WATCH";
  aiScore: number;
  lastUpdated: string;
  stock?: StockData;
}

export interface TradingSignalData {
  id: number;
  stockId: number;
  signalType: "BUY" | "SELL" | "HOLD" | "WATCH";
  description: string;
  strength: "STRONG" | "MODERATE" | "WEAK";
  createdAt: string;
}

export interface MarketSentimentData {
  id: number;
  overall: "BULLISH" | "BEARISH" | "NEUTRAL";
  bullishPercent: string;
  bearishPercent: string;
  neutralPercent: string;
  lastUpdated: string;
}

export interface WatchlistItem {
  id: number;
  userId: number;
  stockId: number;
  addedAt: string;
  stock: StockData;
}

export interface ChartDataPoint {
  time: string;
  price: string;
  volume: number;
}
