import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tradingApi } from "@/lib/trading-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Zap, Settings, TrendingUp, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CryptoValidation } from "./crypto-validation";

interface AutomatedTradingProps {
  /**
   * Validated cryptocurrency data used for setting up automated trades
   * Includes AI analysis, scores, and recommendations
   */
  coinData?: CryptoValidation;
}

export function AutomatedTrading({ coinData }: AutomatedTradingProps) {
  const [amount, setAmount] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: trades, isLoading } = useQuery({
    queryKey: ["/api/trading/automated"],
    queryFn: tradingApi.getAutomatedTrades,
  });

  const createTradeMutation = useMutation({
    mutationFn: tradingApi.createAutomatedTrade,
    onSuccess: () => {
      toast({
        title: "Trade Created",
        description: "Your automated trade has been set up successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/trading/automated"] });
      setAmount("");
      setStopLoss("");
      setTakeProfit("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create automated trade. Please try again.",
        variant: "destructive",
      });
    },
  });

  const cancelTradeMutation = useMutation({
    mutationFn: tradingApi.cancelAutomatedTrade,
    onSuccess: () => {
      toast({
        title: "Trade Cancelled",
        description: "Your automated trade has been cancelled.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/trading/automated"] });
    },
  });

  const handleCreateTrade = () => {
    if (!coinData || !amount || !stopLoss || !takeProfit) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createTradeMutation.mutate({
      coinId: coinData.coin.id,
      tradeType: "BUY",
      amount: parseFloat(amount),
      price: parseFloat(coinData.coin.price),
      stopLoss: parseFloat(stopLoss),
      takeProfit: parseFloat(takeProfit),
    });
  };

  const calculateOptimalLevels = () => {
    if (coinData?.coin?.price) {
      const price = parseFloat(coinData.coin.price);
      const confidence = coinData.overallConfidence || 70;

      // AI-optimized levels based on confidence and volatility
      const volatilityFactor = Math.min(confidence / 100, 0.8);
      const stopLossLevel = price * (1 - 0.1 * volatilityFactor);
      const takeProfitLevel = price * (1 + 0.2 * volatilityFactor);

      setStopLoss(stopLossLevel.toFixed(6));
      setTakeProfit(takeProfitLevel.toFixed(6));
    }
  };

  const getTradeStatusColor = (status: string) => {
    switch (status) {
      case "EXECUTED":
        return "bg-trading-green";
      case "PENDING":
        return "bg-trading-warning";
      case "CANCELLED":
        return "bg-trading-red";
      default:
        return "bg-trading-neutral";
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Trade Setup */}
      <Card className="trading-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Automated Trade Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {coinData ? (
            <>
              <div className="border rounded-lg p-4 bg-primary/5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{coinData.coin.symbol}</h3>
                  <Badge className="bg-primary text-white">
                    {coinData.overallSignal}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {coinData.coin.name}
                </p>
                <div className="flex items-center gap-4">
                  <span className="text-sm">Price: ${coinData.coin.price}</span>
                  <span className="text-sm">
                    Confidence: {coinData.overallConfidence}%
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="amount">Amount to Trade</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="stopLoss">Stop Loss</Label>
                    <Input
                      id="stopLoss"
                      type="number"
                      placeholder="0.00"
                      value={stopLoss}
                      onChange={(e) => setStopLoss(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="takeProfit">Take Profit</Label>
                    <Input
                      id="takeProfit"
                      type="number"
                      placeholder="0.00"
                      value={takeProfit}
                      onChange={(e) => setTakeProfit(e.target.value)}
                    />
                  </div>
                </div>

                <Button
                  onClick={calculateOptimalLevels}
                  variant="outline"
                  className="w-full"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  AI Optimize Levels
                </Button>

                <Button
                  onClick={handleCreateTrade}
                  className="w-full"
                  disabled={createTradeMutation.isPending}
                >
                  {createTradeMutation.isPending
                    ? "Creating..."
                    : "Create Automated Trade"}
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Select a validated coin to set up automated trading.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Trades */}
      <Card className="trading-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Active Trades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trades?.map((trade: any) => (
              <div key={trade.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{trade.coin?.symbol}</span>
                    <Badge className={getTradeStatusColor(trade.status)}>
                      {trade.status}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => cancelTradeMutation.mutate(trade.id)}
                    disabled={trade.status !== "PENDING"}
                  >
                    Cancel
                  </Button>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span>
                      {trade.amount} {trade.coin?.symbol}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Entry Price:</span>
                    <span>${trade.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Stop Loss:</span>
                    <span>${trade.stopLoss}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Take Profit:</span>
                    <span>${trade.takeProfit}</span>
                  </div>
                </div>
              </div>
            ))}
            {(!trades || trades.length === 0) && (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No active trades</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AutomatedTrading;
