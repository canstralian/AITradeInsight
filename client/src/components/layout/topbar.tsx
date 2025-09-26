import { useState } from "react";
import { Search, Bell, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { tradingApi } from "@/lib/trading-api";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileMenuTrigger } from "./sidebar";

export default function TopBar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const isMobile = useIsMobile();

  const { data: searchResults } = useQuery({
    queryKey: ["/api/stocks/search", searchQuery],
    queryFn: () =>
      searchQuery ? tradingApi.searchStocks(searchQuery) : Promise.resolve([]),
    enabled: searchQuery.length > 0,
  });

  return (
    <div className="bg-trading-surface border-b border-border">
      <div className="px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Left section */}
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
            {/* Mobile menu trigger */}
            <div className="lg:hidden">
              <MobileMenuTrigger />
            </div>

            {/* Search */}
            <div
              className={`relative flex-1 max-w-md transition-all duration-200 ${
                isMobile && isSearchExpanded
                  ? "fixed inset-x-3 top-3 z-50 bg-background border border-border rounded-lg p-2"
                  : ""
              }`}
            >
              {isMobile && isSearchExpanded && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsSearchExpanded(false);
                    setSearchQuery("");
                  }}
                  className="absolute right-2 top-2 z-10"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}

              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-trading-neutral w-4 h-4 cursor-pointer"
                  onClick={() => isMobile && setIsSearchExpanded(true)}
                />
                <Input
                  type="text"
                  placeholder={isMobile ? "Search..." : "Search stocks..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => isMobile && setIsSearchExpanded(true)}
                  className={`
                    pl-10 pr-4 py-2 bg-background border-border focus:border-primary
                    transition-all duration-200 touch-manipulation
                    ${isMobile && !isSearchExpanded ? "w-8 opacity-0 pointer-events-none" : ""}
                  `}
                />

                {/* Search results dropdown */}
                {searchResults && searchResults.length > 0 && searchQuery && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                    {searchResults.map((stock) => (
                      <div
                        key={stock.id}
                        className="px-3 py-3 hover:bg-trading-surface cursor-pointer flex items-center justify-between touch-manipulation"
                        onClick={() => {
                          setSearchQuery("");
                          setIsSearchExpanded(false);
                        }}
                      >
                        <div className="min-w-0 flex-1">
                          <span className="font-mono font-bold text-primary">
                            {stock.symbol}
                          </span>
                          <span className="ml-2 text-sm text-trading-neutral truncate">
                            {stock.name}
                          </span>
                        </div>
                        <span className="font-mono text-sm ml-2">
                          ${stock.price}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Market status - hidden on mobile when search is expanded */}
            {!(isMobile && isSearchExpanded) && (
              <div className="hidden sm:flex items-center space-x-2 text-sm">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-trading-green rounded-full"></div>
                  <span className="text-trading-neutral whitespace-nowrap">
                    Market Open
                  </span>
                </div>
                <span className="text-trading-neutral">|</span>
                <span className="text-trading-neutral font-mono">
                  {new Date().toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZoneName: "short",
                  })}
                </span>
              </div>
            )}
          </div>

          {/* Right section - hidden when search is expanded on mobile */}
          {!(isMobile && isSearchExpanded) && (
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Alerts button */}
              <Button
                variant="outline"
                size="sm"
                className="border-accent text-accent hover:bg-accent hover:text-accent-foreground touch-manipulation min-h-[40px] hidden sm:flex"
              >
                <Bell className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Alerts</span>
              </Button>

              {/* Mobile alerts button */}
              <Button
                variant="outline"
                size="sm"
                className="border-accent text-accent hover:bg-accent hover:text-accent-foreground touch-manipulation min-h-[44px] sm:hidden"
              >
                <Bell className="w-4 h-4" />
              </Button>

              {/* New Trade button */}
              <Button
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/80 touch-manipulation min-h-[44px] sm:min-h-[40px]"
              >
                <Plus className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">New Trade</span>
                <span className="sm:hidden">Trade</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
