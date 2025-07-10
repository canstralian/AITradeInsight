import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Shield, Brain, Zap } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Smart AI Trading Assistant
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            Make smarter investment decisions with AI-powered trading insights and real-time market analysis.
          </p>
          <Button 
            size="lg" 
            className="text-lg px-8 py-4 mb-16"
            onClick={() => window.location.href = '/api/login'}
          >
            Get Started
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader className="text-center">
              <Brain className="h-12 w-12 mx-auto mb-4 text-primary" />
              <CardTitle>AI Predictions</CardTitle>
              <CardDescription>
                Advanced machine learning models analyze market patterns to predict stock movements
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader className="text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-primary" />
              <CardTitle>Real-time Analytics</CardTitle>
              <CardDescription>
                Live market data and performance tracking for your investment portfolio
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader className="text-center">
              <Zap className="h-12 w-12 mx-auto mb-4 text-primary" />
              <CardTitle>Trading Signals</CardTitle>
              <CardDescription>
                Automated buy/sell/hold recommendations based on comprehensive market analysis
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader className="text-center">
              <Shield className="h-12 w-12 mx-auto mb-4 text-primary" />
              <CardTitle>Risk Management</CardTitle>
              <CardDescription>
                Smart risk assessment tools to help protect and grow your investments
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold mb-8">Ready to start trading smarter?</h2>
          <Button 
            size="lg" 
            variant="outline" 
            className="text-lg px-8 py-4"
            onClick={() => window.location.href = '/api/login'}
          >
            Sign In to Continue
          </Button>
        </div>
      </div>
    </div>
  );
}