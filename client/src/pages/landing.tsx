
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Zap, Target, TrendingUp, Activity, Shield, Clock, BarChart3, Smartphone, Globe } from "lucide-react";
import { useLocation } from "wouter";

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [, setLocation] = useLocation();

  const features = [
    {
      icon: Brain,
      title: "AI-Driven Arbitrage",
      description: "Machine learning algorithms identify and execute profitable arbitrage opportunities across multiple exchanges in real-time."
    },
    {
      icon: Zap,
      title: "Lightning Fast Execution",
      description: "Execute trades in milliseconds with our optimized infrastructure and direct exchange connections."
    },
    {
      icon: Shield,
      title: "Risk Management",
      description: "Advanced risk controls and position sizing protect your capital while maximizing returns."
    },
    {
      icon: Clock,
      title: "24/7 Automation",
      description: "Never miss an opportunity. Our bots work around the clock to capture arbitrage profits."
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Comprehensive dashboards and reporting to track performance and optimize strategies."
    },
    {
      icon: Globe,
      title: "Multi-Exchange Support",
      description: "Connected to 15+ major exchanges including Binance, Coinbase, Kraken, and more."
    }
  ];

  const integrations = [
    { name: "Binance", logo: "🔸" },
    { name: "Coinbase", logo: "🔹" },
    { name: "Kraken", logo: "🔸" },
    { name: "Bitfinex", logo: "🔹" },
    { name: "Huobi", logo: "🔸" },
    { name: "KuCoin", logo: "🔹" }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "$99",
      period: "/month",
      description: "Perfect for beginners",
      features: [
        "Up to $10,000 trading capital",
        "5 supported exchanges",
        "Basic AI strategies",
        "Email support",
        "Real-time dashboard"
      ],
      popular: false
    },
    {
      name: "Professional",
      price: "$299",
      period: "/month",
      description: "For serious traders",
      features: [
        "Up to $100,000 trading capital",
        "15+ supported exchanges",
        "Advanced AI strategies",
        "Priority support",
        "Advanced analytics",
        "Custom risk parameters"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For institutions",
      features: [
        "Unlimited trading capital",
        "All supported exchanges",
        "Custom AI development",
        "Dedicated support team",
        "White-label solutions",
        "API access"
      ],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-gray-900 bg-opacity-90 backdrop-filter backdrop-blur-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <a href="#" className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-600">
              CryptoArb AI
            </a>
            <nav className="hidden md:flex space-x-6">
              <a href="#features" className="hover:text-purple-400 transition">Features</a>
              <a href="#integrations" className="hover:text-purple-400 transition">Integrations</a>
              <a href="#automation" className="hover:text-purple-400 transition">Automation</a>
              <a href="#pricing" className="hover:text-purple-400 transition">Pricing</a>
              <a href="#contact" className="hover:text-purple-400 transition">Contact</a>
            </nav>
            <button 
              id="mobile-menu-btn" 
              className="md:hidden text-white focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
            <Button 
              className="hidden md:block bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-2 rounded-full font-medium hover:opacity-90 transition"
              onClick={() => setLocation('/dashboard')}
            >
              Get Started
            </Button>
          </div>
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4">
              <nav className="flex flex-col space-y-3">
                <a href="#features" className="hover:text-purple-400 transition">Features</a>
                <a href="#integrations" className="hover:text-purple-400 transition">Integrations</a>
                <a href="#automation" className="hover:text-purple-400 transition">Automation</a>
                <a href="#pricing" className="hover:text-purple-400 transition">Pricing</a>
                <a href="#contact" className="hover:text-purple-400 transition">Contact</a>
                <Button 
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-2 rounded-full font-medium hover:opacity-90 transition text-center mt-2"
                  onClick={() => setLocation('/dashboard')}
                >
                  Get Started
                </Button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
            AI-Powered Crypto Arbitrage Bot
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-10">
            Automate profits from price differences across exchanges with real-time, machine learning-driven execution.
          </p>
          <Button 
            className="inline-block bg-purple-600 hover:bg-purple-700 px-8 py-3 rounded-full font-semibold text-lg transition glow"
            onClick={() => setLocation('/dashboard')}
          >
            Start Arbitraging Now
          </Button>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-gray-800">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-12">Why Choose CryptoArb AI?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {features.map((feature, index) => (
              <Card key={index} className="bg-gray-900 p-8 rounded-xl border border-gray-700 hover:border-purple-500 transition">
                <CardHeader className="text-center">
                  <feature.icon className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                  <CardTitle className="text-xl font-bold mb-2">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section id="integrations" className="py-20 bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-12">Exchange Integrations</h2>
          <p className="text-gray-400 mb-12">Connected to the world's leading cryptocurrency exchanges</p>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
            {integrations.map((integration, index) => (
              <Card key={index} className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-purple-500 transition text-center">
                <CardContent className="pt-6">
                  <div className="text-4xl mb-2">{integration.logo}</div>
                  <p className="font-medium">{integration.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Automation */}
      <section id="automation" className="py-20 bg-gray-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Fully Automated Trading</h2>
              <p className="text-gray-400 mb-6">
                Our AI continuously monitors price differences across exchanges and executes trades automatically. 
                No manual intervention required - just set your parameters and let the bot work.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-purple-500" />
                  <span>Real-time market scanning</span>
                </div>
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-purple-500" />
                  <span>Instant trade execution</span>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-purple-500" />
                  <span>Automated risk management</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-900 p-8 rounded-xl border border-gray-700">
              <h3 className="text-xl font-bold mb-4">Live Performance</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">24h Profit</span>
                  <span className="text-green-400 font-bold">+2.34%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Active Opportunities</span>
                  <span className="font-bold">147</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Success Rate</span>
                  <span className="text-green-400 font-bold">94.7%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-12">Choose Your Plan</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`relative p-8 rounded-xl ${plan.popular ? 'border-purple-500 bg-gradient-to-b from-purple-900/20 to-gray-900' : 'border-gray-700 bg-gray-800'}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-600">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <CardDescription className="text-gray-400">{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-gray-400">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${plan.popular ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-700 hover:bg-gray-600'}`}
                    onClick={() => setLocation('/dashboard')}
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Trading?</h2>
          <p className="text-gray-400 mb-8">
            Join thousands of traders already profiting from automated arbitrage
          </p>
          <Button 
            className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-3 rounded-full font-semibold text-lg hover:opacity-90 transition glow"
            onClick={() => setLocation('/get-started')}
          >
            Start Your Free Trial
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-700 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-600">
                CryptoArb AI
              </h3>
              <p className="text-gray-400">
                The most advanced AI-powered crypto arbitrage platform.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Help Center</a></li>
                <li><a href="#contact" className="hover:text-white transition">Contact</a></li>
                <li><a href="#" className="hover:text-white transition">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 CryptoArb AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
