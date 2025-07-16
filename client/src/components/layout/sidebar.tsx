import { 
  Home, 
  Brain, 
  TrendingUp, 
  Newspaper, 
  Star, 
  Wallet, 
  User,
  BarChart3,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useLocation } from "wouter";

const navigationItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard", active: true },
  { icon: Brain, label: "AI Predictions", href: "/dashboard#ai-predictions" },
  { icon: TrendingUp, label: "Trading Signals", href: "/dashboard#trading-signals" },
  { icon: Newspaper, label: "Market Sentiment", href: "/dashboard#market-sentiment" },
  { icon: Star, label: "Watchlist", href: "/dashboard#watchlist" },
  { icon: Wallet, label: "Portfolio", href: "/dashboard#portfolio" },
];

function NavigationContent() {
  const [location, setLocation] = useLocation();
  
  return (
    <>
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-border">
        <h1 className="text-lg sm:text-xl font-bold text-primary flex items-center gap-2">
          <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="hidden sm:inline">AI Trading Assistant</span>
          <span className="sm:hidden">AI Trading</span>
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 sm:p-4 space-y-1 sm:space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href || (item.href === "/dashboard" && location === "/");
          return (
            <button 
              key={item.label}
              onClick={() => {
                if (item.href.includes('#')) {
                  const [path, hash] = item.href.split('#');
                  setLocation(path);
                  setTimeout(() => {
                    const element = document.getElementById(hash);
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' });
                    }
                  }, 100);
                } else {
                  setLocation(item.href);
                }
              }}
              className={`
                w-full flex items-center space-x-3 px-3 py-3 sm:py-2 rounded-lg transition-colors
                touch-manipulation min-h-[48px] sm:min-h-[40px]
                ${isActive 
                  ? "bg-primary/10 text-primary border border-primary/20" 
                  : "text-trading-neutral hover:bg-trading-surface hover:text-foreground"
                }
              `}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-3 sm:p-4 border-t border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 sm:w-10 sm:h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-background" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">John Trader</p>
            <p className="text-xs text-trading-neutral">Pro Member</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="fixed top-4 left-4 z-50 bg-background border border-border shadow-lg lg:hidden">
            <Menu className="w-5 h-5" />
            <span className="sr-only">Open navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent 
          side="left" 
          className="w-80 p-0 bg-trading-surface border-r border-border"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col h-full">
            <NavigationContent />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop sidebar
  return (
    <div className="hidden lg:flex w-64 bg-trading-surface border-r border-border flex-col">
      <NavigationContent />
    </div>
  );
}

// Export mobile menu trigger for use in topbar
export function MobileMenuTrigger() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden"
        >
          <Menu className="w-5 h-5" />
          <span className="sr-only">Open navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="left" 
        className="w-80 p-0 bg-trading-surface border-r border-border"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation Menu</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col h-full">
          <NavigationContent />
        </div>
      </SheetContent>
    </Sheet>
  );
}