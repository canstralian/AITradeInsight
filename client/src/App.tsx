import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="touch-manipulation">
        <Router>
          <Route path="/" component={Dashboard} />
          <Route component={NotFound} />
        </Router>
      </div>
    </QueryClientProvider>
  );
}

export default App;