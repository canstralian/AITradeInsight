import { 
  users, stocksTable, portfoliosTable, watchlistTable, aiPredictionsTable, tradingSignalsTable, marketSentimentTable,
  type User, type UpsertUser, type LegacyUser, type InsertUser, type Stock, type InsertStock, type Portfolio, type InsertPortfolio,
  type Watchlist, type InsertWatchlist, type AiPrediction, type InsertAiPrediction,
  type TradingSignal, type InsertTradingSignal, type MarketSentiment, type InsertMarketSentiment
} from "@shared/schema";

export interface IStorage {
  // User methods (for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Legacy user methods
  getUserByUsername(username: string): Promise<LegacyUser | undefined>;
  createUser(user: InsertUser): Promise<LegacyUser>;
  
  // Stock methods
  getStocks(): Promise<Stock[]>;
  getStock(id: number): Promise<Stock | undefined>;
  getStockBySymbol(symbol: string): Promise<Stock | undefined>;
  createStock(stock: InsertStock): Promise<Stock>;
  updateStock(id: number, stock: Partial<InsertStock>): Promise<Stock | undefined>;
  searchStocks(query: string): Promise<Stock[]>;
  
  // Portfolio methods
  getPortfolio(userId: number): Promise<Portfolio | undefined>;
  createPortfolio(portfolio: InsertPortfolio): Promise<Portfolio>;
  updatePortfolio(userId: number, portfolio: Partial<InsertPortfolio>): Promise<Portfolio | undefined>;
  
  // Watchlist methods
  getWatchlist(userId: number): Promise<Watchlist[]>;
  getWatchlistWithStocks(userId: number): Promise<(Watchlist & { stock: Stock })[]>;
  addToWatchlist(watchlistItem: InsertWatchlist): Promise<Watchlist>;
  removeFromWatchlist(userId: number, stockId: number): Promise<boolean>;
  
  // AI Predictions methods
  getAiPredictions(): Promise<AiPrediction[]>;
  getAiPrediction(stockId: number): Promise<AiPrediction | undefined>;
  createAiPrediction(prediction: InsertAiPrediction): Promise<AiPrediction>;
  updateAiPrediction(stockId: number, prediction: Partial<InsertAiPrediction>): Promise<AiPrediction | undefined>;
  
  // Trading Signals methods
  getTradingSignals(): Promise<TradingSignal[]>;
  getTradingSignalsByStock(stockId: number): Promise<TradingSignal[]>;
  createTradingSignal(signal: InsertTradingSignal): Promise<TradingSignal>;
  
  // Market Sentiment methods
  getMarketSentiment(): Promise<MarketSentiment | undefined>;
  createMarketSentiment(sentiment: InsertMarketSentiment): Promise<MarketSentiment>;
  updateMarketSentiment(sentiment: Partial<InsertMarketSentiment>): Promise<MarketSentiment | undefined>;
}

export class MemStorage implements IStorage {
  private replitUsers: Map<string, User> = new Map();
  private legacyUsers: Map<number, LegacyUser> = new Map();
  private stocks: Map<number, Stock> = new Map();
  private portfolios: Map<number, Portfolio> = new Map();
  private watchlists: Map<number, Watchlist> = new Map();
  private aiPredictions: Map<number, AiPrediction> = new Map();
  private tradingSignals: Map<number, TradingSignal> = new Map();
  private marketSentimentData: MarketSentiment | undefined;
  
  private currentUserId = 1;
  private currentStockId = 1;
  private currentPortfolioId = 1;
  private currentWatchlistId = 1;
  private currentAiPredictionId = 1;
  private currentTradingSignalId = 1;
  private currentMarketSentimentId = 1;

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Initialize with sample data
    const sampleStocks: Stock[] = [
      { id: 1, symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology', price: '175.43', change: '4.29', changePercent: '2.45', volume: 52849302, marketCap: '2750000000000', lastUpdated: new Date() },
      { id: 2, symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Automotive', price: '248.91', change: '-3.06', changePercent: '-1.23', volume: 48302954, marketCap: '790000000000', lastUpdated: new Date() },
      { id: 3, symbol: 'MSFT', name: 'Microsoft Corp.', sector: 'Technology', price: '342.17', change: '3.02', changePercent: '0.89', volume: 34958204, marketCap: '2540000000000', lastUpdated: new Date() },
      { id: 4, symbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology', price: '435.20', change: '14.56', changePercent: '3.45', volume: 67832105, marketCap: '1070000000000', lastUpdated: new Date() },
      { id: 5, symbol: 'AMD', name: 'Advanced Micro Devices', sector: 'Technology', price: '112.45', change: '2.32', changePercent: '2.10', volume: 45923784, marketCap: '182000000000', lastUpdated: new Date() },
      { id: 6, symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology', price: '134.78', change: '1.67', changePercent: '1.25', volume: 28463957, marketCap: '1700000000000', lastUpdated: new Date() },
      { id: 7, symbol: 'META', name: 'Meta Platforms Inc.', sector: 'Technology', price: '298.50', change: '-1.65', changePercent: '-0.55', volume: 31847592, marketCap: '756000000000', lastUpdated: new Date() },
      { id: 8, symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'Technology', price: '142.30', change: '1.20', changePercent: '0.85', volume: 42837519, marketCap: '1480000000000', lastUpdated: new Date() },
    ];

    sampleStocks.forEach(stock => {
      this.stocks.set(stock.id, stock);
      this.currentStockId = Math.max(this.currentStockId, stock.id + 1);
    });

    // Initialize AI predictions
    const samplePredictions: AiPrediction[] = [
      { id: 1, stockId: 1, prediction24h: '182.15', prediction7d: '186.90', confidence: '87.00', signal: 'BUY', aiScore: 94, lastUpdated: new Date() },
      { id: 2, stockId: 2, prediction24h: '255.30', prediction7d: '268.45', confidence: '76.00', signal: 'HOLD', aiScore: 78, lastUpdated: new Date() },
      { id: 3, stockId: 3, prediction24h: '348.90', prediction7d: '352.40', confidence: '82.00', signal: 'BUY', aiScore: 85, lastUpdated: new Date() },
      { id: 4, stockId: 4, prediction24h: '448.75', prediction7d: '465.20', confidence: '91.00', signal: 'BUY', aiScore: 96, lastUpdated: new Date() },
      { id: 5, stockId: 5, prediction24h: '118.90', prediction7d: '124.35', confidence: '84.00', signal: 'BUY', aiScore: 89, lastUpdated: new Date() },
    ];

    samplePredictions.forEach(prediction => {
      this.aiPredictions.set(prediction.id, prediction);
    });

    // Initialize trading signals
    const sampleSignals: TradingSignal[] = [
      { id: 1, stockId: 1, signalType: 'BUY', description: 'Strong bullish momentum', strength: 'STRONG', createdAt: new Date() },
      { id: 2, stockId: 2, signalType: 'HOLD', description: 'Consolidation phase', strength: 'MODERATE', createdAt: new Date() },
      { id: 3, stockId: 4, signalType: 'WATCH', description: 'Breakout potential', strength: 'STRONG', createdAt: new Date() },
    ];

    sampleSignals.forEach(signal => {
      this.tradingSignals.set(signal.id, signal);
    });

    // Initialize market sentiment
    this.marketSentimentData = {
      id: 1,
      overall: 'BULLISH',
      bullishPercent: '72.00',
      bearishPercent: '10.00',
      neutralPercent: '18.00',
      lastUpdated: new Date()
    };

    // Initialize sample portfolio
    this.portfolios.set(1, {
      id: 1,
      userId: 1,
      totalValue: '127450.32',
      dayPL: '1234.56',
      dayPLPercent: '1.23',
      buyingPower: '25670.00',
      lastUpdated: new Date()
    });

    // Initialize sample watchlist
    [1, 2, 3].forEach(stockId => {
      this.watchlists.set(this.currentWatchlistId, {
        id: this.currentWatchlistId,
        userId: 1,
        stockId,
        addedAt: new Date()
      });
      this.currentWatchlistId++;
    });
  }

  // User methods (for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    return this.replitUsers.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const user: User = {
      id: userData.id!,
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      createdAt: userData.createdAt || new Date(),
      updatedAt: new Date(),
    };
    this.replitUsers.set(user.id, user);
    return user;
  }

  // Legacy user methods
  async getUserByUsername(username: string): Promise<LegacyUser | undefined> {
    return Array.from(this.legacyUsers.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<LegacyUser> {
    const id = this.currentUserId++;
    const user: LegacyUser = { 
      ...insertUser, 
      id, 
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.legacyUsers.set(id, user);
    return user;
  }

  // Stock methods
  async getStocks(): Promise<Stock[]> {
    return Array.from(this.stocks.values());
  }

  async getStock(id: number): Promise<Stock | undefined> {
    return this.stocks.get(id);
  }

  async getStockBySymbol(symbol: string): Promise<Stock | undefined> {
    return Array.from(this.stocks.values()).find(stock => stock.symbol === symbol);
  }

  async createStock(insertStock: InsertStock): Promise<Stock> {
    const id = this.currentStockId++;
    const stock: Stock = {
      ...insertStock,
      id,
      lastUpdated: new Date(),
      sector: insertStock.sector || "Unknown",
      marketCap: insertStock.marketCap || "0"
    };
    this.stocks.set(id, stock);
    return stock;
  }

  async updateStock(id: number, updateStock: Partial<InsertStock>): Promise<Stock | undefined> {
    const stock = this.stocks.get(id);
    if (!stock) return undefined;
    
    const updatedStock = { ...stock, ...updateStock, lastUpdated: new Date() };
    this.stocks.set(id, updatedStock);
    return updatedStock;
  }

  async searchStocks(query: string): Promise<Stock[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.stocks.values()).filter(stock => 
      stock.symbol.toLowerCase().includes(lowercaseQuery) ||
      stock.name.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Portfolio methods
  async getPortfolio(userId: number): Promise<Portfolio | undefined> {
    return Array.from(this.portfolios.values()).find(p => p.userId === userId);
  }

  async createPortfolio(insertPortfolio: InsertPortfolio): Promise<Portfolio> {
    const id = this.currentPortfolioId++;
    const portfolio: Portfolio = {
      ...insertPortfolio,
      id,
      lastUpdated: new Date(),
      userId: insertPortfolio.userId || 0
    };
    this.portfolios.set(id, portfolio);
    return portfolio;
  }

  async updatePortfolio(userId: number, updatePortfolio: Partial<InsertPortfolio>): Promise<Portfolio | undefined> {
    const portfolio = Array.from(this.portfolios.values()).find(p => p.userId === userId);
    if (!portfolio) return undefined;
    
    const updatedPortfolio = { ...portfolio, ...updatePortfolio, lastUpdated: new Date() };
    this.portfolios.set(portfolio.id, updatedPortfolio);
    return updatedPortfolio;
  }

  // Watchlist methods
  async getWatchlist(userId: number): Promise<Watchlist[]> {
    return Array.from(this.watchlists.values()).filter(w => w.userId === userId);
  }

  async getWatchlistWithStocks(userId: number): Promise<(Watchlist & { stock: Stock })[]> {
    const watchlistItems = await this.getWatchlist(userId);
    return watchlistItems.map(item => {
      const stock = this.stocks.get(item.stockId!);
      return { ...item, stock: stock! };
    }).filter(item => item.stock);
  }

  async addToWatchlist(insertWatchlist: InsertWatchlist): Promise<Watchlist> {
    const id = this.currentWatchlistId++;
    const watchlistItem: Watchlist = {
      ...insertWatchlist,
      id,
      addedAt: new Date(),
      userId: insertWatchlist.userId || 0,
      stockId: insertWatchlist.stockId || 0
    };
    this.watchlists.set(id, watchlistItem);
    return watchlistItem;
  }

  async removeFromWatchlist(userId: number, stockId: number): Promise<boolean> {
    const item = Array.from(this.watchlists.values()).find(w => w.userId === userId && w.stockId === stockId);
    if (!item) return false;
    
    this.watchlists.delete(item.id);
    return true;
  }

  // AI Predictions methods
  async getAiPredictions(): Promise<AiPrediction[]> {
    return Array.from(this.aiPredictions.values());
  }

  async getAiPrediction(stockId: number): Promise<AiPrediction | undefined> {
    return Array.from(this.aiPredictions.values()).find(p => p.stockId === stockId);
  }

  async createAiPrediction(insertPrediction: InsertAiPrediction): Promise<AiPrediction> {
    const id = this.currentAiPredictionId++;
    const prediction: AiPrediction = {
      ...insertPrediction,
      id,
      lastUpdated: new Date(),
      stockId: insertPrediction.stockId || 0
    };
    this.aiPredictions.set(id, prediction);
    return prediction;
  }

  async updateAiPrediction(stockId: number, updatePrediction: Partial<InsertAiPrediction>): Promise<AiPrediction | undefined> {
    const prediction = Array.from(this.aiPredictions.values()).find(p => p.stockId === stockId);
    if (!prediction) return undefined;
    
    const updatedPrediction = { ...prediction, ...updatePrediction, lastUpdated: new Date() };
    this.aiPredictions.set(prediction.id, updatedPrediction);
    return updatedPrediction;
  }

  // Trading Signals methods
  async getTradingSignals(): Promise<TradingSignal[]> {
    return Array.from(this.tradingSignals.values());
  }

  async getTradingSignalsByStock(stockId: number): Promise<TradingSignal[]> {
    return Array.from(this.tradingSignals.values()).filter(s => s.stockId === stockId);
  }

  async createTradingSignal(insertSignal: InsertTradingSignal): Promise<TradingSignal> {
    const id = this.currentTradingSignalId++;
    const signal: TradingSignal = {
      ...insertSignal,
      id,
      createdAt: new Date(),
      stockId: insertSignal.stockId || 0
    };
    this.tradingSignals.set(id, signal);
    return signal;
  }

  // Market Sentiment methods
  async getMarketSentiment(): Promise<MarketSentiment | undefined> {
    return this.marketSentimentData;
  }

  async createMarketSentiment(insertSentiment: InsertMarketSentiment): Promise<MarketSentiment> {
    const id = this.currentMarketSentimentId++;
    const sentiment: MarketSentiment = {
      ...insertSentiment,
      id,
      lastUpdated: new Date()
    };
    this.marketSentimentData = sentiment;
    return sentiment;
  }

  async updateMarketSentiment(updateSentiment: Partial<InsertMarketSentiment>): Promise<MarketSentiment | undefined> {
    if (!this.marketSentimentData) return undefined;
    
    this.marketSentimentData = { 
      ...this.marketSentimentData, 
      ...updateSentiment, 
      lastUpdated: new Date() 
    };
    return this.marketSentimentData;
  }
}

import { DatabaseStorage } from './databaseStorage';

export const storage = new DatabaseStorage();
