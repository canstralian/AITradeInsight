import { useQuery } from "@tanstack/react-query";
import { tradingApi } from "@/lib/trading-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function StockRecommendations() {
  const { data: recommendations, isLoading, refetch } = useQuery({
    queryKey: ['/api/recommendations'],
    queryFn: tradingApi.getRecommendations,
  });

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'BUY':
        return 'bg-trading-green text-trading-green';
      case 'SELL':
        return 'bg-trading-red text-trading-red';
      case 'HOLD':
        return 'bg-trading-warning text-trading-warning';
      case 'WATCH':
        return 'bg-trading-blue text-trading-blue';
      default:
        return 'bg-trading-neutral text-trading-neutral';
    }
  };

  const getSignalDotColor = (signal: string) => {
    switch (signal) {
      case 'BUY':
        return 'bg-trading-green';
      case 'SELL':
        return 'bg-trading-red';
      case 'HOLD':
        return 'bg-trading-warning';
      case 'WATCH':
        return 'bg-trading-blue';
      default:
        return 'bg-trading-neutral';
    }
  };

  if (isLoading) {
    return (
      <Card className="trading-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">AI Stock Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-background rounded-lg p-4 border">
                <div className="flex items-center justify-between mb-2">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-8" />
                </div>
                <Skeleton className="h-3 w-20 mb-2" />
                <Skeleton className="h-3 w-16 mb-2" />
                <Skeleton className="h-4 w-14 mb-1" />
                <Skeleton className="h-3 w-10" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="trading-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">AI Stock Recommendations</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="text-primary border-primary hover:bg-primary hover:text-primary-foreground"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {recommendations && recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {recommendations.map((recommendation) => {
              const isPositive = recommendation.stock && parseFloat(recommendation.stock.change) >= 0;
              return (
                <div
                  key={recommendation.id}
                  className="bg-background rounded-lg p-4 border border-border hover:border-primary transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-bold text-primary">
                      {recommendation.stock?.symbol}
                    </span>
                    <div className="flex items-center space-x-1">
                      <div className={`w-2 h-2 rounded-full ${getSignalDotColor(recommendation.signal)}`} />
                      <span className={`text-xs ${getSignalColor(recommendation.signal).split(' ')[1]}`}>
                        {recommendation.signal}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm mb-2 truncate" title={recommendation.stock?.name}>
                    {recommendation.stock?.name}
                  </div>
                  <div className="text-xs text-trading-neutral mb-2">
                    AI Score: <span className="text-primary">{recommendation.aiScore}/100</span>
                  </div>
                  <div className="text-sm font-mono">
                    ${recommendation.stock?.price}
                  </div>
                  <div className={`text-xs ${isPositive ? 'text-trading-green' : 'text-trading-red'}`}>
                    {isPositive ? '+' : ''}{recommendation.stock?.changePercent}%
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-trading-neutral">
            <p>No recommendations available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
