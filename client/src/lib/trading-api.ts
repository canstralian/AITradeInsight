import { QueryClient } from '@tanstack/react-query';

const API_BASE = '/api';

// Enhanced query client with better defaults
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry for 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

// Enhanced fetch wrapper with error handling
const apiRequest = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || 
        `API request failed: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - please try again');
      }
      throw error;
    }
    throw new Error('An unexpected error occurred');
  }
};

// API functions with enhanced error handling
export const fetchStocks = () => apiRequest('/stocks');

export const fetchChartData = (symbol: string) => {
  if (!symbol || !/^[A-Z]{1,5}$/.test(symbol)) {
    throw new Error('Invalid stock symbol');
  }
  return apiRequest(`/chart/${symbol}`);
};

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