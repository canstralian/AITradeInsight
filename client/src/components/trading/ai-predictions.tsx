import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { tradingApi } from "@/lib/trading-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function AiPredictions() {
  const [selectedStockId, setSelectedStockId] = useState<number>(1);

  const { data: predictions, isLoading } = useQuery({
    queryKey: ['/api/predictions'],
    queryFn: tradingApi.getAiPredictions,
  });

  const { data: stocks } = useQuery({
    queryKey: ['/api/stocks'],
    queryFn: tradingApi.getStocks,
  });

  const selectedPrediction = predictions?.find(p => p.stockId === selectedStockId);
  const selectedStock = stocks?.find(s => s.id === selectedStockId);

  if (isLoading) {
    return (
      <Card className="trading-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">AI Price Prediction</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-4 w-32 mx-auto" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="trading-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            AI Price Prediction
          </CardTitle>
          <Select value={selectedStockId.toString()} onValueChange={(value) => setSelectedStockId(parseInt(value))}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {stocks?.map((stock) => (
                <SelectItem key={stock.id} value={stock.id.toString()}>
                  {stock.symbol}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {selectedPrediction && selectedStock ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-trading-neutral">Current Price</span>
              <span className="font-mono">${selectedStock.price}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-trading-neutral">24h Prediction</span>
              <span className="font-mono text-trading-green">${selectedPrediction.prediction24h}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-trading-neutral">7d Prediction</span>
              <span className="font-mono text-trading-green">${selectedPrediction.prediction7d}</span>
            </div>
            <div className="ai-confidence-bar">
              <div 
                className="ai-confidence-fill" 
                style={{ width: `${selectedPrediction.confidence}%` }}
              />
            </div>
            <div className="text-xs text-trading-neutral text-center">
              {selectedPrediction.confidence}% Confidence Score
            </div>
          </div>
        ) : (
          <div className="text-center text-trading-neutral">
            <p>No prediction data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AiPredictions;
