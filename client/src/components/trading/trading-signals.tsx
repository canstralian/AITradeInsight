import { useQuery } from "@tanstack/react-query";
import { tradingApi } from "@/lib/trading-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function TradingSignals() {
  const { data: signals, isLoading } = useQuery({
    queryKey: ['/api/signals'],
    queryFn: tradingApi.getTradingSignals,
  });

  const getSignalColor = (signalType: string) => {
    switch (signalType) {
      case 'BUY':
        return 'trading-signal-buy';
      case 'SELL':
        return 'trading-signal-sell';
      case 'HOLD':
        return 'trading-signal-hold';
      case 'WATCH':
        return 'trading-signal-watch';
      default:
        return 'trading-signal-hold';
    }
  };

  const getSignalDotColor = (signalType: string) => {
    switch (signalType) {
      case 'BUY':
        return 'bg-trading-green';
      case 'SELL':
        return 'bg-trading-red';
      case 'HOLD':
        return 'bg-trading-warning';
      case 'WATCH':
        return 'bg-trading-blue';
      default:
        return 'bg-trading-warning';
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
            <div key={signal.id} className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${getSignalDotColor(signal.signalType)}`} />
                <div>
                  <p className="font-medium">{signal.stock?.symbol}</p>
                  <p className="text-sm text-gray-600">{signal.signalType}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{signal.confidence}%</p>
                <p className="text-xs text-gray-500">{new Date(signal.generatedAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default TradingSignals;

  if (isLoading) {
    return (
      <Card className="trading-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">AI Trading Signals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-3 rounded-lg border">
                <Skeleton className="w-2 h-2 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-20 mb-1" />
                  <Skeleton className="h-3 w-32" />
                </div>
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
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          AI Trading Signals
        </CardTitle>
      </CardHeader>
      <CardContent>
        {signals && signals.length > 0 ? (
          <div className="space-y-3">
            {signals.map((signal) => (
              <div
                key={signal.id}
                className={`flex items-center space-x-3 p-3 rounded-lg border ${getSignalColor(signal.signalType)}`}
              >
                <div className={`w-2 h-2 rounded-full ${getSignalDotColor(signal.signalType)}`} />
                <div className="flex-1">
                  <div className="text-sm font-medium">
                    {signal.signalType} Signal
                  </div>
                  <div className="text-xs text-trading-neutral">
                    {signal.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-trading-neutral">
            <p>No trading signals available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
