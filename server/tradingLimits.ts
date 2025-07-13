
import { storage } from './storage';

export interface TradingLimits {
  dailyTradeLimit: number;
  maxPositionSize: number;
  maxPortfolioValue: number;
  riskThreshold: number;
}

export interface TradeValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class TradingLimitsService {
  static defaultLimits: TradingLimits = {
    dailyTradeLimit: 10000, // $10,000 per day
    maxPositionSize: 5000, // $5,000 per position
    maxPortfolioValue: 50000, // $50,000 total portfolio
    riskThreshold: 0.05, // 5% daily loss limit
  };

  static async getUserLimits(userId: string): Promise<TradingLimits> {
    const userLimits = await storage.getUserTradingLimits(userId);
    return userLimits || this.defaultLimits;
  }

  static async setUserLimits(userId: string, limits: Partial<TradingLimits>): Promise<void> {
    await storage.setUserTradingLimits(userId, limits);
  }

  static async validateTrade(
    userId: string,
    tradeAmount: number,
    stockSymbol: string,
    tradeType: 'BUY' | 'SELL'
  ): Promise<TradeValidation> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const limits = await this.getUserLimits(userId);
      const portfolio = await storage.getPortfolio(parseInt(userId));
      const dailyTrades = await storage.getDailyTrades(userId);

      // Check daily trade limit
      const dailyTotal = dailyTrades.reduce((sum, trade) => sum + Math.abs(trade.amount), 0);
      if (dailyTotal + tradeAmount > limits.dailyTradeLimit) {
        errors.push(`Trade exceeds daily limit of $${limits.dailyTradeLimit.toLocaleString()}`);
      }

      // Check position size limit
      if (tradeAmount > limits.maxPositionSize) {
        errors.push(`Trade amount exceeds maximum position size of $${limits.maxPositionSize.toLocaleString()}`);
      }

      // Check portfolio value limit for buys
      if (tradeType === 'BUY' && portfolio) {
        const newPortfolioValue = parseFloat(portfolio.totalValue) + tradeAmount;
        if (newPortfolioValue > limits.maxPortfolioValue) {
          errors.push(`Trade would exceed maximum portfolio value of $${limits.maxPortfolioValue.toLocaleString()}`);
        }
      }

      // Check risk threshold
      if (portfolio) {
        const portfolioValue = parseFloat(portfolio.totalValue);
        const dailyPL = parseFloat(portfolio.dayPL);
        const riskAmount = portfolioValue * limits.riskThreshold;
        
        if (dailyPL < -riskAmount) {
          errors.push(`Daily loss limit of ${(limits.riskThreshold * 100).toFixed(1)}% has been reached`);
        }

        // Warning for approaching limits
        if (tradeAmount > limits.maxPositionSize * 0.8) {
          warnings.push(`Trade amount is approaching position size limit`);
        }

        if (dailyTotal + tradeAmount > limits.dailyTradeLimit * 0.8) {
          warnings.push(`Approaching daily trade limit`);
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    } catch (error) {
      return {
        isValid: false,
        errors: ['Failed to validate trade - please try again'],
        warnings: [],
      };
    }
  }

  static async recordTrade(
    userId: string,
    stockSymbol: string,
    amount: number,
    tradeType: 'BUY' | 'SELL'
  ): Promise<void> {
    await storage.recordTrade({
      userId,
      stockSymbol,
      amount,
      tradeType,
      timestamp: new Date(),
    });
  }
}
