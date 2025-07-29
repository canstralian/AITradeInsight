import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Zap } from "lucide-react";

interface CryptoCurrency {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume: number;
  marketCap: number;
}

function CryptoRadar() {
  const [cryptoData] = useState<CryptoCurrency[]>([
    {
      symbol: "BTC",
      name: "Bitcoin",
      price: 43250.00,
      change24h: 2.5,
      volume: 28500000000,
      marketCap: 850000000000,
    },
    {
      symbol: "ETH",
      name: "Ethereum",
      price: 2580.00,
      change24h: -1.2,
      volume: 15200000000,
      marketCap: 310000000000,
    },
    {
      symbol: "BNB",
      name: "BNB",
      price: 315.50,
      change24h: 0.8,
      volume: 1800000000,
      marketCap: 47000000000,
    },
  ]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatVolume = (volume: number) => {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      compactDisplay: 'short',
    }).format(volume);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Crypto Radar
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {cryptoData.map((crypto) => (
            <div key={crypto.symbol} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-orange-600">
                    {crypto.symbol.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{crypto.name}</p>
                  <p className="text-sm text-muted-foreground">{crypto.symbol}</p>
                </div>
              </div>

              <div className="text-right">
                <p className="font-medium">{formatPrice(crypto.price)}</p>
                <div className="flex items-center gap-1">
                  {crypto.change24h > 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <Badge 
                    variant={crypto.change24h > 0 ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {crypto.change24h > 0 ? "+" : ""}{crypto.change24h.toFixed(2)}%
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Market data updates every 30 seconds
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default CryptoRadar;