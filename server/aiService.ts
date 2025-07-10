
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export class AIService {
  static async analyzeStock(stockSymbol: string, stockData: any): Promise<string> {
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
            content: prompt
          }
        ]
      });

      return message.content[0].type === 'text' ? message.content[0].text : 'Analysis unavailable';
    } catch (error) {
      console.error('AI analysis error:', error);
      return 'AI analysis temporarily unavailable';
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
            content: prompt
          }
        ]
      });

      return message.content[0].type === 'text' ? message.content[0].text : 'Sentiment analysis unavailable';
    } catch (error) {
      console.error('Market sentiment analysis error:', error);
      return 'Market sentiment analysis temporarily unavailable';
    }
  }
}
