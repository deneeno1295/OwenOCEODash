import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, TrendingUp, MessageSquare, Globe, ArrowRight, ExternalLink } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

interface Competitor {
  id: number;
  name: string;
  type: string;
  score: number;
  trend: string;
}

const fallbackCompetitors = [
  { id: 1, name: "HubSpot", score: 82, trend: "up", type: "Enterprise" },
  { id: 2, name: "Salesforce", score: 88, trend: "up", type: "Enterprise" },
  { id: 3, name: "Zoho", score: 71, trend: "down", type: "SMB" },
  { id: 4, name: "Microsoft Dynamics", score: 79, trend: "up", type: "Enterprise" },
  { id: 5, name: "Pipedrive", score: 65, trend: "up", type: "SMB" },
];

const analysis = {
  summary: "HubSpot is aggressively targeting the enterprise segment with new AI-driven Service Hub features. Sentiment analysis indicates strong adoption among mid-market users, but enterprise hesitation remains due to customization limits.",
  topics: [
    { topic: "AI Features", sentiment: "Positive", score: 92 },
    { topic: "Pricing Model", sentiment: "Mixed", score: 45 },
    { topic: "Customer Support", sentiment: "Positive", score: 88 },
    { topic: "Customization", sentiment: "Negative", score: 32 },
  ],
  sources: ["G2 Crowd", "Twitter/X", "TechCrunch", "Reddit r/saas"],
};

export default function Sentiment() {
  const { data: apiCompetitors = [] } = useQuery<Competitor[]>({
    queryKey: ["competitors"],
    queryFn: async () => {
      const res = await fetch("/api/competitors");
      if (!res.ok) throw new Error("Failed to fetch competitors");
      return res.json();
    },
  });

  const competitors = apiCompetitors.length > 0 ? apiCompetitors : fallbackCompetitors;
  const [selectedComp, setSelectedComp] = useState<Competitor | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const activeComp = selectedComp || competitors[0];

  const handleRefresh = () => {
    setAnalyzing(true);
    setTimeout(() => setAnalyzing(false), 2000);
  };

  const getTrendDisplay = (trend: string) => {
    if (trend === "up") return "+1.2%";
    if (trend === "down") return "-2.3%";
    return "+0.5%";
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-border shadow-sm">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#080707]">Market Sentiment Analysis</h1>
          <p className="text-muted-foreground text-sm">Powered by xAI Grok & Perplexity</p>
        </div>
        <Button onClick={handleRefresh} disabled={analyzing} className="bg-[#0176D3] hover:bg-[#014486] text-white rounded-sm shadow-none">
          <RefreshCw className={cn("mr-2 h-4 w-4", analyzing && "animate-spin")} />
          {analyzing ? "Running Agents..." : "Refresh Intelligence"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Competitor List */}
        <Card className="md:col-span-3 shadow-sm bg-white border-border">
          <CardHeader className="py-4 border-b border-gray-100">
            <CardTitle className="text-base font-semibold text-[#080707]">Tracked Competitors</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {competitors.map((comp) => (
                <button
                  key={comp.id}
                  onClick={() => setSelectedComp(comp)}
                  className={cn(
                    "w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left",
                    activeComp?.id === comp.id && "bg-blue-50 border-l-4 border-[#0176D3]"
                  )}
                  data-testid={`competitor-${comp.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-sm flex items-center justify-center text-xs font-bold",
                      activeComp?.id === comp.id ? "bg-[#0176D3] text-white" : "bg-gray-100 text-gray-600"
                    )}>
                      {comp.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className={cn("font-medium text-sm", activeComp?.id === comp.id ? "text-[#0176D3]" : "text-[#080707]")}>
                        {comp.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{comp.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-[#080707]">{comp.score}</div>
                    <div className={cn(
                      "text-xs",
                      comp.trend === "up" || comp.trend.startsWith("+") ? "text-green-600" : "text-red-600"
                    )}>
                      {getTrendDisplay(comp.trend)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Analysis View - Full Width */}
        <Card className="md:col-span-9 shadow-sm bg-white border-border">
          <CardHeader className="pb-4 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg flex items-center gap-2 text-[#080707]">
                  <Globe className="h-4 w-4 text-[#0176D3]" />
                  {activeComp?.name || "Select Competitor"} Intelligence Report
                </CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-50 text-[#0176D3] border-blue-200 px-2 py-0.5 text-xs">
                  AI Confidence: 94%
                </Badge>
                {activeComp && (
                  <Link href={`/competitors/${activeComp.id}`}>
                    <Button variant="outline" size="sm" className="gap-1 text-[#0176D3] border-[#0176D3]" data-testid="button-view-full-details">
                      Full Details
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            
            {/* Summary Section */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="h-3 w-3" />
                Executive Summary
              </h3>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200 text-sm leading-relaxed text-[#080707]">
                {analysis.summary}
              </div>
            </div>

            {/* Hot Topics Grid */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="h-3 w-3" />
                Hot Topics & Sentiment
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {analysis.topics.map((topic, i) => (
                  <div key={i} className="flex flex-col p-3 rounded-md border border-gray-200 bg-white hover:border-blue-300 transition-colors">
                    <span className="text-sm font-medium text-[#080707] mb-2">{topic.topic}</span>
                    <div className="flex items-center gap-2 mt-auto">
                      <span className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full font-medium",
                        topic.sentiment === "Positive" ? "bg-green-100 text-green-700" :
                        topic.sentiment === "Negative" ? "bg-red-100 text-red-700" :
                        "bg-yellow-100 text-yellow-700"
                      )}>
                        {topic.sentiment}
                      </span>
                      <span className="text-xs font-mono text-muted-foreground">{topic.score}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sources */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Data Sources
              </h3>
              <div className="flex flex-wrap gap-2">
                {analysis.sources.map((source, i) => (
                  <Badge key={i} variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                    {source}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Strategic Recommendation */}
            <div className="pt-4">
              <div className="bg-blue-50 p-4 border-l-4 border-[#0176D3] rounded-r-md">
                <h4 className="font-bold text-[#0176D3] mb-1 flex items-center text-sm">
                  Strategic Opportunity <ArrowRight className="h-3 w-3 ml-2" />
                </h4>
                <p className="text-xs text-slate-700">
                  Counter their Enterprise push by emphasizing our superior customization capabilities. Launch "No-Limits" campaign targeting their churned mid-market customers.
                </p>
              </div>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
