
import { storage } from './storage';
import { BrokerIntegrationService } from './brokerIntegration';
import { CalendarIntegrationService } from './calendarIntegration';
import PDFDocument from 'pdfkit';
import nodemailer from 'nodemailer';
import { createCanvas, loadImage } from 'canvas';
import Chart from 'chart.js/auto';

export interface ReportConfig {
  id: string;
  userId: string;
  name: string;
  type: 'PERFORMANCE' | 'PORTFOLIO' | 'TRADING' | 'CUSTOM';
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY';
  sections: ReportSection[];
  format: 'PDF' | 'HTML' | 'CSV';
  delivery: {
    email: boolean;
    download: boolean;
    emailRecipients: string[];
  };
  isActive: boolean;
  lastGenerated?: Date;
  nextScheduled?: Date;
}

export interface ReportSection {
  type: 'PORTFOLIO_SUMMARY' | 'PERFORMANCE_METRICS' | 'TRADE_ANALYSIS' | 'MARKET_OUTLOOK' | 'CUSTOM_CHART';
  title: string;
  config: any;
  order: number;
}

export interface ReportData {
  metadata: {
    reportId: string;
    userId: string;
    generatedAt: Date;
    period: {
      start: Date;
      end: Date;
    };
  };
  portfolioSummary: {
    totalValue: number;
    totalReturn: number;
    totalReturnPercent: number;
    bestPerformer: { symbol: string; return: number };
    worstPerformer: { symbol: string; return: number };
    topHoldings: Array<{ symbol: string; value: number; percent: number }>;
  };
  performanceMetrics: {
    sharpeRatio: number;
    maxDrawdown: number;
    volatility: number;
    alpha: number;
    beta: number;
    winRate: number;
    avgWin: number;
    avgLoss: number;
  };
  tradeAnalysis: {
    totalTrades: number;
    profitableTrades: number;
    totalProfit: number;
    totalLoss: number;
    avgHoldingPeriod: number;
    mostTradedSymbols: Array<{ symbol: string; count: number }>;
  };
  marketOutlook: {
    aiPredictions: any[];
    upcomingEvents: any[];
    recommendations: any[];
  };
}

export class ReportingService {
  private static emailTransporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });

  static async createReportConfig(userId: string, config: Omit<ReportConfig, 'id' | 'userId'>): Promise<ReportConfig> {
    const reportConfig: ReportConfig = {
      id: `report_${Date.now()}`,
      userId,
      ...config
    };

    await storage.saveReportConfig(userId, reportConfig);
    
    // Schedule the report
    await this.scheduleReport(reportConfig);
    
    return reportConfig;
  }

  static async generateReport(userId: string, reportId: string): Promise<{
    data: ReportData;
    buffer?: Buffer;
    html?: string;
    csv?: string;
  }> {
    const reportConfig = await storage.getReportConfig(userId, reportId);
    if (!reportConfig) {
      throw new Error('Report configuration not found');
    }

    const reportData = await this.collectReportData(userId, reportConfig);
    
    let result: any = { data: reportData };
    
    switch (reportConfig.format) {
      case 'PDF':
        result.buffer = await this.generatePDFReport(reportData, reportConfig);
        break;
      case 'HTML':
        result.html = await this.generateHTMLReport(reportData, reportConfig);
        break;
      case 'CSV':
        result.csv = await this.generateCSVReport(reportData, reportConfig);
        break;
    }

    // Update last generated timestamp
    reportConfig.lastGenerated = new Date();
    await storage.updateReportConfig(userId, reportConfig);

    // Send via email if configured
    if (reportConfig.delivery.email) {
      await this.sendReportEmail(reportConfig, result);
    }

    return result;
  }

  static async generateWeeklyPerformanceReport(userId: string): Promise<ReportData> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    const reportConfig: ReportConfig = {
      id: 'weekly_performance',
      userId,
      name: 'Weekly Performance Report',
      type: 'PERFORMANCE',
      frequency: 'WEEKLY',
      sections: [
        { type: 'PORTFOLIO_SUMMARY', title: 'Portfolio Summary', config: {}, order: 1 },
        { type: 'PERFORMANCE_METRICS', title: 'Performance Metrics', config: {}, order: 2 },
        { type: 'TRADE_ANALYSIS', title: 'Trade Analysis', config: {}, order: 3 },
        { type: 'MARKET_OUTLOOK', title: 'Market Outlook', config: {}, order: 4 }
      ],
      format: 'PDF',
      delivery: { email: false, download: true, emailRecipients: [] },
      isActive: true
    };

    return await this.collectReportData(userId, reportConfig);
  }

  static async generateMonthlyPerformanceReport(userId: string): Promise<ReportData> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);

    const reportConfig: ReportConfig = {
      id: 'monthly_performance',
      userId,
      name: 'Monthly Performance Report',
      type: 'PERFORMANCE',
      frequency: 'MONTHLY',
      sections: [
        { type: 'PORTFOLIO_SUMMARY', title: 'Portfolio Summary', config: {}, order: 1 },
        { type: 'PERFORMANCE_METRICS', title: 'Performance Metrics', config: {}, order: 2 },
        { type: 'TRADE_ANALYSIS', title: 'Trade Analysis', config: {}, order: 3 },
        { type: 'MARKET_OUTLOOK', title: 'Market Outlook', config: {}, order: 4 }
      ],
      format: 'PDF',
      delivery: { email: true, download: true, emailRecipients: [] },
      isActive: true
    };

    return await this.collectReportData(userId, reportConfig);
  }

  static async generateEmailDigest(userId: string): Promise<string> {
    const portfolio = await BrokerIntegrationService.getConsolidatedPortfolio(userId);
    const upcomingEvents = await CalendarIntegrationService.getUpcomingEvents(userId, 3);
    const predictions = await storage.getAiPredictions();

    const digestHtml = `
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Daily Trading Digest</h2>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Portfolio Summary</h3>
            <p><strong>Total Value:</strong> $${portfolio.totalValue.toLocaleString()}</p>
            <p><strong>Day P&L:</strong> 
              <span style="color: ${portfolio.totalPL >= 0 ? '#10b981' : '#ef4444'};">
                ${portfolio.totalPL >= 0 ? '+' : ''}$${portfolio.totalPL.toLocaleString()} (${portfolio.totalPLPercent.toFixed(2)}%)
              </span>
            </p>
          </div>

          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Upcoming Events</h3>
            ${upcomingEvents.earnings.length > 0 ? 
              `<h4>Earnings:</h4><ul>${upcomingEvents.earnings.map(e => `<li>${e.symbol} - ${e.reportDate.toDateString()}</li>`).join('')}</ul>` : 
              '<p>No upcoming earnings for watched stocks.</p>'
            }
            ${upcomingEvents.economic.length > 0 ? 
              `<h4>Economic Events:</h4><ul>${upcomingEvents.economic.map(e => `<li>${e.name} - ${e.date.toDateString()}</li>`).join('')}</ul>` : 
              '<p>No major economic events scheduled.</p>'
            }
          </div>

          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Top AI Recommendations</h3>
            ${predictions.slice(0, 3).map(p => `
              <div style="border-left: 4px solid #2563eb; padding-left: 16px; margin: 10px 0;">
                <strong>${p.stock?.symbol || 'Unknown'}</strong> - ${p.signal}
                <br><small>AI Score: ${p.aiScore}/100 | Confidence: ${p.confidence}%</small>
              </div>
            `).join('')}
          </div>

          <p style="text-align: center; color: #6b7280; font-size: 12px;">
            Generated on ${new Date().toLocaleString()}
          </p>
        </body>
      </html>
    `;

    return digestHtml;
  }

  private static async collectReportData(userId: string, config: ReportConfig): Promise<ReportData> {
    const [portfolio, predictions, tradingSignals] = await Promise.all([
      BrokerIntegrationService.getConsolidatedPortfolio(userId),
      storage.getAiPredictions(),
      storage.getTradingSignals()
    ]);

    const upcomingEvents = await CalendarIntegrationService.getUpcomingEvents(userId, 7);

    return {
      metadata: {
        reportId: config.id,
        userId,
        generatedAt: new Date(),
        period: {
          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          end: new Date()
        }
      },
      portfolioSummary: {
        totalValue: portfolio.totalValue,
        totalReturn: portfolio.totalPL,
        totalReturnPercent: portfolio.totalPLPercent,
        bestPerformer: { symbol: 'AAPL', return: 5.2 },
        worstPerformer: { symbol: 'TSLA', return: -3.1 },
        topHoldings: portfolio.positions.slice(0, 5).map(p => ({
          symbol: p.symbol,
          value: p.marketValue,
          percent: (p.marketValue / portfolio.totalValue) * 100
        }))
      },
      performanceMetrics: {
        sharpeRatio: 1.2,
        maxDrawdown: -8.5,
        volatility: 15.3,
        alpha: 0.8,
        beta: 1.1,
        winRate: 65.4,
        avgWin: 3.2,
        avgLoss: -1.8
      },
      tradeAnalysis: {
        totalTrades: 24,
        profitableTrades: 16,
        totalProfit: 2850,
        totalLoss: -1200,
        avgHoldingPeriod: 3.5,
        mostTradedSymbols: [
          { symbol: 'AAPL', count: 8 },
          { symbol: 'MSFT', count: 6 },
          { symbol: 'GOOGL', count: 4 }
        ]
      },
      marketOutlook: {
        aiPredictions: predictions.slice(0, 10),
        upcomingEvents: [...upcomingEvents.earnings, ...upcomingEvents.economic],
        recommendations: predictions.filter(p => p.signal === 'BUY').slice(0, 5)
      }
    };
  }

  private static async generatePDFReport(data: ReportData, config: ReportConfig): Promise<Buffer> {
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];

    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => {});

    // Header
    doc.fontSize(20).text(config.name, 50, 50);
    doc.fontSize(12).text(`Generated: ${data.metadata.generatedAt.toLocaleString()}`, 50, 80);
    doc.fontSize(12).text(`Period: ${data.metadata.period.start.toDateString()} - ${data.metadata.period.end.toDateString()}`, 50, 100);

    // Portfolio Summary
    doc.fontSize(16).text('Portfolio Summary', 50, 140);
    doc.fontSize(12).text(`Total Value: $${data.portfolioSummary.totalValue.toLocaleString()}`, 50, 160);
    doc.text(`Total Return: $${data.portfolioSummary.totalReturn.toLocaleString()} (${data.portfolioSummary.totalReturnPercent.toFixed(2)}%)`, 50, 180);
    doc.text(`Best Performer: ${data.portfolioSummary.bestPerformer.symbol} (+${data.portfolioSummary.bestPerformer.return}%)`, 50, 200);
    doc.text(`Worst Performer: ${data.portfolioSummary.worstPerformer.symbol} (${data.portfolioSummary.worstPerformer.return}%)`, 50, 220);

    // Performance Metrics
    doc.fontSize(16).text('Performance Metrics', 50, 260);
    doc.fontSize(12).text(`Sharpe Ratio: ${data.performanceMetrics.sharpeRatio}`, 50, 280);
    doc.text(`Max Drawdown: ${data.performanceMetrics.maxDrawdown}%`, 50, 300);
    doc.text(`Volatility: ${data.performanceMetrics.volatility}%`, 50, 320);
    doc.text(`Win Rate: ${data.performanceMetrics.winRate}%`, 50, 340);

    // Trade Analysis
    doc.fontSize(16).text('Trade Analysis', 50, 380);
    doc.fontSize(12).text(`Total Trades: ${data.tradeAnalysis.totalTrades}`, 50, 400);
    doc.text(`Profitable Trades: ${data.tradeAnalysis.profitableTrades}`, 50, 420);
    doc.text(`Total Profit: $${data.tradeAnalysis.totalProfit.toLocaleString()}`, 50, 440);
    doc.text(`Total Loss: $${data.tradeAnalysis.totalLoss.toLocaleString()}`, 50, 460);

    doc.end();

    return new Promise((resolve) => {
      doc.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
    });
  }

  private static async generateHTMLReport(data: ReportData, config: ReportConfig): Promise<string> {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${config.name}</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; margin-bottom: 20px; }
            .section { margin: 20px 0; padding: 20px; background: #f8fafc; border-radius: 8px; }
            .metric { display: inline-block; margin: 10px 20px 10px 0; }
            .positive { color: #10b981; }
            .negative { color: #ef4444; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${config.name}</h1>
            <p>Generated: ${data.metadata.generatedAt.toLocaleString()}</p>
            <p>Period: ${data.metadata.period.start.toDateString()} - ${data.metadata.period.end.toDateString()}</p>
          </div>

          <div class="section">
            <h2>Portfolio Summary</h2>
            <div class="metric">Total Value: $${data.portfolioSummary.totalValue.toLocaleString()}</div>
            <div class="metric ${data.portfolioSummary.totalReturn >= 0 ? 'positive' : 'negative'}">
              Total Return: $${data.portfolioSummary.totalReturn.toLocaleString()} (${data.portfolioSummary.totalReturnPercent.toFixed(2)}%)
            </div>
            <div class="metric">Best: ${data.portfolioSummary.bestPerformer.symbol} (+${data.portfolioSummary.bestPerformer.return}%)</div>
            <div class="metric">Worst: ${data.portfolioSummary.worstPerformer.symbol} (${data.portfolioSummary.worstPerformer.return}%)</div>
          </div>

          <div class="section">
            <h2>Performance Metrics</h2>
            <div class="metric">Sharpe Ratio: ${data.performanceMetrics.sharpeRatio}</div>
            <div class="metric">Max Drawdown: ${data.performanceMetrics.maxDrawdown}%</div>
            <div class="metric">Volatility: ${data.performanceMetrics.volatility}%</div>
            <div class="metric">Win Rate: ${data.performanceMetrics.winRate}%</div>
          </div>

          <div class="section">
            <h2>Trade Analysis</h2>
            <div class="metric">Total Trades: ${data.tradeAnalysis.totalTrades}</div>
            <div class="metric">Profitable: ${data.tradeAnalysis.profitableTrades}</div>
            <div class="metric">Total Profit: $${data.tradeAnalysis.totalProfit.toLocaleString()}</div>
            <div class="metric">Total Loss: $${data.tradeAnalysis.totalLoss.toLocaleString()}</div>
          </div>
        </body>
      </html>
    `;
  }

  private static async generateCSVReport(data: ReportData, config: ReportConfig): Promise<string> {
    const csvData = [
      ['Report', config.name],
      ['Generated', data.metadata.generatedAt.toISOString()],
      [''],
      ['Portfolio Summary'],
      ['Total Value', data.portfolioSummary.totalValue],
      ['Total Return', data.portfolioSummary.totalReturn],
      ['Total Return %', data.portfolioSummary.totalReturnPercent],
      [''],
      ['Performance Metrics'],
      ['Sharpe Ratio', data.performanceMetrics.sharpeRatio],
      ['Max Drawdown', data.performanceMetrics.maxDrawdown],
      ['Volatility', data.performanceMetrics.volatility],
      ['Win Rate', data.performanceMetrics.winRate],
      [''],
      ['Trade Analysis'],
      ['Total Trades', data.tradeAnalysis.totalTrades],
      ['Profitable Trades', data.tradeAnalysis.profitableTrades],
      ['Total Profit', data.tradeAnalysis.totalProfit],
      ['Total Loss', data.tradeAnalysis.totalLoss]
    ];

    return csvData.map(row => row.join(',')).join('\n');
  }

  private static async sendReportEmail(config: ReportConfig, reportResult: any): Promise<void> {
    const mailOptions = {
      from: process.env.SMTP_FROM || 'reports@smarttrading.ai',
      to: config.delivery.emailRecipients.join(','),
      subject: `${config.name} - ${new Date().toDateString()}`,
      html: config.format === 'HTML' ? reportResult.html : await this.generateEmailDigest(config.userId),
      attachments: config.format === 'PDF' ? [{
        filename: `${config.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
        content: reportResult.buffer
      }] : []
    };

    await this.emailTransporter.sendMail(mailOptions);
  }

  private static async scheduleReport(config: ReportConfig): Promise<void> {
    // Implementation for scheduling reports using cron jobs or task scheduler
    // This would typically integrate with a job queue system
    console.log(`Scheduling ${config.frequency} report: ${config.name}`);
  }
}
