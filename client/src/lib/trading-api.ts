import { apiClient, handleApiError } from './api-client';
import { logger } from './logger';

// Mock data for development
const mockStocks = [
  { symbol: "AAPL", name: "Apple Inc.", price: "175.43", change: "+2.15", changePercent: "+1.24" },
  { symbol: "GOOGL", name: "Alphabet Inc.", price: "131.56", change: "-1.23", changePercent: "-0.93" },
  { symbol: "MSFT", name: "Microsoft Corp.", price: "378.85", change: "+5.67", changePercent: "+1.52" },
  { symbol: "TSLA", name: "Tesla Inc.", price: "248.42", change: "-3.21", changePercent: "-1.28" },
  { symbol: "AMZN", name: "Amazon.com Inc.", price: "153.32", change: "+1.85", changePercent: "+1.22" }
];

const mockRecommendations = [
  {
    id: 1,
    signal: "BUY",
    aiScore: 92,
    stock: { symbol: "AAPL", name: "Apple Inc.", price: "175.43", change: "+2.15", changePercent: "+1.24" }
  },
  {
    id: 2,
    signal: "HOLD",
    aiScore: 78,
    stock: { symbol: "MSFT", name: "Microsoft Corp.", price: "378.85", change: "+5.67", changePercent: "+1.52" }
  },
  {
    id: 3,
    signal: "WATCH",
    aiScore: 85,
    stock: { symbol: "GOOGL", name: "Alphabet Inc.", price: "131.56", change: "-1.23", changePercent: "-0.93" }
  },
  {
    id: 4,
    signal: "BUY",
    aiScore: 88,
    stock: { symbol: "AMZN", name: "Amazon.com Inc.", price: "153.32", change: "+1.85", changePercent: "+1.22" }
  },
  {
    id: 5,
    signal: "SELL",
    aiScore: 65,
    stock: { symbol: "TSLA", name: "Tesla Inc.", price: "248.42", change: "-3.21", changePercent: "-1.28" }
  }
];

class TradingApi {
  private useMockData = import.meta.env.DEV;

  async getStocks() {
    if (this.useMockData) {
      logger.debug('Using mock stock data');
      return mockStocks;
    }

    try {
      const response = await apiClient.get('/api/stocks');
      return response.data;
    } catch (error) {
      logger.warn('Failed to fetch stocks, falling back to mock data', error);
      return mockStocks;
    }
  }

  async getRecommendations() {
    if (this.useMockData) {
      logger.debug('Using mock recommendations data');
      return mockRecommendations;
    }

    try {
      const response = await apiClient.get('/api/recommendations');
      return response.data;
    } catch (error) {
      logger.warn('Failed to fetch recommendations, falling back to mock data', error);
      return mockRecommendations;
    }
  }

  async getPortfolio() {
    if (this.useMockData) {
      logger.debug('Using mock portfolio data');
      return {
        totalValue: 125432.50,
        todayChange: 2847.32,
        todayChangePercent: 2.32,
        positions: [
          { symbol: "AAPL", shares: 50, value: 8771.50, change: 107.50 },
          { symbol: "MSFT", shares: 25, value: 9471.25, change: 141.75 },
          { symbol: "GOOGL", shares: 30, value: 3946.80, change: -36.90 }
        ]
      };
    }

    try {
      const response = await apiClient.get('/api/portfolio');
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch portfolio', error);
      throw new Error(handleApiError(error));
    }
  }
  private async fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('authToken');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getStocks() {
    try {
      return await this.fetchWithAuth('/api/stocks');
    } catch (error) {
      console.warn('API not available, using mock data:', error);
      return mockStocks;
    }
  }

  async getRecommendations() {
    try {
      return await this.fetchWithAuth('/api/recommendations');
    } catch (error) {
      console.warn('API not available, using mock data:', error);
      return mockRecommendations;
    }
  }

  async getPortfolio() {
    try {
      return await this.fetchWithAuth('/api/portfolio');
    } catch (error) {
      console.warn('API not available, using mock data:', error);
      return {
        totalValue: 125432.50,
        todayChange: 2847.32,
        todayChangePercent: 2.32,
        positions: [
          { symbol: "AAPL", shares: 50, value: 8771.50, change: 107.50 },
          { symbol: "MSFT", shares: 25, value: 9471.25, change: 141.75 },
          { symbol: "GOOGL", shares: 30, value: 3946.80, change: -36.90 }
        ]
      };
    }
  }
}

export const tradingApi = new TradingApi();