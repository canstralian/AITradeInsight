import { 
  Home, 
  Brain, 
  TrendingUp, 
  Newspaper, 
  Star, 
  Wallet, 
  User,
  BarChart3
} from "lucide-react";

export function Sidebar() {
  return (
    <div className="w-64 bg-trading-surface border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold text-primary flex items-center gap-2">
          <BarChart3 className="w-6 h-6" />
          AI Trading Assistant
        </h1>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <a 
          href="#" 
          className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-primary/10 text-primary border border-primary/20"
        >
          <Home className="w-4 h-4" />
          <span>Dashboard</span>
        </a>
        <a 
          href="#" 
          className="flex items-center space-x-3 px-3 py-2 rounded-lg text-trading-neutral hover:bg-trading-surface hover:text-foreground transition-colors"
        >
          <Brain className="w-4 h-4" />
          <span>AI Predictions</span>
        </a>
        <a 
          href="#" 
          className="flex items-center space-x-3 px-3 py-2 rounded-lg text-trading-neutral hover:bg-trading-surface hover:text-foreground transition-colors"
        >
          <TrendingUp className="w-4 h-4" />
          <span>Trading Signals</span>
        </a>
        <a 
          href="#" 
          className="flex items-center space-x-3 px-3 py-2 rounded-lg text-trading-neutral hover:bg-trading-surface hover:text-foreground transition-colors"
        >
          <Newspaper className="w-4 h-4" />
          <span>Market Sentiment</span>
        </a>
        <a 
          href="#" 
          className="flex items-center space-x-3 px-3 py-2 rounded-lg text-trading-neutral hover:bg-trading-surface hover:text-foreground transition-colors"
        >
          <Star className="w-4 h-4" />
          <span>Watchlist</span>
        </a>
        <a 
          href="#" 
          className="flex items-center space-x-3 px-3 py-2 rounded-lg text-trading-neutral hover:bg-trading-surface hover:text-foreground transition-colors"
        >
          <Wallet className="w-4 h-4" />
          <span>Portfolio</span>
        </a>
      </nav>
      
      {/* User Profile */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-background" />
          </div>
          <div>
            <p className="text-sm font-medium">John Trader</p>
            <p className="text-xs text-trading-neutral">Pro Member</p>
          </div>
        </div>
      </div>
    </div>
  );
}
