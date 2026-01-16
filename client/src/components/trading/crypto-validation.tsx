
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { tradingApi } from "@/lib/trading-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Brain, TrendingUp, Users, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Represents the coin information within a crypto validation response
 */
interface CryptoCoinInfo {
  id: number;
  symbol: string;
  name: string;
  price: string;
}

/**
 * Represents a comprehensive AI-powered validation result for a cryptocurrency
 * This interface ensures type safety for the validation object that combines
 * social sentiment analysis, technical indicators, whale activity monitoring,
 * and overall AI recommendations to assess trading opportunities.
 */
interface CryptoValidation {
  /** Basic coin information */
  coin: CryptoCoinInfo;
  
  /** Social sentiment score (0-100) based on social media analysis */
  socialScore: number;
  
  /** Technical analysis score (0-100) based on price action and indicators */
  technicalScore: number;
  
  /** Whale activity score (0-100) tracking large wallet movements */
  whaleActivity: number;
  
  /** Overall combined score (0-100) aggregating all analysis factors */
  overallScore?: number;
  
  /** Detailed analysis of social media sentiment and trends */
  socialAnalysis: string;
  
  /** Detailed technical analysis including support/resistance levels */
  technicalAnalysis: string;
  
  /** Analysis of large holder activity and institutional interest */
  whaleAnalysis: string;
  
  /** Trading signal recommendation (e.g., "BUY", "SELL", "HOLD") */
  overallSignal: "BUY" | "SELL" | "HOLD" | "WATCH";
  
  /** AI confidence level (0-100) in the overall recommendation */
  overallConfidence: number;
  
  /** Comprehensive AI-generated trading recommendation summary */
  recommendation: string;
}

/**
 * Props for the CryptoValidation component
 */
interface CryptoValidationProps {
  coinId: number;
  /**
   * Callback function invoked when user initiates automated trade setup
   * @param validation - The complete validation data with type-safe structure
   */
  onTradeSetup: (validation: CryptoValidation) => void;
}

export function CryptoValidation({ coinId, onTradeSetup }: CryptoValidationProps) {
  const { data: validation, isLoading } = useQuery({
    queryKey: ['/api/crypto/validation', coinId],
    queryFn: () => tradingApi.getCryptoValidation(coinId),
    enabled: !!coinId,
  });

  if (isLoading) {
    return (
      <Card className="trading-card">
        <CardHeader>
          <CardTitle>AI Validation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!validation) {
    return (
      <Card className="trading-card">
        <CardHeader>
          <CardTitle>Select a coin to validate</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Choose a coin from the radar to see detailed AI validation.</p>
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
          <p className="text-sm text-muted-foreground">{validation.socialAnalysis}</p>
        </div>

        {/* Technical Analysis */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="h-4 w-4 text-green-500" />
            <h3 className="font-semibold">Technical Analysis</h3>
            <Badge variant="outline">{validation.technicalScore}/100</Badge>
          </div>
          <Progress value={validation.technicalScore} className="mb-2" />
          <p className="text-sm text-muted-foreground">{validation.technicalAnalysis}</p>
        </div>

        {/* Whale Activity */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-purple-500" />
            <h3 className="font-semibold">Whale Activity</h3>
            <Badge variant="outline">{validation.whaleActivity}/100</Badge>
          </div>
          <Progress value={validation.whaleActivity} className="mb-2" />
          <p className="text-sm text-muted-foreground">{validation.whaleAnalysis}</p>
        </div>

        {/* AI Recommendation */}
        <div className="border rounded-lg p-4 bg-primary/5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="h-4 w-4 text-primary" />
            <h3 className="font-semibold">AI Recommendation</h3>
            <Badge className="bg-primary text-white">{validation.overallSignal}</Badge>
          </div>
          <p className="text-sm mb-4">{validation.recommendation}</p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Overall Confidence:</span>
            <Badge variant="outline">{validation.overallConfidence}%</Badge>
          </div>
        </div>

        {/* Trade Setup Button */}
        <Button 
          onClick={() => onTradeSetup(validation)} 
          className="w-full"
          disabled={validation.overallSignal === 'SELL'}
        >
          Set Up Automated Trade
        </Button>
      </CardContent>
    </Card>
  );
}

// Export the type for use in other components
export type { CryptoValidation, CryptoCoinInfo };

export default CryptoValidation;
