import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Radar, Eye, Zap, TrendingUp, Search } from "lucide-react";
import CryptoRadar from "@/components/trading/crypto-radar";
import CryptoValidation from "@/components/trading/crypto-validation";
import { AutomatedTrading } from "@/components/trading/automated-trading";
import { StrategySearch } from "@/components/trading/strategy-search";

export default function CryptoDashboard() {
  const [selectedCoinId, setSelectedCoinId] = useState<number | null>(null);
  const [validatedCoin, setValidatedCoin] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("discover");

  const handleCoinSelect = (coinId: number) => {
    setSelectedCoinId(coinId);
    setActiveTab("validate");
  };

  const handleTradeSetup = (coinData: any) => {
    setValidatedCoin(coinData);
    setActiveTab("trade");
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Crypto Trading Assistant</h1>
        <p className="text-muted-foreground">
          Discover → Validate → Trade with AI-powered insights
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="discover" className="flex items-center gap-2">
            <Radar className="h-4 w-4" />
            Discover
          </TabsTrigger>
          <TabsTrigger value="validate" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Validate
          </TabsTrigger>
          <TabsTrigger value="trade" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Trade
          </TabsTrigger>
          <TabsTrigger value="strategies" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Strategy Search
            </TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>🔍 Discover Top Coins</CardTitle>
              <CardDescription>
                Find top coins using our Radars — powered by whale tracking, social media trends, and real-time technical analysis.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CryptoRadar />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>✅ Validate Your Selection</CardTitle>
              <CardDescription>
                Dive deeper into each coin with AI-backed social and technical insights. Know what's pumping and why.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CryptoValidation coinId={selectedCoinId || 1} onTradeSetup={handleTradeSetup} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trade" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>⚡️ Automated Trading</CardTitle>
              <CardDescription>
                Let the AI handle it — set automated SL/TPs tailored to each coin. One click, fully optimized.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AutomatedTrading coinData={validatedCoin} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="strategies" className="space-y-6">
            <StrategySearch />
          </TabsContent>
      </Tabs>

      <div className="mt-8 text-center">
        <p className="text-lg font-semibold text-primary">
          Boom. Done. Full control. Zero stress.
        </p>
      </div>
    </div>
  );
}