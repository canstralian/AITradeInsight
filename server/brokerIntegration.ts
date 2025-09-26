import { z } from "zod";
import { storage } from "./storage";

export interface BrokerAccount {
  id: string;
  brokerId: string;
  accountId: string;
  accountName: string;
  accountType: "CASH" | "MARGIN" | "IRA";
  isActive: boolean;
  lastSync: Date;
  balance: number;
  buyingPower: number;
  credentials: {
    apiKey: string;
    apiSecret: string;
    accessToken?: string;
    refreshToken?: string;
  };
}

export interface BrokerPosition {
  symbol: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPL: number;
  unrealizedPLPercent: number;
}

export interface BrokerTrade {
  id: string;
  symbol: string;
  side: "BUY" | "SELL";
  quantity: number;
  price: number;
  orderType: "MARKET" | "LIMIT" | "STOP" | "STOP_LIMIT";
  status: "PENDING" | "FILLED" | "CANCELLED" | "REJECTED";
  timestamp: Date;
}

export class BrokerIntegrationService {
  private static brokerAdapters = new Map<string, BrokerAdapter>();

  static registerBroker(brokerId: string, adapter: BrokerAdapter) {
    this.brokerAdapters.set(brokerId, adapter);
  }

  static async connectBrokerAccount(
    userId: string,
    brokerConfig: {
      brokerId: string;
      apiKey: string;
      apiSecret: string;
      accountId: string;
      accountName: string;
    },
  ): Promise<BrokerAccount> {
    const adapter = this.brokerAdapters.get(brokerConfig.brokerId);
    if (!adapter) {
      throw new Error(`Broker ${brokerConfig.brokerId} not supported`);
    }

    // Validate credentials
    const isValid = await adapter.validateCredentials(
      brokerConfig.apiKey,
      brokerConfig.apiSecret,
    );
    if (!isValid) {
      throw new Error("Invalid broker credentials");
    }

    const account: BrokerAccount = {
      id: `${userId}_${brokerConfig.brokerId}_${Date.now()}`,
      brokerId: brokerConfig.brokerId,
      accountId: brokerConfig.accountId,
      accountName: brokerConfig.accountName,
      accountType: "CASH",
      isActive: true,
      lastSync: new Date(),
      balance: 0,
      buyingPower: 0,
      credentials: {
        apiKey: brokerConfig.apiKey,
        apiSecret: brokerConfig.apiSecret,
      },
    };

    // Store encrypted credentials
    await storage.saveBrokerAccount(userId, account);

    // Initial sync
    await this.syncBrokerAccount(userId, account.id);

    return account;
  }

  static async syncBrokerAccount(
    userId: string,
    accountId: string,
  ): Promise<void> {
    const account = await storage.getBrokerAccount(userId, accountId);
    if (!account) throw new Error("Broker account not found");

    const adapter = this.brokerAdapters.get(account.brokerId);
    if (!adapter) throw new Error(`Broker ${account.brokerId} not supported`);

    try {
      // Sync account balance
      const accountInfo = await adapter.getAccountInfo(account.credentials);
      account.balance = accountInfo.balance;
      account.buyingPower = accountInfo.buyingPower;

      // Sync positions
      const positions = await adapter.getPositions(account.credentials);
      await storage.updateBrokerPositions(userId, accountId, positions);

      // Sync recent trades
      const trades = await adapter.getRecentTrades(account.credentials);
      await storage.updateBrokerTrades(userId, accountId, trades);

      account.lastSync = new Date();
      await storage.updateBrokerAccount(userId, account);
    } catch (error) {
      console.error(`Sync failed for broker ${account.brokerId}:`, error);
      throw error;
    }
  }

  static async executeTradeOrder(
    userId: string,
    accountId: string,
    order: {
      symbol: string;
      side: "BUY" | "SELL";
      quantity: number;
      orderType: "MARKET" | "LIMIT";
      price?: number;
    },
  ): Promise<BrokerTrade> {
    const account = await storage.getBrokerAccount(userId, accountId);
    if (!account) throw new Error("Broker account not found");

    const adapter = this.brokerAdapters.get(account.brokerId);
    if (!adapter) throw new Error(`Broker ${account.brokerId} not supported`);

    const trade = await adapter.executeOrder(account.credentials, order);
    await storage.saveBrokerTrade(userId, accountId, trade);

    return trade;
  }

  static async getConsolidatedPortfolio(userId: string): Promise<{
    totalValue: number;
    totalPL: number;
    totalPLPercent: number;
    positions: BrokerPosition[];
    accounts: BrokerAccount[];
  }> {
    const accounts = await storage.getBrokerAccounts(userId);
    const allPositions: BrokerPosition[] = [];
    let totalValue = 0;
    let totalPL = 0;

    for (const account of accounts) {
      const positions = await storage.getBrokerPositions(userId, account.id);
      allPositions.push(...positions);
      totalValue += account.balance;
    }

    // Aggregate positions by symbol
    const consolidatedPositions = this.consolidatePositions(allPositions);

    // Calculate total P&L
    consolidatedPositions.forEach((pos) => {
      totalPL += pos.unrealizedPL;
    });

    return {
      totalValue,
      totalPL,
      totalPLPercent: totalValue > 0 ? (totalPL / totalValue) * 100 : 0,
      positions: consolidatedPositions,
      accounts,
    };
  }

  private static consolidatePositions(
    positions: BrokerPosition[],
  ): BrokerPosition[] {
    const consolidated = new Map<string, BrokerPosition>();

    positions.forEach((pos) => {
      if (consolidated.has(pos.symbol)) {
        const existing = consolidated.get(pos.symbol)!;
        const totalQuantity = existing.quantity + pos.quantity;
        const totalCost =
          existing.avgPrice * existing.quantity + pos.avgPrice * pos.quantity;

        existing.quantity = totalQuantity;
        existing.avgPrice = totalCost / totalQuantity;
        existing.marketValue += pos.marketValue;
        existing.unrealizedPL += pos.unrealizedPL;
        existing.unrealizedPLPercent =
          (existing.unrealizedPL / (existing.avgPrice * existing.quantity)) *
          100;
      } else {
        consolidated.set(pos.symbol, { ...pos });
      }
    });

    return Array.from(consolidated.values());
  }
}

export interface BrokerAdapter {
  validateCredentials(apiKey: string, apiSecret: string): Promise<boolean>;
  getAccountInfo(
    credentials: any,
  ): Promise<{ balance: number; buyingPower: number }>;
  getPositions(credentials: any): Promise<BrokerPosition[]>;
  getRecentTrades(credentials: any): Promise<BrokerTrade[]>;
  executeOrder(credentials: any, order: any): Promise<BrokerTrade>;
}

// Example broker adapter implementation
export class AlpacaBrokerAdapter implements BrokerAdapter {
  async validateCredentials(
    apiKey: string,
    apiSecret: string,
  ): Promise<boolean> {
    // Implement Alpaca API validation
    return true;
  }

  async getAccountInfo(
    credentials: any,
  ): Promise<{ balance: number; buyingPower: number }> {
    // Implement Alpaca account info retrieval
    return { balance: 10000, buyingPower: 8000 };
  }

  async getPositions(credentials: any): Promise<BrokerPosition[]> {
    // Implement Alpaca positions retrieval
    return [];
  }

  async getRecentTrades(credentials: any): Promise<BrokerTrade[]> {
    // Implement Alpaca trades retrieval
    return [];
  }

  async executeOrder(credentials: any, order: any): Promise<BrokerTrade> {
    // Implement Alpaca order execution
    return {
      id: `trade_${Date.now()}`,
      symbol: order.symbol,
      side: order.side,
      quantity: order.quantity,
      price: order.price || 0,
      orderType: order.orderType,
      status: "PENDING",
      timestamp: new Date(),
    };
  }
}

// Register broker adapters
BrokerIntegrationService.registerBroker("alpaca", new AlpacaBrokerAdapter());
