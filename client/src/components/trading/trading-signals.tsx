import { useQuery } from "@tanstack/react-query";
import { tradingApi } from "@/lib/trading-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function TradingSignals() {
  const { data: signals, isLoading } = useQuery({
    queryKey: ["/api/signals"],
    queryFn: tradingApi.getTradingSignals,
  });

  const getSignalColor = (signalType: string) => {
    switch (signalType) {
      case "BUY":
        return "trading-signal-buy";
      case "SELL":
        return "trading-signal-sell";
      case "HOLD":
        return "trading-signal-hold";
      case "WATCH":
        return "trading-signal-watch";
      default:
        return "trading-signal-hold";
    }
  };

  const getSignalDotColor = (signalType: string) => {
    switch (signalType) {
      case "BUY":
        return "bg-trading-green";
      case "SELL":
        return "bg-trading-red";
      case "HOLD":
        return "bg-trading-warning";
      case "WATCH":
        return "bg-trading-blue";
      default:
        return "bg-trading-warning";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Trading Signals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Trading Signals
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {signals?.map((signal: any) => (
            <div
              key={signal.id}
              className="flex items-center justify-between p-3 rounded-lg border"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${getSignalDotColor(signal.signalType)}`}
                />
                <div>
                  <p className="font-medium">{signal.stock?.symbol}</p>
                  <p className="text-sm text-gray-600">{signal.signalType}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{signal.confidence}%</p>
                <p className="text-xs text-gray-500">
                  {new Date(signal.generatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default TradingSignals;
