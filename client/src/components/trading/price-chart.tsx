import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { tradingApi } from "@/lib/trading-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";

export function PriceChart() {
  const [selectedStock, setSelectedStock] = useState("AAPL");
  const [timeframe, setTimeframe] = useState("1D");
  const chartRef = useRef<HTMLCanvasElement>(null);

  const { data: chartData, isLoading } = useQuery({
    queryKey: ['/api/chart', selectedStock],
    queryFn: () => tradingApi.getChartData(selectedStock),
  });

  const { data: stocks } = useQuery({
    queryKey: ['/api/stocks'],
    queryFn: tradingApi.getStocks,
  });

  useEffect(() => {
    if (chartData && chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      if (!ctx) return;

      // Clear previous chart
      ctx.clearRect(0, 0, chartRef.current.width, chartRef.current.height);

      // Draw chart
      const width = chartRef.current.width;
      const height = chartRef.current.height;
      const padding = 40;
      const chartWidth = width - 2 * padding;
      const chartHeight = height - 2 * padding;

      // Calculate price range
      const prices = chartData.map(d => parseFloat(d.price));
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const priceRange = maxPrice - minPrice;

      // Draw grid lines
      ctx.strokeStyle = 'rgba(116, 125, 140, 0.1)';
      ctx.lineWidth = 1;
      
      for (let i = 0; i <= 4; i++) {
        const y = padding + (i * chartHeight) / 4;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
      }

      // Draw price line
      ctx.strokeStyle = 'var(--trading-green)';
      ctx.lineWidth = 2;
      ctx.beginPath();

      chartData.forEach((point, index) => {
        const x = padding + (index * chartWidth) / (chartData.length - 1);
        const y = padding + ((maxPrice - parseFloat(point.price)) / priceRange) * chartHeight;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();

      // Draw current price line
      if (chartData.length > 0) {
        const lastPrice = parseFloat(chartData[chartData.length - 1].price);
        const y = padding + ((maxPrice - lastPrice) / priceRange) * chartHeight;
        
        ctx.strokeStyle = 'var(--trading-blue)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(width - padding, y);
        ctx.lineTo(width - padding + 20, y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Price label
        ctx.fillStyle = 'var(--trading-blue)';
        ctx.font = '12px monospace';
        ctx.fillText(`$${lastPrice.toFixed(2)}`, width - padding + 25, y + 4);
      }
    }
  }, [chartData]);

  return (
    <Card className="trading-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Price Chart & AI Predictions</CardTitle>
          <div className="flex items-center space-x-2">
            <Select value={selectedStock} onValueChange={setSelectedStock}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {stocks?.map((stock) => (
                  <SelectItem key={stock.id} value={stock.symbol}>
                    {stock.symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex space-x-1">
              <Button
                variant={timeframe === "1D" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeframe("1D")}
              >
                1D
              </Button>
              <Button
                variant={timeframe === "5D" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeframe("5D")}
              >
                5D
              </Button>
              <Button
                variant={timeframe === "1M" ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeframe("1M")}
              >
                1M
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-96 bg-background rounded-lg border border-border relative">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center text-trading-neutral">
              <div className="text-center">
                <BarChart3 className="w-8 h-8 mx-auto mb-2" />
                <p>Loading chart data...</p>
              </div>
            </div>
          ) : (
            <canvas
              ref={chartRef}
              width={800}
              height={384}
              className="w-full h-full"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
