import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/topbar";
import { PortfolioOverview } from "@/components/trading/portfolio-overview";
import { PriceChart } from "@/components/trading/price-chart";
import { AiPredictions } from "@/components/trading/ai-predictions";
import { TradingSignals } from "@/components/trading/trading-signals";
import { Watchlist } from "@/components/trading/watchlist";
import { MarketSentiment } from "@/components/trading/market-sentiment";
import { StockRecommendations } from "@/components/trading/stock-recommendations";

export default function Dashboard() {
  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 overflow-hidden">
        <TopBar />
        <div className="p-6 overflow-y-auto h-full">
          {/* Portfolio Overview */}
          <PortfolioOverview />
          
          {/* AI Predictions & Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <PriceChart />
            </div>
            <div className="space-y-6">
              <AiPredictions />
              <TradingSignals />
            </div>
          </div>
          
          {/* Watchlist & Market Sentiment */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Watchlist />
            <MarketSentiment />
          </div>
          
          {/* AI Stock Recommendations */}
          <StockRecommendations />
        </div>
      </div>
    </div>
  );
}
