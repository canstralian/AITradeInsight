import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tradingApi } from "@/lib/trading-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export function Watchlist() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: watchlist, isLoading } = useQuery({
    queryKey: ['/api/watchlist'],
    queryFn: tradingApi.getWatchlist,
  });

  const removeFromWatchlistMutation = useMutation({
    mutationFn: (stockId: number) => tradingApi.removeFromWatchlist(stockId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/watchlist'] });
      toast({
        title: "Stock removed from watchlist",
        description: "The stock has been successfully removed from your watchlist.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove stock from watchlist. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleRemoveFromWatchlist = (stockId: number) => {
    removeFromWatchlistMutation.mutate(stockId);
  };

  if (isLoading) {
    return (
      <Card className="trading-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Watchlist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <div>
                    <Skeleton className="h-4 w-20 mb-1" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <div className="text-right">
                  <Skeleton className="h-4 w-16 mb-1" />
                  <Skeleton className="h-3 w-12" />
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
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Watchlist</CardTitle>
          <Button
            variant="outline"
            size="sm"
            className="text-primary border-primary hover:bg-primary hover:text-primary-foreground"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {watchlist && watchlist.length > 0 ? (
          <div className="space-y-3">
            {watchlist.map((item) => {
              const isPositive = parseFloat(item.stock.change) >= 0;
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-background rounded-lg border border-border hover:border-primary transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                      <span className="text-primary font-mono text-sm font-bold">
                        {item.stock.symbol}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium">{item.stock.name}</div>
                      <div className="text-sm text-trading-neutral">{item.stock.sector}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <div className="font-mono">${item.stock.price}</div>
                      <div className={`text-sm ${isPositive ? 'text-trading-green' : 'text-trading-red'}`}>
                        {isPositive ? '+' : ''}{item.stock.changePercent}%
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFromWatchlist(item.stock.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={removeFromWatchlistMutation.isPending}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-trading-neutral">
            <p>Your watchlist is empty</p>
            <p className="text-sm mt-1">Add stocks to track their performance</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
