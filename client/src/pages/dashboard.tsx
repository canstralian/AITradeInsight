
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/topbar";
import { PortfolioOverview } from "@/components/trading/portfolio-overview";
import { AIPredictions } from "@/components/trading/ai-predictions";
import { TradingSignals } from "@/components/trading/trading-signals";
import { Watchlist } from "@/components/trading/watchlist";
import { MarketSentiment } from "@/components/trading/market-sentiment";
import { PriceChart } from "@/components/trading/price-chart";
import { StockRecommendations } from "@/components/trading/stock-recommendations";
import { useIsMobile, useBreakpoint } from "@/hooks/use-mobile";

export function Dashboard() {
  const isMobile = useIsMobile();
  const breakpoint = useBreakpoint();

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-h-screen">
        <TopBar />
        
        {/* Main content with mobile-first responsive grid */}
        <main className="flex-1 p-3 sm:p-4 lg:p-6 overflow-y-auto scroll-smooth-mobile">
          <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
            {/* Portfolio Overview - Always full width on mobile */}
            <div className="w-full">
              <PortfolioOverview />
            </div>
            
            {/* Responsive grid based on breakpoint */}
            <div className={`
              grid gap-4 sm:gap-6
              ${breakpoint === 'mobile' 
                ? 'grid-cols-1' 
                : breakpoint === 'tablet' 
                  ? 'grid-cols-1 lg:grid-cols-2' 
                  : 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'
              }
            `}>
              {/* AI Predictions */}
              <div className={breakpoint === 'desktop' ? 'xl:col-span-2' : ''}>
                <AIPredictions />
              </div>
              
              {/* Trading Signals */}
              <div>
                <TradingSignals />
              </div>
              
              {/* Price Chart - Full width on mobile/tablet */}
              <div className={`
                ${breakpoint === 'mobile' || breakpoint === 'tablet' 
                  ? 'lg:col-span-2' 
                  : 'xl:col-span-3'
                }
              `}>
                <PriceChart />
              </div>
              
              {/* Watchlist */}
              <div>
                <Watchlist />
              </div>
              
              {/* Market Sentiment */}
              <div>
                <MarketSentiment />
              </div>
              
              {/* Stock Recommendations */}
              <div>
                <StockRecommendations />
              </div>
            </div>
          </div>
          
          {/* Bottom safe area padding for mobile */}
          <div className="safe-padding-bottom h-4 sm:h-0"></div>
        </main>
      </div>
    </div>
  );
}
