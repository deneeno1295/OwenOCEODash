import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Building2, 
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
  Calendar,
  DollarSign,
  BarChart3,
  FileText,
  MessageSquare,
  Newspaper,
  Phone,
  Twitter,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  RefreshCw,
  Radio,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";

interface Competitor {
  id: number;
  name: string;
  type: string;
  score: number;
  trend: string;
  createdAt: string;
  updatedAt: string;
}

interface EarningsReport {
  id: number;
  companyName: string;
  quarter: string;
  fiscalYear: string;
  revenue: string | null;
  revenueExpected: string | null;
  revenueBeatMiss: string | null;
  revenueChange: string | null;
  eps: string | null;
  epsExpected: string | null;
  epsBeatMiss: string | null;
  epsChange: string | null;
  beatMiss: string | null;
  beatMissDetails: string | null;
  guidance: string | null;
  guidanceVsExpectations: string | null;
  guidanceNotes: string | null;
  nextQuarterRevenue: string | null;
  nextQuarterEps: string | null;
  fullYearRevenue: string | null;
  fullYearEps: string | null;
  stockReaction: string | null;
  stockReactionTime: string | null;
  analystReaction: string | null;
  priceTargetChanges: string | null;
  transcriptUrl: string | null;
  pressReleaseUrl: string | null;
  createdAt: string;
}

interface SentimentAnalysis {
  id: number;
  competitorId: number;
  summary: string;
  topics: any;
  sources: any;
  aiConfidence: number;
  createdAt: string;
}

interface CompetitorContent {
  id: number;
  competitorId: number;
  contentType: string;
  title: string;
  source: string | null;
  summary: string | null;
  content: string | null;
  url: string | null;
  sentiment: string | null;
  engagementCount: number;
  publishedAt: string | null;
  createdAt: string;
}

interface CompetitorDetailProps {
  id: string;
}

export default function CompetitorDetail({ id }: CompetitorDetailProps) {
  const [isRefreshingLive, setIsRefreshingLive] = useState(false);
  const [isRefreshingContent, setIsRefreshingContent] = useState(false);
  const [liveData, setLiveData] = useState<any>(null);
  const [contentRefreshResult, setContentRefreshResult] = useState<{ success: boolean; message: string } | null>(null);
  const queryClient = useQueryClient();

  const { data: competitor, isLoading, error } = useQuery<Competitor>({
    queryKey: ["competitor", id],
    queryFn: async () => {
      const res = await fetch(`/api/competitors/${id}`);
      if (!res.ok) throw new Error("Failed to fetch competitor");
      return res.json();
    },
  });

  const { data: earnings = [] } = useQuery<EarningsReport[]>({
    queryKey: ["earnings", competitor?.name],
    queryFn: async () => {
      if (!competitor?.name) return [];
      const res = await fetch(`/api/earnings?company=${encodeURIComponent(competitor.name)}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!competitor?.name,
  });

  // Refresh live earnings data
  const refreshLiveEarnings = async () => {
    if (!competitor?.name) return;
    setIsRefreshingLive(true);
    try {
      const res = await fetch("/api/earnings/live/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company: competitor.name }),
      });
      if (res.ok) {
        const data = await res.json();
        setLiveData(data);
        // Also refetch the static earnings data
        queryClient.invalidateQueries({ queryKey: ["earnings", competitor.name] });
      }
    } catch (err) {
      console.error("Failed to refresh live data:", err);
    } finally {
      setIsRefreshingLive(false);
    }
  };

  // Refresh all competitor content (analyst reports, transcripts, tweets, articles)
  const refreshContent = async () => {
    setIsRefreshingContent(true);
    setContentRefreshResult(null);
    try {
      const res = await fetch(`/api/competitors/${id}/content/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      
      // Check content type before parsing
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        setContentRefreshResult({ success: false, message: "Server error - API keys may not be configured" });
        return;
      }
      
      const data = await res.json();
      if (res.ok) {
        setContentRefreshResult({ success: true, message: data.message });
        // Refresh the content query
        queryClient.invalidateQueries({ queryKey: ["competitor-content", id] });
      } else {
        setContentRefreshResult({ success: false, message: data.error || "Failed to refresh content" });
      }
    } catch (err: any) {
      console.error("Failed to refresh content:", err);
      setContentRefreshResult({ success: false, message: "Failed to fetch content - check API configuration" });
    } finally {
      setIsRefreshingContent(false);
    }
  };

  const { data: sentiment } = useQuery<SentimentAnalysis>({
    queryKey: ["sentiment", id],
    queryFn: async () => {
      const res = await fetch(`/api/sentiment/${id}`);
      if (!res.ok) return null;
      return res.json();
    },
  });

  const { data: allContent = [] } = useQuery<CompetitorContent[]>({
    queryKey: ["competitor-content", id],
    queryFn: async () => {
      const res = await fetch(`/api/competitors/${id}/content`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const analystReports = allContent.filter(c => c.contentType === "analyst_report");
  const transcripts = allContent.filter(c => c.contentType === "transcript");
  const articles = allContent.filter(c => c.contentType === "article");
  const xReactions = allContent.filter(c => c.contentType === "x_reaction");
  const callLinks = allContent.filter(c => c.contentType === "call_link");

  const latestEarnings = earnings[0];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getSentimentColor = (sentiment: string | null) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-100 text-green-700 border-green-200";
      case "negative":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getBeatMissColor = (beatMiss: string | null) => {
    if (!beatMiss) return "bg-gray-100 text-gray-700";
    if (beatMiss === "beat") return "bg-green-100 text-green-700";
    if (beatMiss === "miss") return "bg-red-100 text-red-700";
    return "bg-yellow-100 text-yellow-700";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading competitor details...</div>
      </div>
    );
  }

  if (error || !competitor) {
    return (
      <div className="space-y-6">
        <Link href="/">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
        <Card className="bg-white">
          <CardContent className="p-8 text-center">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-muted-foreground">Competitor not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <Link href="/">
          <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-[#0176D3]" data-testid="button-back-to-dashboard">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <Card className="bg-white border-t-4 border-[#0176D3] shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-[#0176D3] to-purple-600 flex items-center justify-center">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#080707]" data-testid="text-competitor-name">{competitor.name}</h1>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="border-gray-200">{competitor.type}</Badge>
                  <div className="flex items-center gap-1">
                    {getTrendIcon(competitor.trend)}
                    <span className="text-sm text-muted-foreground capitalize">{competitor.trend}</span>
                  </div>
                  {latestEarnings?.beatMiss && (
                    <Badge className={cn("border-0", getBeatMissColor(latestEarnings.beatMiss))}>
                      {latestEarnings.beatMiss === "beat" ? "Beat Estimates" : 
                       latestEarnings.beatMiss === "miss" ? "Missed Estimates" : "Inline"}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground mb-1">Threat Score</div>
              <div className="text-4xl font-light text-[#0176D3]">{competitor.score}</div>
              <div className="h-2 w-24 bg-gray-200 rounded-full overflow-hidden mt-2">
                <div 
                  className="h-full bg-gradient-to-r from-[#0176D3] to-purple-600" 
                  style={{ width: `${competitor.score}%` }} 
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="earnings" className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <TabsList className="bg-white border border-gray-200 p-1 flex-wrap">
            <TabsTrigger value="earnings" className="data-[state=active]:bg-[#0176D3] data-[state=active]:text-white gap-2" data-testid="tab-earnings">
              <DollarSign className="h-4 w-4" />
              Earnings
            </TabsTrigger>
            <TabsTrigger value="analysts" className="data-[state=active]:bg-[#0176D3] data-[state=active]:text-white gap-2" data-testid="tab-analysts">
              <BarChart3 className="h-4 w-4" />
              Analyst Reports ({analystReports.length})
            </TabsTrigger>
            <TabsTrigger value="transcripts" className="data-[state=active]:bg-[#0176D3] data-[state=active]:text-white gap-2" data-testid="tab-transcripts">
              <FileText className="h-4 w-4" />
              Transcripts ({transcripts.length})
            </TabsTrigger>
            <TabsTrigger value="reactions" className="data-[state=active]:bg-[#0176D3] data-[state=active]:text-white gap-2" data-testid="tab-reactions">
              <Twitter className="h-4 w-4" />
              X Reactions ({xReactions.length})
            </TabsTrigger>
            <TabsTrigger value="articles" className="data-[state=active]:bg-[#0176D3] data-[state=active]:text-white gap-2" data-testid="tab-articles">
              <Newspaper className="h-4 w-4" />
              Articles ({articles.length})
            </TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            {contentRefreshResult && (
              <Badge 
                variant="outline" 
                className={cn(
                  "transition-opacity",
                  contentRefreshResult.success 
                    ? "text-green-700 border-green-300 bg-green-50" 
                    : "text-red-700 border-red-300 bg-red-50"
                )}
              >
                {contentRefreshResult.message}
              </Badge>
            )}
            <Button
              onClick={refreshContent}
              disabled={isRefreshingContent}
              variant="outline"
              className="gap-2 border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              <Zap className={cn("h-4 w-4", isRefreshingContent && "animate-pulse")} />
              {isRefreshingContent ? "Fetching from AI..." : "Fetch Latest Content"}
            </Button>
          </div>
        </div>

        <TabsContent value="earnings">
          {/* Live Refresh Bar */}
          <Card className="mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Radio className={cn("h-5 w-5", isRefreshingLive ? "text-blue-600 animate-pulse" : "text-blue-500")} />
                  <div>
                    <p className="font-medium text-blue-900">Live Earnings Updates</p>
                    <p className="text-xs text-blue-700">Click refresh to fetch real-time data from market sources</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {liveData && (
                    <Badge variant="outline" className="text-green-700 border-green-300">
                      Updated: {new Date(liveData.lastUpdated).toLocaleTimeString()}
                    </Badge>
                  )}
                  <Button 
                    onClick={refreshLiveEarnings}
                    disabled={isRefreshingLive}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshingLive && "animate-spin")} />
                    {isRefreshingLive ? "Fetching..." : "Refresh Live Data"}
                  </Button>
                </div>
              </div>
              
              {/* Live Data Summary */}
              {liveData && liveData.summary && (
                <div className="mt-3 p-3 bg-white/50 rounded-lg border border-blue-100">
                  <p className="text-sm font-medium text-blue-900 mb-1">Latest from AI Research:</p>
                  <p className="text-sm text-blue-800 line-clamp-3">{liveData.summary}</p>
                  {liveData.revenue && (
                    <div className="mt-2 flex items-center gap-4 text-sm">
                      <span className="font-medium">Revenue: {liveData.revenue}</span>
                      <span className="font-medium">EPS: {liveData.eps || "—"}</span>
                      {liveData.guidance && <Badge className="bg-green-100 text-green-700">{liveData.guidance}</Badge>}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {latestEarnings ? (
            <div className="grid gap-6 md:grid-cols-3">
              <div className="md:col-span-2 space-y-6">
                {/* Overall Result Summary Card */}
                <Card className={cn(
                  "shadow-sm border-l-4",
                  latestEarnings.guidance === "raised" ? "border-l-green-500 bg-gradient-to-r from-green-50 to-white" :
                  latestEarnings.guidance === "lowered" ? "border-l-red-500 bg-gradient-to-r from-red-50 to-white" :
                  "border-l-blue-500 bg-gradient-to-r from-blue-50 to-white"
                )}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-[#080707]">
                          {latestEarnings.quarter} {latestEarnings.fiscalYear} Results
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {latestEarnings.beatMissDetails || "Quarterly earnings report"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {latestEarnings.guidance && (
                          <Badge className={cn("border-0 text-sm px-3 py-1",
                            latestEarnings.guidance === "raised" ? "bg-green-100 text-green-700" :
                            latestEarnings.guidance === "lowered" ? "bg-red-100 text-red-700" :
                            "bg-yellow-100 text-yellow-700"
                          )}>
                            {latestEarnings.guidance === "raised" ? "↑ Guidance Raised" : 
                             latestEarnings.guidance === "lowered" ? "↓ Guidance Lowered" : 
                             "→ Guidance Maintained"}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Revenue & EPS Cards - Redesigned */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Revenue Card */}
                  <Card className="bg-white shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Revenue</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Primary: Actual Value with YoY Growth */}
                      <div>
                        <div className="flex items-baseline gap-3">
                          <span className="text-3xl font-semibold text-[#080707]">{latestEarnings.revenue || "N/A"}</span>
                          {latestEarnings.revenueChange && (
                            <Badge className={cn("text-sm font-medium",
                              latestEarnings.revenueChange.startsWith("+") || latestEarnings.revenueChange.startsWith("-") === false
                                ? "bg-green-100 text-green-700 border-green-200" 
                                : "bg-red-100 text-red-700 border-red-200"
                            )}>
                              {latestEarnings.revenueChange.startsWith("+") || latestEarnings.revenueChange.startsWith("-") 
                                ? latestEarnings.revenueChange 
                                : `+${latestEarnings.revenueChange}`} YoY
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* Secondary: vs Analyst Estimates */}
                      <div className="pt-3 border-t border-gray-100">
                        <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">vs Analyst Estimates</div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Est: {latestEarnings.revenueExpected || "N/A"}
                          </span>
                          {latestEarnings.revenueBeatMiss && (
                            <span className={cn("text-sm font-medium",
                              latestEarnings.revenueBeatMiss.startsWith("+") ? "text-green-600" : "text-red-600"
                            )}>
                              {latestEarnings.revenueBeatMiss.startsWith("+") ? "Beat" : "Missed"} ({latestEarnings.revenueBeatMiss})
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* EPS Card */}
                  <Card className="bg-white shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Earnings Per Share</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Primary: Actual Value with YoY Growth */}
                      <div>
                        <div className="flex items-baseline gap-3">
                          <span className="text-3xl font-semibold text-[#080707]">{latestEarnings.eps || "N/A"}</span>
                          {latestEarnings.epsChange && (
                            <Badge className={cn("text-sm font-medium",
                              latestEarnings.epsChange.startsWith("+") || latestEarnings.epsChange.startsWith("-") === false
                                ? "bg-green-100 text-green-700 border-green-200" 
                                : "bg-red-100 text-red-700 border-red-200"
                            )}>
                              {latestEarnings.epsChange.startsWith("+") || latestEarnings.epsChange.startsWith("-") 
                                ? latestEarnings.epsChange 
                                : `+${latestEarnings.epsChange}`} YoY
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* Secondary: vs Analyst Estimates */}
                      <div className="pt-3 border-t border-gray-100">
                        <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">vs Analyst Estimates</div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Est: {latestEarnings.epsExpected || "N/A"}
                          </span>
                          {latestEarnings.epsBeatMiss && (
                            <span className={cn("text-sm font-medium",
                              latestEarnings.epsBeatMiss.startsWith("+") ? "text-green-600" : "text-red-600"
                            )}>
                              {latestEarnings.epsBeatMiss.startsWith("+") ? "Beat" : "Missed"} ({latestEarnings.epsBeatMiss})
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-white shadow-sm">
                  <CardHeader className="border-b border-gray-100">
                    <CardTitle className="text-base font-semibold text-[#080707]">Guidance</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3 mb-4">
                      <Badge className={cn("border-0",
                        latestEarnings.guidance === "raised" ? "bg-green-100 text-green-700" :
                        latestEarnings.guidance === "lowered" ? "bg-red-100 text-red-700" :
                        "bg-yellow-100 text-yellow-700"
                      )}>
                        {latestEarnings.guidance ? `Guidance ${latestEarnings.guidance}` : "Guidance Maintained"}
                      </Badge>
                      {latestEarnings.guidanceVsExpectations && (
                        <span className="text-sm text-muted-foreground">
                          vs. Expectations: <span className="capitalize">{latestEarnings.guidanceVsExpectations}</span>
                        </span>
                      )}
                    </div>
                    {latestEarnings.guidanceNotes && (
                      <p className="text-sm text-muted-foreground mb-4">{latestEarnings.guidanceNotes}</p>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-muted-foreground mb-1">Next Quarter Revenue</div>
                        <div className="font-medium">{latestEarnings.nextQuarterRevenue || "Not provided"}</div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-muted-foreground mb-1">Next Quarter EPS</div>
                        <div className="font-medium">{latestEarnings.nextQuarterEps || "Not provided"}</div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-muted-foreground mb-1">Full Year Revenue</div>
                        <div className="font-medium">{latestEarnings.fullYearRevenue || "Not provided"}</div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-muted-foreground mb-1">Full Year EPS</div>
                        <div className="font-medium">{latestEarnings.fullYearEps || "Not provided"}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="bg-white shadow-sm">
                  <CardHeader className="border-b border-gray-100">
                    <CardTitle className="text-base font-semibold text-[#080707]">Market Reaction</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    {latestEarnings.stockReaction && (
                      <div className="flex items-center gap-3">
                        {latestEarnings.stockReaction.startsWith("+") ? (
                          <TrendingUp className="h-6 w-6 text-green-600" />
                        ) : (
                          <TrendingDown className="h-6 w-6 text-red-600" />
                        )}
                        <div>
                          <div className={cn("text-2xl font-light",
                            latestEarnings.stockReaction.startsWith("+") ? "text-green-600" : "text-red-600"
                          )}>
                            {latestEarnings.stockReaction}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {latestEarnings.stockReactionTime || "Post-earnings"}
                          </div>
                        </div>
                      </div>
                    )}
                    <Separator />
                    <div>
                      <div className="text-sm font-medium text-[#080707] mb-1">Analyst Reaction</div>
                      <div className="text-sm text-muted-foreground capitalize">
                        {latestEarnings.analystReaction || "Awaiting analysis"}
                      </div>
                    </div>
                    {latestEarnings.priceTargetChanges && (
                      <div>
                        <div className="text-sm font-medium text-[#080707] mb-1">Price Target Changes</div>
                        <div className="text-sm text-muted-foreground">
                          {latestEarnings.priceTargetChanges}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-sm">
                  <CardHeader className="border-b border-gray-100">
                    <CardTitle className="text-base font-semibold text-[#080707]">Quick Links</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-2">
                    {latestEarnings.transcriptUrl && (
                      <a 
                        href={latestEarnings.transcriptUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-[#0176D3] hover:underline"
                      >
                        <FileText className="h-4 w-4" />
                        Earnings Call Transcript
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {latestEarnings.pressReleaseUrl && (
                      <a 
                        href={latestEarnings.pressReleaseUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-[#0176D3] hover:underline"
                      >
                        <Newspaper className="h-4 w-4" />
                        Press Release
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {callLinks.map((link) => (
                      <a 
                        key={link.id}
                        href={link.url || "#"} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-[#0176D3] hover:underline"
                      >
                        <Phone className="h-4 w-4" />
                        {link.title}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ))}
                  </CardContent>
                </Card>

                {sentiment && (
                  <Card className="bg-white shadow-sm border-t-4 border-purple-500">
                    <CardHeader className="border-b border-gray-100">
                      <CardTitle className="flex items-center gap-2 text-base font-semibold text-[#080707]">
                        <Sparkles className="h-4 w-4 text-purple-500" />
                        AI Sentiment Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground mb-3">{sentiment.summary}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">AI Confidence:</span>
                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full">
                          <div 
                            className="h-full bg-purple-500 rounded-full" 
                            style={{ width: `${sentiment.aiConfidence}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium">{sentiment.aiConfidence}%</span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          ) : (
            <Card className="bg-white shadow-sm">
              <CardContent className="p-8 text-center">
                <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-muted-foreground">No earnings data available for {competitor.name}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analysts">
          <Card className="bg-white shadow-sm">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-base font-semibold text-[#080707]">Analyst Reports</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {analystReports.length === 0 ? (
                <div className="p-8 text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-muted-foreground">No analyst reports available yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {analystReports.map((report) => (
                    <div key={report.id} className="p-4 hover:bg-gray-50 transition-colors" data-testid={`analyst-report-${report.id}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-[#080707]">{report.title}</h4>
                            {report.sentiment && (
                              <Badge variant="outline" className={cn("text-xs", getSentimentColor(report.sentiment))}>
                                {report.sentiment}
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground mb-2">
                            {report.source} • {report.publishedAt ? new Date(report.publishedAt).toLocaleDateString() : "Recent"}
                          </div>
                          {report.summary && (
                            <p className="text-sm text-muted-foreground line-clamp-2">{report.summary}</p>
                          )}
                        </div>
                        {report.url && (
                          <a href={report.url} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="sm" className="text-[#0176D3]">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transcripts">
          <Card className="bg-white shadow-sm">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-base font-semibold text-[#080707]">Earnings Call Transcripts</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {transcripts.length === 0 ? (
                <div className="p-8 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-muted-foreground">No transcripts available yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {transcripts.map((transcript) => (
                    <div key={transcript.id} className="p-4 hover:bg-gray-50 transition-colors" data-testid={`transcript-${transcript.id}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-[#080707]">{transcript.title}</h4>
                          <div className="text-sm text-muted-foreground">
                            {transcript.publishedAt ? new Date(transcript.publishedAt).toLocaleDateString() : "Recent"}
                          </div>
                        </div>
                        {transcript.url && (
                          <a href={transcript.url} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm" className="gap-2">
                              <ExternalLink className="h-4 w-4" />
                              Full Transcript
                            </Button>
                          </a>
                        )}
                      </div>
                      {transcript.content && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-6">
                            {transcript.content}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reactions">
          <Card className="bg-white shadow-sm">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-[#080707]">
                <Twitter className="h-5 w-5" />
                X (Twitter) Reactions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {xReactions.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-muted-foreground">No X reactions captured yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {xReactions.map((reaction) => (
                    <div key={reaction.id} className="p-4 hover:bg-gray-50 transition-colors" data-testid={`x-reaction-${reaction.id}`}>
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <Twitter className="h-5 w-5 text-gray-500" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-[#080707]">{reaction.source || "@user"}</span>
                            {reaction.sentiment && (
                              <Badge variant="outline" className={cn("text-xs", getSentimentColor(reaction.sentiment))}>
                                {reaction.sentiment === "positive" ? <ThumbsUp className="h-3 w-3 mr-1" /> : 
                                 reaction.sentiment === "negative" ? <ThumbsDown className="h-3 w-3 mr-1" /> : null}
                                {reaction.sentiment}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{reaction.content || reaction.summary}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            {reaction.engagementCount > 0 && (
                              <span>{reaction.engagementCount.toLocaleString()} engagements</span>
                            )}
                            {reaction.publishedAt && (
                              <span>{new Date(reaction.publishedAt).toLocaleDateString()}</span>
                            )}
                            {reaction.url && (
                              <a href={reaction.url} target="_blank" rel="noopener noreferrer" className="text-[#0176D3] hover:underline">
                                View on X
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="articles">
          <Card className="bg-white shadow-sm">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-base font-semibold text-[#080707]">News & Articles</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {articles.length === 0 ? (
                <div className="p-8 text-center">
                  <Newspaper className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-muted-foreground">No articles available yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {articles.map((article) => (
                    <div key={article.id} className="p-4 hover:bg-gray-50 transition-colors" data-testid={`article-${article.id}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-[#080707]">{article.title}</h4>
                            {article.sentiment && (
                              <Badge variant="outline" className={cn("text-xs", getSentimentColor(article.sentiment))}>
                                {article.sentiment}
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground mb-2">
                            {article.source} • {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : "Recent"}
                          </div>
                          {article.summary && (
                            <p className="text-sm text-muted-foreground line-clamp-2">{article.summary}</p>
                          )}
                        </div>
                        {article.url && (
                          <a href={article.url} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="sm" className="text-[#0176D3]">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
