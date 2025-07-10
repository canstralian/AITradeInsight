
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
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 border-b">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <div className="relative px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
                <Zap className="w-4 h-4" />
                AI-Powered Trading Intelligence
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Trading Dashboard
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Make smarter investment decisions with AI-driven insights and real-time market analysis
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card 
              key={stat.title} 
              className={cn(
                "group relative overflow-hidden border-0 bg-gradient-to-br from-card to-card/50 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]",
                "before:absolute before:inset-0 before:bg-gradient-to-br before:from-primary/5 before:to-transparent before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={cn(
                  "h-5 w-5 transition-colors duration-300",
                  stat.trend === "up" && "text-trading-green",
                  stat.trend === "down" && "text-trading-red",
                  stat.trend === "neutral" && "text-trading-neutral"
                )} />
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <div className="flex items-center gap-2 text-sm">
                  <span className={cn(
                    "flex items-center gap-1 font-medium",
                    stat.trend === "up" && "text-trading-green",
                    stat.trend === "down" && "text-trading-red",
                    stat.trend === "neutral" && "text-trading-neutral"
                  )}>
                    {stat.trend === "up" && <TrendingUp className="w-3 h-3" />}
                    {stat.trend === "down" && <TrendingDown className="w-3 h-3" />}
                    {stat.change}
                  </span>
                  <span className="text-muted-foreground">({stat.changePercent})</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <TabsList className="grid w-full max-w-md grid-cols-4 bg-muted/50 backdrop-blur-sm">
              <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
              <TabsTrigger value="signals" className="text-xs sm:text-sm">Signals</TabsTrigger>
              <TabsTrigger value="ai" className="text-xs sm:text-sm">AI Insights</TabsTrigger>
              <TabsTrigger value="portfolio" className="text-xs sm:text-sm">Portfolio</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
                {["1D", "1W", "1M", "3M"].map((timeframe) => (
                  <Button
                    key={timeframe}
                    variant={selectedTimeframe === timeframe ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setSelectedTimeframe(timeframe)}
                    className="h-8 px-3 text-xs"
                  >
                    {timeframe}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card className="trading-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      Market Overview
                    </CardTitle>
                    <CardDescription>
                      Real-time market sentiment and trending stocks
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <MarketSentiment />
                  </CardContent>
                </Card>
                
                <Card className="trading-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-primary" />
                      Top Recommendations
                    </CardTitle>
                    <CardDescription>
                      AI-powered stock recommendations based on market analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <StockRecommendations />
                  </CardContent>
                </Card>
              </div>
              
              <div className="space-y-6">
                <Card className="trading-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-primary" />
                      Watchlist
                    </CardTitle>
                    <CardDescription>
                      Your tracked stocks and alerts
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Watchlist />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="signals" className="space-y-6">
            <Card className="trading-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Trading Signals
                </CardTitle>
                <CardDescription>
                  Real-time buy/sell signals powered by advanced algorithms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TradingSignals />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            <Card className="trading-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  AI Predictions
                </CardTitle>
                <CardDescription>
                  Machine learning predictions and market forecasts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AIPredictions />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-6">
            <Card className="trading-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  Portfolio Performance
                </CardTitle>
                <CardDescription>
                  Detailed portfolio analysis and performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PortfolioOverview />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
