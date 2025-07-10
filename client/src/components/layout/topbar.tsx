import { useState } from "react";
import { Search, Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { tradingApi } from "@/lib/trading-api";

export function TopBar() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: searchResults } = useQuery({
    queryKey: ['/api/stocks/search', searchQuery],
    queryFn: () => searchQuery ? tradingApi.searchStocks(searchQuery) : Promise.resolve([]),
    enabled: searchQuery.length > 0,
  });

  return (
    <div className="bg-trading-surface border-b border-border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-trading-neutral w-4 h-4" />
            <Input
              type="text"
              placeholder="Search stocks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-background border-border focus:border-primary"
            />
            {searchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                {searchResults.map((stock) => (
                  <div
                    key={stock.id}
                    className="px-3 py-2 hover:bg-trading-surface cursor-pointer flex items-center justify-between"
                    onClick={() => setSearchQuery("")}
                  >
                    <div>
                      <span className="font-mono font-bold text-primary">{stock.symbol}</span>
                      <span className="ml-2 text-sm text-trading-neutral">{stock.name}</span>
                    </div>
                    <span className="font-mono text-sm">${stock.price}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-trading-green rounded-full"></div>
              <span className="text-trading-neutral">Market Open</span>
            </div>
            <span className="text-trading-neutral">|</span>
            <span className="text-trading-neutral font-mono">
              {new Date().toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                timeZoneName: 'short'
              })}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="sm"
            className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
          >
            <Bell className="w-4 h-4 mr-2" />
            Alerts
          </Button>
          <Button 
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/80"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Trade
          </Button>
        </div>
      </div>
    </div>
  );
}
