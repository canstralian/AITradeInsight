import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Switch, Route, Router } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/error-boundary";
import { Landing } from "@/pages/landing";
import { Dashboard } from "@/pages/dashboard";
import { CryptoDashboard } from "@/pages/crypto-dashboard";
import { Home } from "@/pages/home";
import { GetStarted } from "@/pages/get-started";
import { NotFound } from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 3,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Global error handler for unhandled promise rejections
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    // In production, send to error reporting service
    if (import.meta.env.PROD) {
      // errorReportingService.captureException(event.reason);
    }
  });
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Switch>
            <Route path="/" component={Landing} />
            <Route path="/home" component={Home} />
            <Route path="/dashboard">
              {() => (
                <ErrorBoundary>
                  <Dashboard />
                </ErrorBoundary>
              )}
            </Route>
            <Route path="/crypto">
              {() => (
                <ErrorBoundary>
                  <CryptoDashboard />
                </ErrorBoundary>
              )}
            </Route>
            <Route path="/get-started">
              {() => (
                <ErrorBoundary>
                  <GetStarted />
                </ErrorBoundary>
              )}
            </Route>
            <Route component={NotFound} />
          </Switch>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}