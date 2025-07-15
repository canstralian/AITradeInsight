
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { tradingApi } from "@/lib/trading-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Radar, TrendingUp, Users, BarChart3 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function CryptoRadar() {
  const [selectedRadar, setSelectedRadar] = useState<string>("all");

  const { data: radarData, isLoading } = useQuery({
    queryKey: ['/api/crypto/radar', selectedRadar],
    queryFn: () => tradingApi.getCryptoRadar(selectedRadar === "all" ? undefined : selectedRadar),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const getRadarIcon = (type: string) => {
    switch (type) {
      case 'whale':
        return <TrendingUp className="h-4 w-4" />;
      case 'social':
        return <Users className="h-4 w-4" />;
      case 'technical':
        return <BarChart3 className="h-4 w-4" />;
      default:
        return <Radar className="h-4 w-4" />;
    }
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'BUY':
        return 'bg-trading-green text-white';
      case 'SELL':
        return 'bg-trading-red text-white';
      case 'WATCH':
        return 'bg-trading-blue text-white';
      default:
        return 'bg-trading-warning text-white';
    }
  };

  if (isLoading) {
    return (
      <Card className="trading-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radar className="h-5 w-5" />
            Crypto Radar Discovery
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="trading-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Radar className="h-5 w-5" />
          Crypto Radar Discovery
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedRadar} onValueChange={setSelectedRadar} className="mb-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Radars</TabsTrigger>
            <TabsTrigger value="whale">Whale Tracking</TabsTrigger>
            <TabsTrigger value="social">Social Trends</TabsTrigger>
            <TabsTrigger value="technical">Technical</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-4">
          {radarData?.map((radar: any) => (
            <div key={radar.id} className="border rounded-lg p-4 hover:border-primary transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getRadarIcon(radar.radarType)}
                  <div>
                    <h3 className="font-semibold">{radar.coin?.symbol}</h3>
                    <p className="text-sm text-muted-foreground">{radar.coin?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getSignalColor(radar.signal)}>
                    {radar.signal}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {radar.confidence}%
                  </span>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-3">{radar.reasoning}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-trading-green">
                    ${parseFloat(radar.coin?.price).toFixed(6)}
                  </span>
                  <span className={parseFloat(radar.coin?.change24h) >= 0 ? 'text-trading-green' : 'text-trading-red'}>
                    {parseFloat(radar.coin?.change24h) >= 0 ? '+' : ''}{radar.coin?.changePercent24h}%
                  </span>
                </div>
                <Button size="sm" variant="outline">
                  Validate
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default CryptoRadar;
