import { useQuery } from "@tanstack/react-query";
import { tradingApi } from "@/lib/trading-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function MarketSentiment() {
  const { data: sentiment, isLoading } = useQuery({
    queryKey: ["/api/sentiment"],
    queryFn: tradingApi.getMarketSentiment,
  });

  const getSentimentColor = (overall: string) => {
    switch (overall) {
      case "BULLISH":
        return "text-trading-green";
      case "BEARISH":
        return "text-trading-red";
      case "NEUTRAL":
        return "text-trading-neutral";
      default:
        return "text-trading-neutral";
    }
  };

  const getSentimentIcon = (overall: string) => {
    switch (overall) {
      case "BULLISH":
        return <TrendingUp className="w-4 h-4" />;
      case "BEARISH":
        return <TrendingDown className="w-4 h-4" />;
      case "NEUTRAL":
        return <Minus className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card className="trading-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Market Sentiment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-2 w-full" />
            <div className="grid grid-cols-3 gap-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-3 rounded-lg border">
                  <Skeleton className="h-6 w-8 mb-1" />
                  <Skeleton className="h-3 w-12" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!sentiment) {
    return (
      <Card className="trading-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Market Sentiment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-trading-neutral">
            <p>Market sentiment data unavailable</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="trading-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Market Sentiment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-trading-neutral">
              Overall Sentiment
            </span>
            <span
              className={`font-medium flex items-center gap-1 ${getSentimentColor(sentiment.overall)}`}
            >
              {getSentimentIcon(sentiment.overall)}
              {sentiment.overall}
            </span>
          </div>
          <div className="w-full bg-background rounded-full h-2">
            <div
              className="bg-trading-green h-2 rounded-full transition-all duration-300"
              style={{ width: `${sentiment.bullishPercent}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-secondary rounded-lg">
              <div className="text-xl font-bold text-trading-green">
                {sentiment.bullishPercent}%
              </div>
              <div className="text-xs text-trading-neutral">Bullish</div>
            </div>
            <div className="p-3 bg-secondary rounded-lg">
              <div className="text-xl font-bold text-trading-neutral">
                {sentiment.neutralPercent}%
              </div>
              <div className="text-xs text-trading-neutral">Neutral</div>
            </div>
            <div className="p-3 bg-secondary rounded-lg">
              <div className="text-xl font-bold text-trading-red">
                {sentiment.bearishPercent}%
              </div>
              <div className="text-xs text-trading-neutral">Bearish</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">Recent News Impact</div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-trading-green rounded-full" />
                <span className="text-sm text-trading-neutral">
                  Fed rate decision positive
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-trading-warning rounded-full" />
                <span className="text-sm text-trading-neutral">
                  Inflation data mixed
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-trading-green rounded-full" />
                <span className="text-sm text-trading-neutral">
                  Tech earnings strong
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
