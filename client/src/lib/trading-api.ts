const API_BASE = '/api';

// Enhanced fetch wrapper with error handling
async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`${response.status}: ${errorData.error || response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
}

export const tradingApi = {
  // Stock endpoints
  getStocks: () => apiRequest<any[]>('/stocks'),
  searchStocks: (query: string) => apiRequest<any[]>(`/stocks/search?q=${encodeURIComponent(query)}`),
  getStock: (symbol: string) => apiRequest<any>(`/stocks/${symbol}`),
  
  // Portfolio endpoints
  getPortfolio: () => apiRequest<any>('/portfolio'),
  
  // Watchlist endpoints
  getWatchlist: () => apiRequest<any[]>('/watchlist'),
  addToWatchlist: (stockSymbol: string) => apiRequest<any>('/watchlist', {
    method: 'POST',
    body: JSON.stringify({ stockSymbol }),
  }),
  removeFromWatchlist: (stockId: number) => apiRequest<void>(`/watchlist/${stockId}`, {
    method: 'DELETE',
  }),
  
  // AI Predictions endpoints
  getAiPredictions: () => apiRequest<any[]>('/predictions'),
  getAiPrediction: (stockId: number) => apiRequest<any>(`/predictions/${stockId}`),
  
  // Trading Signals endpoints
  getTradingSignals: () => apiRequest<any[]>('/signals'),
  getTradingSignalsByStock: (stockId: number) => apiRequest<any[]>(`/signals/${stockId}`),
  
  // Market Sentiment endpoints
  getMarketSentiment: () => apiRequest<any>('/sentiment'),
  
  // Recommendations endpoint
  getRecommendations: () => apiRequest<any[]>('/recommendations'),
  
  // Chart data endpoint
  getChartData: (symbol: string) => apiRequest<any[]>(`/chart/${symbol}`),
  
  // Crypto endpoints
  getCryptoCoins: () => apiRequest<any[]>('/crypto/coins'),
  getCryptoCoin: (symbol: string) => apiRequest<any>(`/crypto/coins/${symbol}`),
  getCryptoRadar: (type?: string) => apiRequest<any[]>(`/crypto/radar${type ? `?type=${type}` : ''}`),
  getCryptoValidation: (coinId: number) => apiRequest<any>(`/crypto/validation/${coinId}`),
  
  // Automated trading endpoints
  getAutomatedTrades: () => apiRequest<any[]>('/trading/automated'),
  createAutomatedTrade: (trade: any) => apiRequest<any>('/trading/automated', {
    method: 'POST',
    body: JSON.stringify(trade),
  }),
  updateAutomatedTrade: (tradeId: number, updates: any) => apiRequest<any>(`/trading/automated/${tradeId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  }),
  cancelAutomatedTrade: (tradeId: number) => apiRequest<void>(`/trading/automated/${tradeId}`, {
    method: 'DELETE',
  }),

  // Trading strategy search endpoints
  searchTradingStrategies: (query: string) => apiRequest<any[]>(`/strategies/search?query=${encodeURIComponent(query)}`),
  searchByStrategyType: (strategyType: string, riskLevel?: string) => {
    const params = new URLSearchParams({ strategy_type: strategyType });
    if (riskLevel) params.append('risk_level', riskLevel);
    return apiRequest<any[]>(`/strategies/search?${params.toString()}`);
  },
  getRecommendedStrategies: (marketCondition?: string, experienceLevel?: string) => {
    const params = new URLSearchParams();
    if (marketCondition) params.append('market_condition', marketCondition);
    if (experienceLevel) params.append('experience_level', experienceLevel);
    return apiRequest<any[]>(`/strategies/recommended?${params.toString()}`);
  },
};