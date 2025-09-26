import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { tradingApi } from "@/lib/trading-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, TrendingUp, AlertTriangle, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function StrategySearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [strategyType, setStrategyType] = useState("");
  const [riskLevel, setRiskLevel] = useState("");
  const [searchMode, setSearchMode] = useState<"text" | "filter">("text");

  // Text search query
  const {
    data: searchResults,
    isLoading: isSearchLoading,
    refetch: refetchSearch,
  } = useQuery({
    queryKey: ["/api/strategies/search", searchQuery],
    queryFn: () => tradingApi.searchTradingStrategies(searchQuery),
    enabled: searchMode === "text" && searchQuery.length > 2,
  });

  // Filter-based search query
  const {
    data: filterResults,
    isLoading: isFilterLoading,
    refetch: refetchFilter,
  } = useQuery({
    queryKey: ["/api/strategies/filter", strategyType, riskLevel],
    queryFn: () => tradingApi.searchByStrategyType(strategyType, riskLevel),
    enabled: searchMode === "filter" && !!strategyType,
  });

  // Recommended strategies
  const { data: recommendedStrategies, isLoading: isRecommendedLoading } =
    useQuery({
      queryKey: ["/api/strategies/recommended"],
      queryFn: () => tradingApi.getRecommendedStrategies(),
    });

  const handleSearch = () => {
    if (searchMode === "text") {
      refetchSearch();
    } else {
      refetchFilter();
    }
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case "low":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const currentResults = searchMode === "text" ? searchResults : filterResults;
  const isLoading = searchMode === "text" ? isSearchLoading : isFilterLoading;

  return (
    <div className="space-y-6">
      <Card className="trading-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Trading Strategy Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 mb-4">
            <Button
              variant={searchMode === "text" ? "default" : "outline"}
              onClick={() => setSearchMode("text")}
              size="sm"
            >
              Text Search
            </Button>
            <Button
              variant={searchMode === "filter" ? "default" : "outline"}
              onClick={() => setSearchMode("filter")}
              size="sm"
            >
              Filter Search
            </Button>
          </div>

          {searchMode === "text" ? (
            <div className="flex gap-2">
              <Input
                placeholder="Search trading strategies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={searchQuery.length < 3}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select value={strategyType} onValueChange={setStrategyType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select strategy type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="momentum">Momentum</SelectItem>
                  <SelectItem value="mean_reversion">Mean Reversion</SelectItem>
                  <SelectItem value="breakout">Breakout</SelectItem>
                  <SelectItem value="scalping">Scalping</SelectItem>
                  <SelectItem value="swing_trading">Swing Trading</SelectItem>
                  <SelectItem value="day_trading">Day Trading</SelectItem>
                </SelectContent>
              </Select>

              <Select value={riskLevel} onValueChange={setRiskLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select risk level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={handleSearch}
                disabled={!strategyType}
                className="md:col-span-2"
              >
                Search Strategies
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommended Strategies */}
      <Card className="trading-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Recommended Strategies
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isRecommendedLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4">
              {recommendedStrategies
                ?.slice(0, 3)
                .map((strategy: any, index: number) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold">
                          {strategy.name || strategy.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {strategy.description || strategy.summary}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        {strategy.risk_level && (
                          <Badge
                            className={getRiskBadgeColor(strategy.risk_level)}
                          >
                            {strategy.risk_level}
                          </Badge>
                        )}
                        {strategy.win_rate && (
                          <Badge variant="outline">
                            {strategy.win_rate}% Win Rate
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Results */}
      {currentResults && (
        <Card className="trading-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Search Results ({currentResults.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {currentResults.map((strategy: any, index: number) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold">
                          {strategy.name || strategy.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {strategy.description || strategy.summary}
                        </p>
                        {strategy.key_features && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {strategy.key_features
                              .slice(0, 3)
                              .map((feature: string, i: number) => (
                                <Badge
                                  key={i}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {feature}
                                </Badge>
                              ))}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        {strategy.risk_level && (
                          <Badge
                            className={getRiskBadgeColor(strategy.risk_level)}
                          >
                            {strategy.risk_level}
                          </Badge>
                        )}
                        {strategy.win_rate && (
                          <Badge variant="outline">
                            {strategy.win_rate}% Win Rate
                          </Badge>
                        )}
                        {strategy.avg_return && (
                          <Badge variant="outline">
                            {strategy.avg_return}% Return
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default StrategySearch;
