import { useQuery } from "@tanstack/react-query";
import { tradingApi } from "@/lib/trading-api";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Calendar, DollarSign, Brain } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function PortfolioOverview() {
  const { data: portfolio, isLoading } = useQuery({
    queryKey: ['/api/portfolio'],
    queryFn: tradingApi.getPortfolio,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="trading-card">
            <CardContent className="p-4">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-32 mb-1" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="trading-card">
          <CardContent className="p-4">
            <div className="text-center text-trading-neutral">
              <p>Portfolio data unavailable</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isPositiveDay = parseFloat(portfolio.dayPL) >= 0;
  const isPositiveTotal = parseFloat(portfolio.dayPLPercent) >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <Card className="trading-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-trading-neutral">Portfolio Value</span>
            <TrendingUp className="w-4 h-4 text-trading-green" />
          </div>
          <div className="text-2xl font-bold font-mono">
            ${parseFloat(portfolio.totalValue).toLocaleString()}
          </div>
          <div className={`text-sm ${isPositiveTotal ? 'text-trading-green' : 'text-trading-red'}`}>
            {isPositiveTotal ? '+' : ''}{portfolio.dayPLPercent}% 
            ({isPositiveDay ? '+' : ''}${parseFloat(portfolio.dayPL).toLocaleString()})
          </div>
        </CardContent>
      </Card>

      <Card className="trading-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-trading-neutral">Day P&L</span>
            <Calendar className="w-4 h-4 text-trading-warning" />
          </div>
          <div className="text-2xl font-bold font-mono">
            ${parseFloat(portfolio.dayPL).toLocaleString()}
          </div>
          <div className={`text-sm ${isPositiveDay ? 'text-trading-green' : 'text-trading-red'}`}>
            {isPositiveDay ? '+' : ''}{portfolio.dayPLPercent}%
          </div>
        </CardContent>
      </Card>

      <Card className="trading-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-trading-neutral">Buying Power</span>
            <DollarSign className="w-4 h-4 text-accent" />
          </div>
          <div className="text-2xl font-bold font-mono">
            ${parseFloat(portfolio.buyingPower).toLocaleString()}
          </div>
          <div className="text-sm text-trading-neutral">Available</div>
        </CardContent>
      </Card>

      <Card className="trading-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-trading-neutral">AI Confidence</span>
            <Brain className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-primary">87%</div>
          <div className="text-sm text-primary">High Confidence</div>
        </CardContent>
      </Card>
    </div>
  );
}
