/**
 * Live Earnings Widget
 * Real-time earnings tracking with SSE connection
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { 
  RefreshCw, 
  Radio, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  ArrowUp,
  ArrowDown,
  Minus,
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LiveEarningsData {
  company: string;
  quarter: string;
  fiscalYear: string;
  status: "pre_earnings" | "in_progress" | "released" | "unknown";
  lastUpdated: string;
  
  revenue?: string;
  revenueExpected?: string;
  revenueBeatMiss?: string;
  eps?: string;
  epsExpected?: string;
  epsBeatMiss?: string;
  
  guidance?: string;
  guidanceNotes?: string;
  
  stockReaction?: string;
  analystReaction?: string;
  
  summary?: string;
  headlines?: string[];
}

interface LiveEarningsWidgetProps {
  company?: string;
  autoStart?: boolean;
  pollIntervalMs?: number;
}

export default function LiveEarningsWidget({ 
  company = "Salesforce",
  autoStart = true,
  pollIntervalMs = 120000 // 2 minutes
}: LiveEarningsWidgetProps) {
  const [data, setData] = useState<LiveEarningsData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastHeartbeat, setLastHeartbeat] = useState<Date | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Connect to SSE stream
  const connectSSE = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource("/api/earnings/live/stream");
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log("[LiveEarnings] SSE connected");
      setIsConnected(true);
      setError(null);
    };

    eventSource.onerror = () => {
      console.log("[LiveEarnings] SSE error, reconnecting...");
      setIsConnected(false);
      // Auto-reconnect after 5 seconds
      setTimeout(connectSSE, 5000);
    };

    eventSource.addEventListener("connected", (e) => {
      const payload = JSON.parse(e.data);
      console.log("[LiveEarnings] Connected:", payload);
    });

    eventSource.addEventListener("update", (e) => {
      const payload = JSON.parse(e.data) as LiveEarningsData;
      if (payload.company.toLowerCase() === company.toLowerCase()) {
        setData(payload);
        setError(null);
      }
    });

    eventSource.addEventListener("change", (e) => {
      const payload = JSON.parse(e.data) as LiveEarningsData;
      if (payload.company.toLowerCase() === company.toLowerCase()) {
        setData(payload);
        // Flash effect for new data could be added here
      }
    });

    eventSource.addEventListener("error", (e) => {
      const payload = JSON.parse(e.data);
      if (payload.company.toLowerCase() === company.toLowerCase()) {
        setError(payload.error);
      }
    });

    eventSource.addEventListener("polling_started", (e) => {
      const payload = JSON.parse(e.data);
      if (payload.company.toLowerCase() === company.toLowerCase()) {
        setIsPolling(true);
      }
    });

    eventSource.addEventListener("polling_stopped", (e) => {
      const payload = JSON.parse(e.data);
      if (payload.company.toLowerCase() === company.toLowerCase()) {
        setIsPolling(false);
      }
    });

    eventSource.addEventListener("heartbeat", (e) => {
      const payload = JSON.parse(e.data);
      setLastHeartbeat(new Date(payload.timestamp));
    });

    return eventSource;
  }, [company]);

  // Start polling
  const startPolling = useCallback(async () => {
    try {
      const res = await fetch("/api/earnings/live/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company, intervalMs: pollIntervalMs }),
      });
      if (!res.ok) throw new Error("Failed to start polling");
      setIsPolling(true);
    } catch (err: any) {
      setError(err.message);
    }
  }, [company, pollIntervalMs]);

  // Stop polling
  const stopPolling = useCallback(async () => {
    try {
      const res = await fetch("/api/earnings/live/stop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company }),
      });
      if (!res.ok) throw new Error("Failed to stop polling");
      setIsPolling(false);
    } catch (err: any) {
      setError(err.message);
    }
  }, [company]);

  // Manual refresh
  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/earnings/live/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company }),
      });
      if (!res.ok) throw new Error("Failed to refresh");
      const newData = await res.json();
      setData(newData);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsRefreshing(false);
    }
  }, [company]);

  // Connect on mount
  useEffect(() => {
    const eventSource = connectSSE();
    
    // Auto-start polling if enabled
    if (autoStart) {
      startPolling();
    }

    return () => {
      eventSource.close();
      if (isPolling) {
        stopPolling();
      }
    };
  }, [connectSSE, autoStart, startPolling, stopPolling, isPolling]);

  // Status badge
  const getStatusBadge = () => {
    switch (data?.status) {
      case "released":
        return <Badge className="bg-green-600 text-white"><CheckCircle2 className="h-3 w-3 mr-1" /> Released</Badge>;
      case "in_progress":
        return <Badge className="bg-amber-500 text-white animate-pulse"><Activity className="h-3 w-3 mr-1" /> In Progress</Badge>;
      case "pre_earnings":
        return <Badge className="bg-blue-500 text-white"><Clock className="h-3 w-3 mr-1" /> Upcoming</Badge>;
      default:
        return <Badge variant="outline"><AlertCircle className="h-3 w-3 mr-1" /> Waiting</Badge>;
    }
  };

  // Beat/miss indicator
  const getBeatMissIcon = (value?: string) => {
    if (!value) return null;
    const lower = value.toLowerCase();
    if (lower === "beat" || lower.startsWith("+")) {
      return <ArrowUp className="h-4 w-4 text-green-600" />;
    }
    if (lower === "miss" || lower.startsWith("-")) {
      return <ArrowDown className="h-4 w-4 text-red-600" />;
    }
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  // Guidance badge
  const getGuidanceBadge = () => {
    if (!data?.guidance) return null;
    const guidance = data.guidance.toLowerCase();
    if (guidance === "raised" || guidance.includes("raised")) {
      return <Badge className="bg-green-100 text-green-800"><TrendingUp className="h-3 w-3 mr-1" /> Raised</Badge>;
    }
    if (guidance === "lowered" || guidance.includes("lowered")) {
      return <Badge className="bg-red-100 text-red-800"><TrendingDown className="h-3 w-3 mr-1" /> Lowered</Badge>;
    }
    return <Badge variant="outline">Maintained</Badge>;
  };

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit"
      });
    } catch {
      return "—";
    }
  };

  return (
    <Card className={cn(
      "shadow-lg border-2 transition-all duration-300",
      isPolling ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200",
      data?.status === "released" && "border-green-500 ring-2 ring-green-200"
    )}>
      <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <div className={cn(
              "h-3 w-3 rounded-full",
              isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
            )} />
            <Radio className={cn("h-5 w-5", isPolling && "text-blue-600 animate-pulse")} />
            LIVE: {company} Earnings
          </CardTitle>
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            <Button
              size="sm"
              variant={isPolling ? "default" : "outline"}
              onClick={isPolling ? stopPolling : startPolling}
              className={cn(isPolling && "bg-blue-600 hover:bg-blue-700")}
            >
              <Zap className="h-4 w-4 mr-1" />
              {isPolling ? "Live" : "Start"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={refresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            </Button>
          </div>
        </div>
        {data?.lastUpdated && (
          <p className="text-xs text-muted-foreground mt-1">
            Last updated: {formatTime(data.lastUpdated)} • {data.quarter} {data.fiscalYear}
          </p>
        )}
      </CardHeader>

      <CardContent className="pt-4">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            <AlertCircle className="h-4 w-4 inline mr-2" />
            {error}
          </div>
        )}

        {!data && !error && (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Spinner className="h-8 w-8 mb-2" />
            <p>Waiting for earnings data...</p>
            <p className="text-xs mt-1">Data will appear automatically when available</p>
          </div>
        )}

        {data && (
          <div className="space-y-4">
            {/* Key Metrics Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Revenue */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">Revenue</span>
                  {getBeatMissIcon(data.revenueBeatMiss)}
                </div>
                <div className="mt-1">
                  <span className="text-xl font-bold text-gray-900">{data.revenue || "—"}</span>
                  {data.revenueExpected && (
                    <span className="text-xs text-muted-foreground ml-1">
                      vs {data.revenueExpected}
                    </span>
                  )}
                </div>
                {data.revenueBeatMiss && (
                  <Badge variant="outline" className={cn(
                    "mt-1 text-xs",
                    data.revenueBeatMiss.toLowerCase() === "beat" || data.revenueBeatMiss.startsWith("+") 
                      ? "text-green-700 border-green-300" 
                      : "text-red-700 border-red-300"
                  )}>
                    {data.revenueBeatMiss}
                  </Badge>
                )}
              </div>

              {/* EPS */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">EPS</span>
                  {getBeatMissIcon(data.epsBeatMiss)}
                </div>
                <div className="mt-1">
                  <span className="text-xl font-bold text-gray-900">{data.eps || "—"}</span>
                  {data.epsExpected && (
                    <span className="text-xs text-muted-foreground ml-1">
                      vs {data.epsExpected}
                    </span>
                  )}
                </div>
                {data.epsBeatMiss && (
                  <Badge variant="outline" className={cn(
                    "mt-1 text-xs",
                    data.epsBeatMiss.toLowerCase() === "beat" || data.epsBeatMiss.startsWith("+")
                      ? "text-green-700 border-green-300"
                      : "text-red-700 border-red-300"
                  )}>
                    {data.epsBeatMiss}
                  </Badge>
                )}
              </div>

              {/* Guidance */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Guidance</span>
                <div className="mt-2">
                  {getGuidanceBadge() || <span className="text-gray-400">—</span>}
                </div>
              </div>

              {/* Stock Reaction */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Stock</span>
                <div className="mt-1">
                  {data.stockReaction ? (
                    <span className={cn(
                      "text-xl font-bold",
                      data.stockReaction.startsWith("+") ? "text-green-600" : "text-red-600"
                    )}>
                      {data.stockReaction}
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </div>
              </div>
            </div>

            {/* Guidance Notes */}
            {data.guidanceNotes && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm font-medium text-blue-900 mb-1">Guidance Notes</p>
                <p className="text-sm text-blue-800">{data.guidanceNotes}</p>
              </div>
            )}

            {/* Summary */}
            {data.summary && (
              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-900 mb-2">AI Summary</p>
                <p className="text-sm text-gray-600 line-clamp-4">{data.summary}</p>
              </div>
            )}

            {/* Headlines */}
            {data.headlines && data.headlines.length > 0 && (
              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-900 mb-2">Key Headlines</p>
                <ul className="space-y-1">
                  {data.headlines.slice(0, 3).map((headline, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      {headline}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Connection Status Footer */}
        <div className="mt-4 pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <div className={cn(
              "h-2 w-2 rounded-full",
              isConnected ? "bg-green-500" : "bg-red-500"
            )} />
            {isConnected ? "Connected" : "Disconnected"}
          </span>
          <span>
            {isPolling ? `Polling every ${pollIntervalMs / 1000}s` : "Polling stopped"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

