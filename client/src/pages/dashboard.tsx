import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, DollarSign, Activity, Target, Zap, Brain, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import AIPredictions from "@/components/trading/ai-predictions";
import { TradingSignals } from "@/components/trading/trading-signals";
import { MarketSentiment } from "@/components/trading/market-sentiment";
import { PortfolioOverview } from "@/components/trading/portfolio-overview";
import { Watchlist } from "@/components/trading/watchlist";
import { StockRecommendations } from "@/components/trading/stock-recommendations";
import Sidebar from "@/components/layout/sidebar";
import Topbar from "@/components/layout/topbar";
import PriceChart from "@/components/trading/price-chart";

export default function Dashboard() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("1D");

  // Mock data - replace with actual API calls
  const portfolioValue = 125340.50;
  const dailyChange = 2.8;
  const dailyChangeAmount = 3421.75;

  const stats = [
    {
      title: "Portfolio Value",
      value: `$${portfolioValue.toLocaleString()}`,
      change: `+$${dailyChangeAmount.toLocaleString()}`,
      changePercent: `+${dailyChange}%`,
      icon: DollarSign,
      trend: "up",
      description: "Total portfolio value"
    },
    {
      title: "Active Positions",
      value: "12",
      change: "+2",
      changePercent: "+20%",
      icon: Activity,
      trend: "up",
      description: "Currently held stocks"
    },
    {
      title: "AI Accuracy",
      value: "89.2%",
      change: "+1.4%",
      changePercent: "+1.6%",
      icon: Brain,
      trend: "up",
      description: "7-day prediction accuracy"
    },
    {
      title: "Risk Score",
      value: "Moderate",
      change: "Stable",
      changePercent: "0%",
      icon: Target,
      trend: "neutral",
      description: "Portfolio risk assessment"
    }
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="backdrop-blur-glass rounded-xl p-6 border border-border/50">
              <h1 className="text-3xl font-bold gradient-text">Trading Dashboard</h1>
              <p className="text-muted-foreground">
                Monitor your portfolio and market insights with AI-powered analytics
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <PriceChart />
              </div>
              <div>
                <PortfolioOverview />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AIPredictions />
              <TradingSignals />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MarketSentiment />
              <Watchlist />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}