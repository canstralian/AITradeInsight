import Anthropic from "@anthropic-ai/sdk";

import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export class AIService {
  static async analyzeStock(
    stockSymbol: string,
    stockData: any,
  ): Promise<string> {
    try {
      const prompt = `
        Analyze this stock data for ${stockSymbol}:
        Current Price: $${stockData.price}
        Change: ${stockData.change}
        Volume: ${stockData.volume}
        
        Provide a brief trading analysis including:
        1. Short-term outlook (1-7 days)
        2. Key factors to watch
        3. Risk assessment
        
        Keep response under 200 words.
      `;

      const message = await anthropic.messages.create({
        model: "claude-3-sonnet-20240229",
        max_tokens: 300,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      return message.content[0].type === "text"
        ? message.content[0].text
        : "Analysis unavailable";
    } catch (error) {
      console.error("AI analysis error:", error);
      return "AI analysis temporarily unavailable";
    }
  }

  static async generateMarketSentiment(marketData: any[]): Promise<string> {
    try {
      const prompt = `
        Analyze current market sentiment based on this data:
        ${JSON.stringify(marketData, null, 2)}
        
        Provide a market sentiment summary in 2-3 sentences focusing on:
        - Overall market direction
        - Key trends
        - Investor confidence level
      `;

      const message = await anthropic.messages.create({
        model: "claude-3-sonnet-20240229",
        max_tokens: 200,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      return message.content[0].type === "text"
        ? message.content[0].text
        : "Sentiment analysis unavailable";
    } catch (error) {
      console.error("Market sentiment analysis error:", error);
      return "Market sentiment analysis temporarily unavailable";
    }
  }

  static async validateCrypto(coinId: number): Promise<any> {
    try {
      // Mock validation data - in production, this would analyze real data
      const mockValidation = {
        coin: {
          id: coinId,
          symbol: "BTC",
          name: "Bitcoin",
          price: "45000.00",
        },
        socialScore: Math.floor(Math.random() * 30) + 70,
        technicalScore: Math.floor(Math.random() * 30) + 70,
        whaleActivity: Math.floor(Math.random() * 30) + 60,
        socialAnalysis:
          "Strong social media presence with positive sentiment across major platforms. Increasing mentions and engagement.",
        technicalAnalysis:
          "Technical indicators show bullish momentum with strong support levels. RSI indicates healthy buying pressure.",
        whaleAnalysis:
          "Large wallet movements suggest accumulation phase. Institutional interest remains high.",
        overallSignal: "BUY",
        overallConfidence: Math.floor(Math.random() * 20) + 80,
        recommendation:
          "Based on comprehensive analysis, this crypto shows strong potential for upward movement. All indicators align for a positive outlook.",
      };

      return mockValidation;
    } catch (error) {
      console.error("Crypto validation error:", error);
      throw new Error("Crypto validation failed");
    }
  }

  static async generateCryptoRadar(type?: string): Promise<any[]> {
    try {
      // Mock radar data - in production, this would use real whale tracking, social media APIs, etc.
      const mockRadarData = [
        {
          id: 1,
          coinId: 1,
          radarType: "whale",
          signal: "BUY",
          confidence: 85,
          reasoning:
            "Large whale accumulation detected over the past 24 hours. $50M+ moved to cold storage.",
          coin: {
            symbol: "BTC",
            name: "Bitcoin",
            price: "45000.00",
            change24h: "2.5",
            changePercent24h: "2.5",
          },
        },
        {
          id: 2,
          coinId: 2,
          radarType: "social",
          signal: "WATCH",
          confidence: 72,
          reasoning:
            "Social media sentiment turning positive. Trending on Twitter with 500K+ mentions.",
          coin: {
            symbol: "ETH",
            name: "Ethereum",
            price: "2800.00",
            change24h: "1.8",
            changePercent24h: "1.8",
          },
        },
        {
          id: 3,
          coinId: 3,
          radarType: "technical",
          signal: "BUY",
          confidence: 78,
          reasoning:
            "Breaking out of resistance level. Technical indicators show strong bullish momentum.",
          coin: {
            symbol: "SOL",
            name: "Solana",
            price: "95.00",
            change24h: "5.2",
            changePercent24h: "5.2",
          },
        },
      ];

      return type
        ? mockRadarData.filter((item) => item.radarType === type)
        : mockRadarData;
    } catch (error) {
      console.error("Crypto radar generation error:", error);
      return [];
    }
  }
}
