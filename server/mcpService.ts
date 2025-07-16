
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

export class AlgoliaMCPService {
  private client: Client | null = null;
  private transport: StdioClientTransport | null = null;

  async connect() {
    try {
      // Connect to Algolia MCP server
      this.transport = new StdioClientTransport({
        command: "npx",
        args: ["-y", "@modelcontextprotocol/server-algolia"],
        env: {
          ...process.env,
          ALGOLIA_APP_ID: process.env.ALGOLIA_APP_ID,
          ALGOLIA_API_KEY: process.env.ALGOLIA_API_KEY,
        }
      });

      this.client = new Client(
        { name: "trading-strategies-search", version: "1.0.0" },
        { capabilities: {} }
      );

      await this.client.connect(this.transport);
      console.log("Connected to Algolia MCP server");
    } catch (error) {
      console.error("Failed to connect to Algolia MCP server:", error);
    }
  }

  async searchTradingStrategies(query: string, indexName: string = "trading_strategies") {
    if (!this.client) {
      await this.connect();
    }

    if (!this.client) {
      throw new Error("Failed to connect to Algolia MCP service");
    }

    try {
      const result = await this.client.callTool({
        name: "algolia_search",
        arguments: {
          index_name: indexName,
          query: query,
          search_params: {
            hitsPerPage: 20,
            attributesToRetrieve: ["*"],
            filters: "category:trading_strategy"
          }
        }
      });

      return result.content;
    } catch (error) {
      console.error("Error searching trading strategies:", error);
      throw error;
    }
  }

  async searchByStrategy(strategyType: string, riskLevel?: string) {
    if (!this.client) {
      await this.connect();
    }

    if (!this.client) {
      throw new Error("Failed to connect to Algolia MCP service");
    }

    const filters = [`strategy_type:${strategyType}`];
    if (riskLevel) {
      filters.push(`risk_level:${riskLevel}`);
    }

    try {
      const result = await this.client.callTool({
        name: "algolia_search",
        arguments: {
          index_name: "trading_strategies",
          query: "",
          search_params: {
            hitsPerPage: 50,
            filters: filters.join(" AND "),
            attributesToRetrieve: ["*"]
          }
        }
      });

      return result?.content;
    } catch (error) {
      console.error("Error searching by strategy:", error);
      throw error;
    }
  }

  async disconnect() {
    if (this.client && this.transport) {
      await this.client.close();
      await this.transport.close();
      this.client = null;
      this.transport = null;
    }
  }
}

export const algoliaMCP = new AlgoliaMCPService();
