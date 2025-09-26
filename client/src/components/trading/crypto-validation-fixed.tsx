import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Brain, TrendingUp, Users, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface CryptoValidationProps {
  coinId: number;
  onTradeSetup: (coinData: any) => void;
}

export function CryptoValidation({
  coinId,
  onTradeSetup,
}: CryptoValidationProps) {
  // Mock validation data for now
  const validation = {
    coin: { symbol: "BTC" },
    socialScore: 85,
    socialAnalysis: "Strong positive sentiment across social platforms",
    technicalScore: 92,
    technicalAnalysis: "Bullish technical indicators with strong momentum",
    whaleActivity: 78,
    whaleAnalysis: "Large holders accumulating, low distribution risk",
    overallSignal: "BUY" as const,
    recommendation: "Strong buy signal with high confidence across all metrics",
    overallConfidence: 88,
  };

  if (!coinId) {
    return (
      <Card className="trading-card">
        <CardHeader>
          <CardTitle>Select a coin to validate</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Choose a coin from the radar to see detailed AI validation.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="trading-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Validation: {validation.coin?.symbol}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Social Insights */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-4 w-4 text-blue-500" />
            <h3 className="font-semibold">Social Insights</h3>
            <Badge variant="outline">{validation.socialScore}/100</Badge>
          </div>
          <Progress value={validation.socialScore} className="mb-2" />
          <p className="text-sm text-muted-foreground">
            {validation.socialAnalysis}
          </p>
        </div>

        {/* Technical Analysis */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="h-4 w-4 text-green-500" />
            <h3 className="font-semibold">Technical Analysis</h3>
            <Badge variant="outline">{validation.technicalScore}/100</Badge>
          </div>
          <Progress value={validation.technicalScore} className="mb-2" />
          <p className="text-sm text-muted-foreground">
            {validation.technicalAnalysis}
          </p>
        </div>

        {/* Whale Activity */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-purple-500" />
            <h3 className="font-semibold">Whale Activity</h3>
            <Badge variant="outline">{validation.whaleActivity}/100</Badge>
          </div>
          <Progress value={validation.whaleActivity} className="mb-2" />
          <p className="text-sm text-muted-foreground">
            {validation.whaleAnalysis}
          </p>
        </div>

        {/* AI Recommendation */}
        <div className="border rounded-lg p-4 bg-primary/5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="h-4 w-4 text-primary" />
            <h3 className="font-semibold">AI Recommendation</h3>
            <Badge className="bg-primary text-white">
              {validation.overallSignal}
            </Badge>
          </div>
          <p className="text-sm mb-4">{validation.recommendation}</p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Overall Confidence:
            </span>
            <Badge variant="outline">{validation.overallConfidence}%</Badge>
          </div>
        </div>

        {/* Trade Setup Button */}
        <Button
          onClick={() => onTradeSetup(validation)}
          className="w-full"
          disabled={validation.overallSignal === "SELL"}
        >
          Set Up Automated Trade
        </Button>
      </CardContent>
    </Card>
  );
}

export default CryptoValidation;
