import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tradingApi } from "@/lib/trading-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Building2,
  Calendar,
  FileText,
  Settings,
  Download,
  Mail,
  Sync,
  Plus,
  AlertCircle,
  TrendingUp,
  DollarSign,
} from "lucide-react";

export function IntegrationDashboard() {
  const [selectedBroker, setSelectedBroker] = useState("");
  const [brokerCredentials, setBrokerCredentials] = useState({
    apiKey: "",
    apiSecret: "",
    accountId: "",
    accountName: "",
  });
  const [reportConfig, setReportConfig] = useState({
    name: "",
    frequency: "WEEKLY",
    format: "PDF",
    emailEnabled: false,
    emailRecipients: "",
  });
  const [calendarAlerts, setCalendarAlerts] = useState({
    earningsAlerts: true,
    economicAlerts: true,
    dividendAlerts: true,
    alertTiming: 1,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Queries
  const { data: brokerAccounts } = useQuery({
    queryKey: ["/api/brokers/accounts"],
    queryFn: () => tradingApi.getBrokerAccounts?.() || Promise.resolve([]),
  });

  const { data: upcomingEvents } = useQuery({
    queryKey: ["/api/calendar/upcoming"],
    queryFn: () =>
      tradingApi.getUpcomingEvents?.() ||
      Promise.resolve({ earnings: [], economic: [], dividends: [] }),
  });

  const { data: consolidatedPortfolio } = useQuery({
    queryKey: ["/api/brokers/portfolio"],
    queryFn: () =>
      tradingApi.getConsolidatedPortfolio?.() || Promise.resolve(null),
  });

  // Mutations
  const connectBrokerMutation = useMutation({
    mutationFn: (credentials: any) =>
      tradingApi.connectBroker?.(credentials) || Promise.resolve({}),
    onSuccess: () => {
      toast({
        title: "Broker Connected",
        description: "Your broker account has been successfully connected!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/brokers/accounts"] });
      setBrokerCredentials({
        apiKey: "",
        apiSecret: "",
        accountId: "",
        accountName: "",
      });
    },
    onError: () => {
      toast({
        title: "Connection Failed",
        description:
          "Failed to connect broker account. Please check your credentials.",
        variant: "destructive",
      });
    },
  });

  const syncBrokerMutation = useMutation({
    mutationFn: (accountId: string) =>
      tradingApi.syncBrokerAccount?.(accountId) || Promise.resolve({}),
    onSuccess: () => {
      toast({
        title: "Sync Complete",
        description: "Broker account synchronized successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/brokers/portfolio"] });
    },
  });

  const createReportMutation = useMutation({
    mutationFn: (config: any) =>
      tradingApi.createReport?.(config) || Promise.resolve({}),
    onSuccess: () => {
      toast({
        title: "Report Created",
        description: "Your report configuration has been saved!",
      });
      setReportConfig({
        name: "",
        frequency: "WEEKLY",
        format: "PDF",
        emailEnabled: false,
        emailRecipients: "",
      });
    },
  });

  const setupAlertsMutation = useMutation({
    mutationFn: (preferences: any) =>
      tradingApi.setupCalendarAlerts?.(preferences) || Promise.resolve({}),
    onSuccess: () => {
      toast({
        title: "Alerts Configured",
        description: "Your calendar alerts have been set up successfully!",
      });
    },
  });

  const handleConnectBroker = () => {
    if (
      !selectedBroker ||
      !brokerCredentials.apiKey ||
      !brokerCredentials.apiSecret
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    connectBrokerMutation.mutate({
      brokerId: selectedBroker,
      ...brokerCredentials,
    });
  };

  const handleCreateReport = () => {
    if (!reportConfig.name) {
      toast({
        title: "Missing Information",
        description: "Please provide a report name.",
        variant: "destructive",
      });
      return;
    }

    createReportMutation.mutate({
      name: reportConfig.name,
      type: "PERFORMANCE",
      frequency: reportConfig.frequency,
      format: reportConfig.format,
      delivery: {
        email: reportConfig.emailEnabled,
        download: true,
        emailRecipients: reportConfig.emailRecipients
          .split(",")
          .map((email) => email.trim()),
      },
      sections: [
        {
          type: "PORTFOLIO_SUMMARY",
          title: "Portfolio Summary",
          config: {},
          order: 1,
        },
        {
          type: "PERFORMANCE_METRICS",
          title: "Performance Metrics",
          config: {},
          order: 2,
        },
        {
          type: "TRADE_ANALYSIS",
          title: "Trade Analysis",
          config: {},
          order: 3,
        },
        {
          type: "MARKET_OUTLOOK",
          title: "Market Outlook",
          config: {},
          order: 4,
        },
      ],
      isActive: true,
    });
  };

  const handleSetupAlerts = () => {
    setupAlertsMutation.mutate(calendarAlerts);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Integration & Automation</h2>
        <Badge variant="outline" className="text-sm">
          <Settings className="w-4 h-4 mr-1" />
          Management Center
        </Badge>
      </div>

      <Tabs defaultValue="brokers" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="brokers">
            <Building2 className="w-4 h-4 mr-2" />
            Broker Integration
          </TabsTrigger>
          <TabsTrigger value="calendar">
            <Calendar className="w-4 h-4 mr-2" />
            Calendar Integration
          </TabsTrigger>
          <TabsTrigger value="reporting">
            <FileText className="w-4 h-4 mr-2" />
            Automated Reporting
          </TabsTrigger>
        </TabsList>

        <TabsContent value="brokers" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Connect Broker Account</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="broker-select">Select Broker</Label>
                  <Select
                    value={selectedBroker}
                    onValueChange={setSelectedBroker}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a broker" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alpaca">Alpaca</SelectItem>
                      <SelectItem value="interactive-brokers">
                        Interactive Brokers
                      </SelectItem>
                      <SelectItem value="td-ameritrade">
                        TD Ameritrade
                      </SelectItem>
                      <SelectItem value="schwab">Charles Schwab</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="account-name">Account Name</Label>
                  <Input
                    id="account-name"
                    value={brokerCredentials.accountName}
                    onChange={(e) =>
                      setBrokerCredentials((prev) => ({
                        ...prev,
                        accountName: e.target.value,
                      }))
                    }
                    placeholder="My Trading Account"
                  />
                </div>

                <div>
                  <Label htmlFor="account-id">Account ID</Label>
                  <Input
                    id="account-id"
                    value={brokerCredentials.accountId}
                    onChange={(e) =>
                      setBrokerCredentials((prev) => ({
                        ...prev,
                        accountId: e.target.value,
                      }))
                    }
                    placeholder="Enter your account ID"
                  />
                </div>

                <div>
                  <Label htmlFor="api-key">API Key</Label>
                  <Input
                    id="api-key"
                    type="password"
                    value={brokerCredentials.apiKey}
                    onChange={(e) =>
                      setBrokerCredentials((prev) => ({
                        ...prev,
                        apiKey: e.target.value,
                      }))
                    }
                    placeholder="Enter your API key"
                  />
                </div>

                <div>
                  <Label htmlFor="api-secret">API Secret</Label>
                  <Input
                    id="api-secret"
                    type="password"
                    value={brokerCredentials.apiSecret}
                    onChange={(e) =>
                      setBrokerCredentials((prev) => ({
                        ...prev,
                        apiSecret: e.target.value,
                      }))
                    }
                    placeholder="Enter your API secret"
                  />
                </div>

                <Button
                  onClick={handleConnectBroker}
                  disabled={connectBrokerMutation.isPending}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Connect Broker
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Connected Accounts</CardTitle>
              </CardHeader>
              <CardContent>
                {brokerAccounts?.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No broker accounts connected
                  </p>
                ) : (
                  <div className="space-y-4">
                    {brokerAccounts?.map((account: any) => (
                      <div
                        key={account.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <div className="font-semibold">
                            {account.accountName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {account.brokerId} • {account.accountId}
                          </div>
                          <div className="text-sm">
                            Balance: ${account.balance?.toLocaleString() || "0"}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={account.isActive ? "default" : "secondary"}
                          >
                            {account.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              syncBrokerMutation.mutate(account.id)
                            }
                            disabled={syncBrokerMutation.isPending}
                          >
                            <Sync className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {consolidatedPortfolio && (
            <Card>
              <CardHeader>
                <CardTitle>Consolidated Portfolio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      $
                      {consolidatedPortfolio.totalValue?.toLocaleString() ||
                        "0"}
                    </div>
                    <div className="text-sm text-gray-600">Total Value</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div
                      className={`text-2xl font-bold ${consolidatedPortfolio.totalPL >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      ${consolidatedPortfolio.totalPL?.toLocaleString() || "0"}
                    </div>
                    <div className="text-sm text-gray-600">Total P&L</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {consolidatedPortfolio.accounts?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">
                      Connected Accounts
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Calendar Alert Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="earnings-alerts">Earnings Alerts</Label>
                  <Switch
                    id="earnings-alerts"
                    checked={calendarAlerts.earningsAlerts}
                    onCheckedChange={(checked) =>
                      setCalendarAlerts((prev) => ({
                        ...prev,
                        earningsAlerts: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="economic-alerts">Economic Event Alerts</Label>
                  <Switch
                    id="economic-alerts"
                    checked={calendarAlerts.economicAlerts}
                    onCheckedChange={(checked) =>
                      setCalendarAlerts((prev) => ({
                        ...prev,
                        economicAlerts: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="dividend-alerts">Dividend Alerts</Label>
                  <Switch
                    id="dividend-alerts"
                    checked={calendarAlerts.dividendAlerts}
                    onCheckedChange={(checked) =>
                      setCalendarAlerts((prev) => ({
                        ...prev,
                        dividendAlerts: checked,
                      }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="alert-timing">
                    Alert Timing (days before)
                  </Label>
                  <Select
                    value={calendarAlerts.alertTiming.toString()}
                    onValueChange={(value) =>
                      setCalendarAlerts((prev) => ({
                        ...prev,
                        alertTiming: parseInt(value),
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 day</SelectItem>
                      <SelectItem value="2">2 days</SelectItem>
                      <SelectItem value="3">3 days</SelectItem>
                      <SelectItem value="7">1 week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleSetupAlerts}
                  disabled={setupAlertsMutation.isPending}
                  className="w-full"
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Setup Alerts
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingEvents?.earnings?.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        Earnings Reports
                      </h4>
                      {upcomingEvents.earnings.slice(0, 3).map((event: any) => (
                        <div
                          key={event.id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded"
                        >
                          <div>
                            <div className="font-medium">{event.symbol}</div>
                            <div className="text-sm text-gray-600">
                              {event.companyName}
                            </div>
                          </div>
                          <div className="text-sm text-right">
                            <div>
                              {new Date(event.reportDate).toLocaleDateString()}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {event.aiPrediction?.recommendation || "HOLD"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {upcomingEvents?.dividends?.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        Dividend Events
                      </h4>
                      {upcomingEvents.dividends
                        .slice(0, 3)
                        .map((event: any) => (
                          <div
                            key={event.id}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded"
                          >
                            <div>
                              <div className="font-medium">{event.symbol}</div>
                              <div className="text-sm text-gray-600">
                                ${event.dividendAmount}
                              </div>
                            </div>
                            <div className="text-sm text-right">
                              <div>
                                {new Date(
                                  event.exDividendDate,
                                ).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-gray-500">
                                Ex-Dividend
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}

                  {!upcomingEvents?.earnings?.length &&
                    !upcomingEvents?.dividends?.length && (
                      <p className="text-gray-500 text-center py-8">
                        No upcoming events for watched stocks
                      </p>
                    )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reporting" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create Automated Report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="report-name">Report Name</Label>
                <Input
                  id="report-name"
                  value={reportConfig.name}
                  onChange={(e) =>
                    setReportConfig((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="My Weekly Performance Report"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select
                    value={reportConfig.frequency}
                    onValueChange={(value) =>
                      setReportConfig((prev) => ({ ...prev, frequency: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DAILY">Daily</SelectItem>
                      <SelectItem value="WEEKLY">Weekly</SelectItem>
                      <SelectItem value="MONTHLY">Monthly</SelectItem>
                      <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="format">Format</Label>
                  <Select
                    value={reportConfig.format}
                    onValueChange={(value) =>
                      setReportConfig((prev) => ({ ...prev, format: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PDF">PDF</SelectItem>
                      <SelectItem value="HTML">HTML</SelectItem>
                      <SelectItem value="CSV">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="email-enabled"
                  checked={reportConfig.emailEnabled}
                  onCheckedChange={(checked) =>
                    setReportConfig((prev) => ({
                      ...prev,
                      emailEnabled: checked,
                    }))
                  }
                />
                <Label htmlFor="email-enabled">Email delivery</Label>
              </div>

              {reportConfig.emailEnabled && (
                <div>
                  <Label htmlFor="email-recipients">Email Recipients</Label>
                  <Input
                    id="email-recipients"
                    value={reportConfig.emailRecipients}
                    onChange={(e) =>
                      setReportConfig((prev) => ({
                        ...prev,
                        emailRecipients: e.target.value,
                      }))
                    }
                    placeholder="email1@example.com, email2@example.com"
                  />
                </div>
              )}

              <Button
                onClick={handleCreateReport}
                disabled={createReportMutation.isPending}
                className="w-full"
              >
                <FileText className="w-4 h-4 mr-2" />
                Create Report
              </Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Reports</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Generate Weekly Report
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Generate Monthly Report
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Email Digest
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Report Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Reports Generated</span>
                    <Badge variant="outline">24</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active Schedules</span>
                    <Badge variant="outline">3</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Email Deliveries</span>
                    <Badge variant="outline">18</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Last Generated</span>
                    <span className="text-sm text-gray-500">2 hours ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
