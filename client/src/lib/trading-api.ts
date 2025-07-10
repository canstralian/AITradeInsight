import { apiRequest } from "./queryClient";
import type { 
  StockData, 
  PortfolioData, 
  AiPredictionData, 
  TradingSignalData, 
  MarketSentimentData,
  WatchlistItem,
  ChartDataPoint
} from "../types/trading";

export const tradingApi = {
  // Stock methods
  async getStocks(): Promise<StockData[]> {
    const response = await apiRequest('GET', '/api/stocks');
    return response.json();
  },

  async searchStocks(query: string): Promise<StockData[]> {
    const response = await apiRequest('GET', `/api/stocks/search?q=${encodeURIComponent(query)}`);
    return response.json();
  },

  async getStock(symbol: string): Promise<StockData> {
    const response = await apiRequest('GET', `/api/stocks/${symbol}`);
    return response.json();
  },

  async getChartData(symbol: string): Promise<ChartDataPoint[]> {
    const response = await apiRequest('GET', `/api/chart/${symbol}`);
    return response.json();
  },

  // Portfolio methods
  async getPortfolio(): Promise<PortfolioData> {
    const response = await apiRequest('GET', '/api/portfolio');
    return response.json();
  },

  // Watchlist methods
  async getWatchlist(): Promise<WatchlistItem[]> {
    const response = await apiRequest('GET', '/api/watchlist');
    return response.json();
  },

  async addToWatchlist(stockSymbol: string): Promise<WatchlistItem> {
    const response = await apiRequest('POST', '/api/watchlist', { stockSymbol });
    return response.json();
  },

  async removeFromWatchlist(stockId: number): Promise<void> {
    await apiRequest('DELETE', `/api/watchlist/${stockId}`);
  },

  // AI Predictions methods
  async getAiPredictions(): Promise<AiPredictionData[]> {
    const response = await apiRequest('GET', '/api/predictions');
    return response.json();
  },

  async getAiPrediction(stockId: number): Promise<AiPredictionData> {
    const response = await apiRequest('GET', `/api/predictions/${stockId}`);
    return response.json();
  },

  // Trading Signals methods
  async getTradingSignals(): Promise<TradingSignalData[]> {
    const response = await apiRequest('GET', '/api/signals');
    return response.json();
  },

  async getTradingSignalsByStock(stockId: number): Promise<TradingSignalData[]> {
    const response = await apiRequest('GET', `/api/signals/${stockId}`);
    return response.json();
  },

  // Market Sentiment methods
  async getMarketSentiment(): Promise<MarketSentimentData> {
    const response = await apiRequest('GET', '/api/sentiment');
    return response.json();
  },

  // Recommendations methods
  async getRecommendations(): Promise<AiPredictionData[]> {
    const response = await apiRequest('GET', '/api/recommendations');
    return response.json();
  },
};
