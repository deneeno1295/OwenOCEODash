import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  Newspaper, 
  Sparkles,
  Clock,
  Zap,
  FileText,
  ExternalLink,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  ChevronRight,
  Search,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";

interface Competitor {
  id: number;
  name: string;
  type: string;
  score: number;
  trend: string;
}

interface NewsItem {
  id: number;
  category: string;
  title: string;
  summary: string | null;
  source: string | null;
  url: string | null;
  competitorId: number | null;
  traction: number;
  sentiment: string | null;
  publishedAt: string | null;
  createdAt: string;
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

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [selectedItem, setSelectedItem] = useState<EarningsReport | NewsItem | null>(null);
  const [itemType, setItemType] = useState<"earnings" | "news" | null>(null);
  const [isResearching, setIsResearching] = useState(false);

  const { data: competitors = [] } = useQuery<Competitor[]>({
    queryKey: ["competitors"],
    queryFn: async () => {
      const res = await fetch("/api/competitors");
      if (!res.ok) throw new Error("Failed to fetch competitors");
      return res.json();
    },
  });

  const { data: allNews = [], isLoading: newsLoading } = useQuery<NewsItem[]>({
    queryKey: ["news"],
    queryFn: async () => {
      const res = await fetch("/api/news?limit=30");
      if (!res.ok) throw new Error("Failed to fetch news");
      return res.json();
    },
  });

  const { data: earningsReports = [], isLoading: earningsLoading } = useQuery<EarningsReport[]>({
    queryKey: ["earnings"],
    queryFn: async () => {
      const res = await fetch("/api/earnings?limit=10");
      if (!res.ok) throw new Error("Failed to fetch earnings");
      return res.json();
    },
  });

  const findCompetitorByName = (companyName: string): Competitor | undefined => {
    return competitors.find(c => 
      c.name.toLowerCase() === companyName.toLowerCase() ||
      companyName.toLowerCase().includes(c.name.toLowerCase())
    );
  };

  const navigateToCompetitor = (report: EarningsReport) => {
    const competitor = findCompetitorByName(report.companyName);
    if (competitor) {
      setLocation(`/competitors/${competitor.id}`);
    } else {
      openEarningsDetail(report);
    }
  };

  const techNews = allNews.filter(n => n.category === "tech_news");
  const salesforceNews = allNews.filter(n => n.category === "salesforce");
  const earningsNews = allNews.filter(n => n.category === "earnings");

  const formatTraction = (traction: number) => {
    if (traction >= 10000) return `${(traction / 1000).toFixed(1)}K`;
    if (traction >= 1000) return `${(traction / 1000).toFixed(1)}K`;
    return traction.toString();
  };

  const getSentimentBadge = (sentiment: string | null) => {
    switch (sentiment) {
      case "positive":
        return <Badge className="bg-green-50 text-green-700 border-green-200">Positive</Badge>;
      case "negative":
        return <Badge className="bg-red-50 text-red-700 border-red-200">Negative</Badge>;
      default:
        return <Badge className="bg-gray-50 text-gray-700 border-gray-200">Neutral</Badge>;
    }
  };

  const getBeatMissBadge = (beatMiss: string | null) => {
    switch (beatMiss) {
      case "beat":
        return <Badge className="bg-green-100 text-green-700 border-0">Beat</Badge>;
      case "miss":
        return <Badge className="bg-red-100 text-red-700 border-0">Miss</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-600 border-0">Inline</Badge>;
    }
  };

  const getGuidanceBadge = (guidance: string | null) => {
    switch (guidance) {
      case "raised":
        return <span className="text-green-600 text-xs font-medium flex items-center gap-1"><ArrowUpRight className="h-3 w-3" />Raised</span>;
      case "lowered":
        return <span className="text-red-600 text-xs font-medium flex items-center gap-1"><ArrowDownRight className="h-3 w-3" />Lowered</span>;
      default:
        return <span className="text-gray-500 text-xs font-medium flex items-center gap-1"><Minus className="h-3 w-3" />Maintained</span>;
    }
  };

  const getStockReactionColor = (reaction: string | null) => {
    if (!reaction) return "text-gray-600";
    return reaction.startsWith("+") ? "text-green-600" : reaction.startsWith("-") ? "text-red-600" : "text-gray-600";
  };

  const openEarningsDetail = (report: EarningsReport) => {
    setSelectedItem(report);
    setItemType("earnings");
  };

  const openNewsDetail = (item: NewsItem) => {
    setSelectedItem(item);
    setItemType("news");
  };

  const handleDeepResearch = async () => {
    setIsResearching(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsResearching(false);
  };

  const getRelatedArticles = (companyName: string) => {
    return earningsNews.filter(n => 
      n.title.toLowerCase().includes(companyName.toLowerCase())
    ).slice(0, 2);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-border shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-[#080707]">Intelligence Feed</h1>
          <p className="text-sm text-muted-foreground">Technology earnings, tech news & Salesforce updates</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground bg-gray-50 px-3 py-1 rounded-md border border-gray-200 flex items-center gap-2">
            <Clock className="h-3.5 w-3.5" />
            Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      {/* Single Column Layout */}
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Technology Earnings - Top */}
        <Card className="shadow-sm bg-white border-l-4 border-green-600">
          <CardHeader className="border-b border-gray-100 pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-[#080707]">
              <DollarSign className="h-5 w-5 text-green-600" />
              Technology Earnings
              <Badge variant="outline" className="ml-2 text-xs">{earningsReports.length} reports</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {earningsLoading ? (
              <div className="p-8 text-center text-muted-foreground">Loading...</div>
            ) : earningsReports.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <DollarSign className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No earnings reports yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {earningsReports.map((report) => (
                  <div 
                    key={report.id}
                    className="p-4 hover:bg-gray-50 transition-colors cursor-pointer group"
                    onClick={() => navigateToCompetitor(report)}
                    data-testid={`earnings-${report.id}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-[#080707]">{report.companyName}</h3>
                          {getBeatMissBadge(report.beatMiss)}
                          {getGuidanceBadge(report.guidance)}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{report.quarter} {report.fiscalYear}</p>
                        
                        <div className="grid grid-cols-3 gap-4 mt-2">
                          <div className="bg-gray-50 rounded p-2">
                            <p className="text-[10px] text-muted-foreground uppercase mb-1">Revenue vs Est.</p>
                            <div className="flex items-baseline gap-1.5">
                              <span className="font-semibold text-sm">{report.revenue}</span>
                              {report.revenueBeatMiss && (
                                <span className={cn("text-xs font-medium", report.revenueBeatMiss.startsWith("+") ? "text-green-600" : "text-red-600")}>
                                  {report.revenueBeatMiss}
                                </span>
                              )}
                            </div>
                            {report.revenueExpected && (
                              <p className="text-[10px] text-muted-foreground mt-0.5">Est: {report.revenueExpected}</p>
                            )}
                          </div>
                          
                          <div className="bg-gray-50 rounded p-2">
                            <p className="text-[10px] text-muted-foreground uppercase mb-1">EPS vs Est.</p>
                            <div className="flex items-baseline gap-1.5">
                              <span className="font-semibold text-sm">{report.eps}</span>
                              {report.epsBeatMiss && (
                                <span className={cn("text-xs font-medium", report.epsBeatMiss.startsWith("+") ? "text-green-600" : "text-red-600")}>
                                  {report.epsBeatMiss}
                                </span>
                              )}
                            </div>
                            {report.epsExpected && (
                              <p className="text-[10px] text-muted-foreground mt-0.5">Est: {report.epsExpected}</p>
                            )}
                          </div>
                          
                          <div className="bg-gray-50 rounded p-2">
                            <p className="text-[10px] text-muted-foreground uppercase mb-1">Stock Reaction</p>
                            <span className={cn("font-semibold text-sm", getStockReactionColor(report.stockReaction))}>
                              {report.stockReaction || "—"}
                            </span>
                            {report.stockReactionTime && (
                              <p className="text-[10px] text-muted-foreground mt-0.5">{report.stockReactionTime}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-[#0176D3] transition-colors ml-3 mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tech Headlines - Middle */}
        <Card className="shadow-sm bg-white border-l-4 border-purple-600">
          <CardHeader className="border-b border-gray-100 pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-[#080707]">
              <Newspaper className="h-5 w-5 text-purple-600" />
              Tech Headlines
              <Badge variant="outline" className="ml-2 text-xs">{techNews.length} articles</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {newsLoading ? (
              <div className="p-8 text-center text-muted-foreground">Loading...</div>
            ) : techNews.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Newspaper className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No tech news yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {techNews.map((item) => (
                  <div 
                    key={item.id}
                    className="p-4 hover:bg-gray-50 transition-colors cursor-pointer group"
                    onClick={() => openNewsDetail(item)}
                    data-testid={`news-item-${item.id}`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {item.source && (
                            <span className="text-xs text-muted-foreground">{item.source}</span>
                          )}
                          {getSentimentBadge(item.sentiment)}
                        </div>
                        <h3 className="font-medium text-[#080707] group-hover:text-[#0176D3] transition-colors line-clamp-1">
                          {item.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Zap className="h-3 w-3" />
                          <span>{formatTraction(item.traction || 0)}</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-[#0176D3] transition-colors" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Salesforce Updates - Bottom */}
        <Card className="shadow-sm bg-white border-l-4 border-[#0176D3]">
          <CardHeader className="border-b border-gray-100 pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-[#080707]">
              <Sparkles className="h-5 w-5 text-[#0176D3]" />
              Salesforce Updates
              <Badge variant="outline" className="ml-2 text-xs">{salesforceNews.length} updates</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {newsLoading ? (
              <div className="p-8 text-center text-muted-foreground">Loading...</div>
            ) : salesforceNews.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Sparkles className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No Salesforce news yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {salesforceNews.map((item) => (
                  <div 
                    key={item.id}
                    className="p-4 hover:bg-gray-50 transition-colors cursor-pointer group"
                    onClick={() => openNewsDetail(item)}
                    data-testid={`news-item-${item.id}`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {item.source && (
                            <span className="text-xs text-muted-foreground">{item.source}</span>
                          )}
                          {getSentimentBadge(item.sentiment)}
                        </div>
                        <h3 className="font-medium text-[#080707] group-hover:text-[#0176D3] transition-colors line-clamp-1">
                          {item.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Zap className="h-3 w-3" />
                          <span>{formatTraction(item.traction || 0)}</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-[#0176D3] transition-colors" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="bg-white max-w-2xl max-h-[80vh] overflow-hidden">
          {itemType === "earnings" && selectedItem && "companyName" in selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  {selectedItem.companyName} - {selectedItem.quarter} {selectedItem.fiscalYear}
                </DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-[60vh] pr-4">
                <div className="space-y-4 mt-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getBeatMissBadge(selectedItem.beatMiss)}
                    {getGuidanceBadge(selectedItem.guidance)}
                    {selectedItem.guidanceVsExpectations && (
                      <Badge variant="outline" className={cn(
                        "text-xs",
                        selectedItem.guidanceVsExpectations === "above" ? "bg-green-50 text-green-700 border-green-200" :
                        selectedItem.guidanceVsExpectations === "below" ? "bg-red-50 text-red-700 border-red-200" :
                        "bg-gray-50 text-gray-600 border-gray-200"
                      )}>
                        Guidance {selectedItem.guidanceVsExpectations === "above" ? "Above" : selectedItem.guidanceVsExpectations === "below" ? "Below" : "In Line With"} Expectations
                      </Badge>
                    )}
                  </div>

                  {selectedItem.beatMissDetails && (
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                      <p className="text-sm text-blue-900">{selectedItem.beatMissDetails}</p>
                    </div>
                  )}

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Results vs. Expectations</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedItem.revenue && (
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Revenue</p>
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl font-bold">{selectedItem.revenue}</span>
                            {selectedItem.revenueBeatMiss && (
                              <span className={cn("text-sm font-semibold", selectedItem.revenueBeatMiss.startsWith("+") ? "text-green-600" : "text-red-600")}>
                                {selectedItem.revenueBeatMiss}
                              </span>
                            )}
                          </div>
                          {selectedItem.revenueExpected && (
                            <p className="text-xs text-muted-foreground mt-1">Expected: {selectedItem.revenueExpected}</p>
                          )}
                          {selectedItem.revenueChange && (
                            <p className="text-xs text-muted-foreground">YoY: {selectedItem.revenueChange}</p>
                          )}
                        </div>
                      )}
                      {selectedItem.eps && (
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">EPS</p>
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl font-bold">{selectedItem.eps}</span>
                            {selectedItem.epsBeatMiss && (
                              <span className={cn("text-sm font-semibold", selectedItem.epsBeatMiss.startsWith("+") ? "text-green-600" : "text-red-600")}>
                                {selectedItem.epsBeatMiss}
                              </span>
                            )}
                          </div>
                          {selectedItem.epsExpected && (
                            <p className="text-xs text-muted-foreground mt-1">Expected: {selectedItem.epsExpected}</p>
                          )}
                          {selectedItem.epsChange && (
                            <p className="text-xs text-muted-foreground">YoY: {selectedItem.epsChange}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {(selectedItem.nextQuarterRevenue || selectedItem.fullYearRevenue) && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Guidance</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {(selectedItem.nextQuarterRevenue || selectedItem.nextQuarterEps) && (
                          <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
                            <p className="text-xs text-amber-800 uppercase tracking-wider mb-2">Next Quarter</p>
                            {selectedItem.nextQuarterRevenue && (
                              <p className="text-sm"><span className="font-medium">Revenue:</span> {selectedItem.nextQuarterRevenue}</p>
                            )}
                            {selectedItem.nextQuarterEps && (
                              <p className="text-sm"><span className="font-medium">EPS:</span> {selectedItem.nextQuarterEps}</p>
                            )}
                          </div>
                        )}
                        {(selectedItem.fullYearRevenue || selectedItem.fullYearEps) && (
                          <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                            <p className="text-xs text-purple-800 uppercase tracking-wider mb-2">Full Year</p>
                            {selectedItem.fullYearRevenue && (
                              <p className="text-sm"><span className="font-medium">Revenue:</span> {selectedItem.fullYearRevenue}</p>
                            )}
                            {selectedItem.fullYearEps && (
                              <p className="text-sm"><span className="font-medium">EPS:</span> {selectedItem.fullYearEps}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedItem.guidanceNotes && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Management Commentary</p>
                      <p className="text-sm">{selectedItem.guidanceNotes}</p>
                    </div>
                  )}

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Market Reaction</h4>
                    <div className="grid grid-cols-3 gap-3">
                      {selectedItem.stockReaction && (
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                          <p className="text-xs text-muted-foreground uppercase mb-1">Stock Move</p>
                          <span className={cn("text-xl font-bold", getStockReactionColor(selectedItem.stockReaction))}>
                            {selectedItem.stockReaction}
                          </span>
                          {selectedItem.stockReactionTime && (
                            <p className="text-xs text-muted-foreground mt-1">{selectedItem.stockReactionTime}</p>
                          )}
                        </div>
                      )}
                      {selectedItem.analystReaction && (
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                          <p className="text-xs text-muted-foreground uppercase mb-1">Analyst Reaction</p>
                          <span className={cn("text-sm font-semibold capitalize", 
                            selectedItem.analystReaction === "mostly positive" ? "text-green-600" :
                            selectedItem.analystReaction === "cautious" || selectedItem.analystReaction === "negative" ? "text-red-600" :
                            "text-amber-600"
                          )}>
                            {selectedItem.analystReaction}
                          </span>
                        </div>
                      )}
                      {selectedItem.priceTargetChanges && (
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                          <p className="text-xs text-muted-foreground uppercase mb-1">Price Targets</p>
                          <span className="text-sm font-medium">{selectedItem.priceTargetChanges}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    {selectedItem.transcriptUrl && (
                      <a 
                        href={selectedItem.transcriptUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-[#0176D3] hover:underline flex items-center gap-1"
                      >
                        <FileText className="h-4 w-4" />
                        View Transcript
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {selectedItem.pressReleaseUrl && (
                      <a 
                        href={selectedItem.pressReleaseUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-[#0176D3] hover:underline flex items-center gap-1"
                      >
                        <Newspaper className="h-4 w-4" />
                        Press Release
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>

                  {/* Related Articles */}
                  {getRelatedArticles(selectedItem.companyName).length > 0 && (
                    <div className="border-t pt-4">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Related Coverage</p>
                      <div className="space-y-2">
                        {getRelatedArticles(selectedItem.companyName).map((article) => (
                          <div 
                            key={article.id}
                            className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                            onClick={() => article.url && window.open(article.url, '_blank')}
                          >
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                              <Newspaper className="h-3 w-3" />
                              {article.source}
                            </div>
                            <p className="text-sm">{article.title}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Deep Research Button */}
                  <div className="border-t pt-4">
                    <Button
                      onClick={handleDeepResearch}
                      disabled={isResearching}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      {isResearching ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Search className="h-4 w-4 mr-2" />
                      )}
                      {isResearching ? "Researching..." : "Deep Research on " + selectedItem.companyName}
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </>
          )}

          {itemType === "news" && selectedItem && "title" in selectedItem && !("companyName" in selectedItem) && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Newspaper className="h-5 w-5 text-purple-600" />
                  Article Details
                </DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-[60vh] pr-4">
                <div className="space-y-4 mt-4">
                  <div className="flex items-center gap-2">
                    {selectedItem.source && (
                      <Badge variant="outline">{selectedItem.source}</Badge>
                    )}
                    {getSentimentBadge(selectedItem.sentiment)}
                  </div>

                  <h2 className="text-xl font-semibold">{selectedItem.title}</h2>

                  {selectedItem.summary && (
                    <p className="text-muted-foreground">{selectedItem.summary}</p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Zap className="h-4 w-4" />
                      <span>{formatTraction(selectedItem.traction || 0)} traction</span>
                    </div>
                    {selectedItem.publishedAt && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(selectedItem.publishedAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {selectedItem.url && (
                    <a 
                      href={selectedItem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#0176D3] hover:underline"
                    >
                      Read Full Article
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}

                  {/* Deep Research Button */}
                  <div className="border-t pt-4">
                    <Button
                      onClick={handleDeepResearch}
                      disabled={isResearching}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      {isResearching ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Search className="h-4 w-4 mr-2" />
                      )}
                      {isResearching ? "Researching..." : "Deep Research on This Topic"}
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
