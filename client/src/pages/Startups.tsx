import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Rocket, 
  Search, 
  Pencil, 
  Zap, 
  Star, 
  Plus,
  ArrowRight,
  Loader2,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { Link } from "wouter";

interface Startup {
  id: number;
  name: string;
  stage: string;
  velocity: string;
  score: number;
  focus: string;
  category: string;
  description: string | null;
  fundingAmount: string | null;
  location: string | null;
  website: string | null;
  createdAt: string;
  updatedAt: string;
}

interface SearchResult {
  name: string;
  website: string;
  description: string;
  isExisting?: boolean;
  existingId?: number;
}

export default function Startups() {
  const [activeTab, setActiveTab] = useState("watchlist");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const queryClient = useQueryClient();

  const { data: allStartups = [], isLoading } = useQuery<Startup[]>({
    queryKey: ["startups"],
    queryFn: async () => {
      const res = await fetch("/api/startups");
      if (!res.ok) throw new Error("Failed to fetch startups");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (startup: Partial<Startup>) => {
      return apiRequest("POST", "/api/startups", startup);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["startups"] });
      setShowAddDialog(false);
      setSearchInput("");
      setSearchResults([]);
      setHasSearched(false);
    },
  });

  // Filter startups by category
  const watchlistStartups = allStartups.filter(s => s.category === "watchlist");
  const manualStartups = allStartups.filter(s => s.category === "manual");
  const automatedStartups = allStartups.filter(s => s.category === "automated");

  const handleSearch = async () => {
    if (!searchInput.trim()) return;
    
    setIsSearching(true);
    setHasSearched(true);
    
    // Simulate enrichment process - in real implementation this would call an API
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Check if startup already exists in our database
    const existingMatch = allStartups.find(s => 
      s.name.toLowerCase().includes(searchInput.toLowerCase()) ||
      s.website?.toLowerCase().includes(searchInput.toLowerCase())
    );
    
    // Generate mock enriched results
    const mockResults: SearchResult[] = [];
    
    if (existingMatch) {
      mockResults.push({
        name: existingMatch.name,
        website: existingMatch.website || "",
        description: existingMatch.description || "Already tracked in your database",
        isExisting: true,
        existingId: existingMatch.id,
      });
    }
    
    // Add potential matches based on input
    const inputLower = searchInput.toLowerCase();
    if (inputLower.includes("ai") || inputLower.includes("agent")) {
      mockResults.push({
        name: "AgentFlow AI",
        website: "https://agentflow.ai",
        description: "Autonomous AI agents for enterprise workflow automation. Series A, $15M raised.",
      });
    }
    if (inputLower.includes("data") || inputLower.includes("cloud")) {
      mockResults.push({
        name: "CloudSphere Data",
        website: "https://cloudspheredata.com",
        description: "Real-time data synchronization platform for multi-cloud environments. Seed, $5M raised.",
      });
    }
    if (inputLower.includes("crm") || inputLower.includes("sales")) {
      mockResults.push({
        name: "SalesNexus",
        website: "https://salesnexus.io",
        description: "AI-powered sales intelligence and CRM automation. Series B, $40M raised.",
      });
    }
    
    // Always add a generic match based on input
    if (mockResults.length === 0 || (mockResults.length === 1 && mockResults[0].isExisting)) {
      mockResults.push({
        name: searchInput.includes("http") ? new URL(searchInput).hostname.replace("www.", "").split(".")[0] : searchInput,
        website: searchInput.includes("http") ? searchInput : `https://${searchInput.toLowerCase().replace(/\s+/g, "")}.com`,
        description: "Startup details will be enriched after selection. Click to add to your tracking list.",
      });
    }
    
    setSearchResults(mockResults);
    setIsSearching(false);
  };

  const handleSelectResult = (result: SearchResult) => {
    if (result.isExisting && result.existingId) {
      // Navigate to existing startup
      window.location.href = `/startups/${result.existingId}`;
      return;
    }
    
    // Create new startup with enriched data
    createMutation.mutate({
      name: result.name,
      website: result.website,
      description: result.description,
      stage: "Seed",
      velocity: "Medium",
      score: 50,
      focus: "Technology",
      category: activeTab === "watchlist" ? "watchlist" : "manual",
    });
  };

  const getVelocityBadge = (velocity: string) => {
    switch (velocity) {
      case "Extreme":
        return <Badge className="bg-red-100 text-red-700 border-0">{velocity}</Badge>;
      case "High":
        return <Badge className="bg-orange-100 text-orange-700 border-0">{velocity}</Badge>;
      case "Medium":
        return <Badge className="bg-blue-100 text-blue-700 border-0">{velocity}</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-700 border-0">{velocity}</Badge>;
    }
  };

  const StartupTable = ({ startups, emptyMessage }: { startups: Startup[], emptyMessage: string }) => (
    <Card className="border-t-4 border-[#0176D3] shadow-sm bg-white">
      <CardContent className="p-0">
        {startups.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Rocket className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>{emptyMessage}</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-gray-100">
                <TableHead className="text-gray-600 font-bold">Startup Name</TableHead>
                <TableHead className="text-gray-600 font-bold">Stage</TableHead>
                <TableHead className="text-gray-600 font-bold">Focus Area</TableHead>
                <TableHead className="text-gray-600 font-bold">Hiring Velocity</TableHead>
                <TableHead className="text-gray-600 font-bold">Hot Score</TableHead>
                <TableHead className="text-right text-gray-600 font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {startups.map((s) => (
                <TableRow key={s.id} className="group hover:bg-gray-50 border-gray-100" data-testid={`startup-row-${s.id}`}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-[#0176D3]">{s.name}</span>
                      {s.location && <span className="text-xs text-muted-foreground">{s.location}</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-gray-200">{s.stage}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{s.focus}</TableCell>
                  <TableCell>{getVelocityBadge(s.velocity)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#080707]">{s.score}</span>
                      <div className="h-1.5 w-16 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#0176D3] to-purple-600" 
                          style={{ width: `${s.score}%` }} 
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/startups/${s.id}`}>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 gap-1 text-[#0176D3] hover:text-[#014486] hover:bg-blue-50"
                          data-testid={`button-view-startup-${s.id}`}
                        >
                          View Details
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-border shadow-sm">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#080707]">Startups Radar</h1>
          <p className="text-sm text-muted-foreground">Track emerging competitors and acquisition targets</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={(open) => {
          setShowAddDialog(open);
          if (!open) {
            setSearchInput("");
            setSearchResults([]);
            setHasSearched(false);
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-[#0176D3] hover:bg-[#014486]">
              <Plus className="h-4 w-4 mr-2" />
              Add Startup
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-white">
            <DialogHeader>
              <DialogTitle>Add Startup to Track</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Enter startup name or website URL</Label>
                <div className="flex gap-2">
                  <Input
                    data-testid="input-startup-search"
                    placeholder="e.g., Figma or https://figma.com"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                  <Button 
                    onClick={handleSearch}
                    disabled={!searchInput.trim() || isSearching}
                    className="bg-[#0176D3] hover:bg-[#014486]"
                    data-testid="button-search-startup"
                  >
                    {isSearching ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  We'll enrich the data automatically using public sources
                </p>
              </div>

              {isSearching && (
                <div className="py-8 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-[#0176D3]" />
                  <p className="text-sm text-muted-foreground">Searching and enriching data...</p>
                </div>
              )}

              {hasSearched && !isSearching && searchResults.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                    Potential Matches
                  </Label>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {searchResults.map((result, index) => (
                      <div 
                        key={index}
                        className={cn(
                          "p-3 rounded-lg border cursor-pointer transition-all hover:border-[#0176D3] hover:bg-blue-50/50",
                          result.isExisting ? "border-green-200 bg-green-50/50" : "border-gray-200"
                        )}
                        onClick={() => handleSelectResult(result)}
                        data-testid={`search-result-${index}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-[#080707]">{result.name}</span>
                              {result.isExisting && (
                                <Badge className="bg-green-100 text-green-700 border-0 text-[10px]">
                                  Already Tracked
                                </Badge>
                              )}
                            </div>
                            <a 
                              href={result.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-[#0176D3] hover:underline flex items-center gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {result.website}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {result.description}
                            </p>
                          </div>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="shrink-0 text-[#0176D3]"
                          >
                            {result.isExisting ? "View" : "Add"}
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {hasSearched && !isSearching && searchResults.length === 0 && (
                <div className="py-6 text-center text-muted-foreground">
                  <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No matches found. Try a different search term.</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-white border border-gray-200 p-1">
          <TabsTrigger 
            value="watchlist" 
            className="data-[state=active]:bg-[#0176D3] data-[state=active]:text-white"
            data-testid="tab-watchlist"
          >
            <Star className="h-4 w-4 mr-2" />
            Watch List ({watchlistStartups.length})
          </TabsTrigger>
          <TabsTrigger 
            value="manual" 
            className="data-[state=active]:bg-[#0176D3] data-[state=active]:text-white"
            data-testid="tab-manual"
          >
            <Pencil className="h-4 w-4 mr-2" />
            Manual ({manualStartups.length})
          </TabsTrigger>
          <TabsTrigger 
            value="automated" 
            className="data-[state=active]:bg-[#0176D3] data-[state=active]:text-white"
            data-testid="tab-automated"
          >
            <Zap className="h-4 w-4 mr-2" />
            Automated Discovery ({automatedStartups.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="watchlist" className="mt-4">
          <StartupTable 
            startups={watchlistStartups} 
            emptyMessage="No startups in your watch list. Add startups you want to track closely."
          />
        </TabsContent>

        <TabsContent value="manual" className="mt-4">
          <StartupTable 
            startups={manualStartups} 
            emptyMessage="No manually added startups. Click 'Add Startup' to track a new company."
          />
        </TabsContent>

        <TabsContent value="automated" className="mt-4">
          <StartupTable 
            startups={automatedStartups} 
            emptyMessage="No startups discovered automatically yet. The system will populate this list as it discovers new companies."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
