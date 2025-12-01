import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Rocket, 
  MapPin, 
  DollarSign, 
  Globe, 
  TrendingUp,
  Star,
  ExternalLink,
  Calendar,
  Zap,
  Target,
  Building,
  Edit2,
  Trash2,
  FileText,
  Sparkles,
  Bot,
  Search,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

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

interface Note {
  id: number;
  entityType: string;
  entityId: number;
  content: string;
  noteType: string;
  author: string | null;
  createdAt: string;
}

interface ResearchSession {
  id: number;
  entityType: string;
  entityId: number;
  context: string | null;
  status: string;
  results: string | null;
  createdAt: string;
  completedAt: string | null;
}

interface StartupDetailProps {
  id: string;
}

export default function StartupDetail({ id }: StartupDetailProps) {
  const [, setLocation] = useLocation();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editData, setEditData] = useState<Partial<Startup>>({});
  const [newNote, setNewNote] = useState({ content: "", noteType: "general" });
  const [slackContext, setSlackContext] = useState("");
  const [researchContext, setResearchContext] = useState("");
  const queryClient = useQueryClient();

  const { data: startup, isLoading, error } = useQuery<Startup>({
    queryKey: ["startup", id],
    queryFn: async () => {
      const res = await fetch(`/api/startups/${id}`);
      if (!res.ok) throw new Error("Failed to fetch startup");
      return res.json();
    },
  });

  const { data: notes = [] } = useQuery<Note[]>({
    queryKey: ["notes", "startup", id],
    queryFn: async () => {
      const res = await fetch(`/api/notes/startup/${id}`);
      if (!res.ok) throw new Error("Failed to fetch notes");
      return res.json();
    },
  });

  const { data: researchSessions = [] } = useQuery<ResearchSession[]>({
    queryKey: ["research", "startup", id],
    queryFn: async () => {
      const res = await fetch(`/api/research/startup/${id}`);
      if (!res.ok) throw new Error("Failed to fetch research");
      return res.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Startup>) => {
      return apiRequest("PATCH", `/api/startups/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["startup", id] });
      queryClient.invalidateQueries({ queryKey: ["startups"] });
      setShowEditDialog(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", `/api/startups/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["startups"] });
      setLocation("/startups");
    },
  });

  const addNoteMutation = useMutation({
    mutationFn: async (data: { content: string; noteType: string }) => {
      return apiRequest("POST", "/api/notes", {
        entityType: "startup",
        entityId: parseInt(id),
        ...data,
        author: "Marc B.",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", "startup", id] });
      setNewNote({ content: "", noteType: "general" });
      setSlackContext("");
    },
  });

  const startResearchMutation = useMutation({
    mutationFn: async (context: string) => {
      return apiRequest("POST", "/api/research", {
        entityType: "startup",
        entityId: parseInt(id),
        context,
        status: "running",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["research", "startup", id] });
      setResearchContext("");
    },
  });

  const handleEdit = () => {
    if (startup) {
      setEditData({
        name: startup.name,
        stage: startup.stage,
        velocity: startup.velocity,
        score: startup.score,
        focus: startup.focus,
        category: startup.category,
        description: startup.description,
        fundingAmount: startup.fundingAmount,
        location: startup.location,
        website: startup.website,
      });
      setShowEditDialog(true);
    }
  };

  const handleSave = () => {
    updateMutation.mutate(editData);
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this startup?")) {
      deleteMutation.mutate();
    }
  };

  const getVelocityColor = (velocity: string) => {
    switch (velocity) {
      case "Extreme":
        return "bg-red-100 text-red-700";
      case "High":
        return "bg-orange-100 text-orange-700";
      case "Medium":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "watchlist":
        return "bg-yellow-100 text-yellow-700";
      case "manual":
        return "bg-purple-100 text-purple-700";
      case "automated":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "watchlist":
        return "Watch List";
      case "manual":
        return "Manual Entry";
      case "automated":
        return "Automated Discovery";
      default:
        return category;
    }
  };

  const getNoteTypeLabel = (type: string) => {
    switch (type) {
      case "slackbot":
        return "Slack Context";
      case "transcript":
        return "Transcript";
      case "research":
        return "Research";
      default:
        return "Note";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading startup details...</div>
      </div>
    );
  }

  if (error || !startup) {
    return (
      <div className="space-y-6">
        <Link href="/startups">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Startups
          </Button>
        </Link>
        <Card className="bg-white">
          <CardContent className="p-8 text-center">
            <Rocket className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-muted-foreground">Startup not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Back Navigation */}
      <div className="flex items-center justify-between">
        <Link href="/startups">
          <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-[#0176D3]" data-testid="button-back-to-startups">
            <ArrowLeft className="h-4 w-4" />
            Back to Startups
          </Button>
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleEdit} data-testid="button-edit-startup">
            <Edit2 className="h-4 w-4" />
            Edit
          </Button>
          <Button 
            variant="outline" 
            className="gap-2 text-red-600 border-red-200 hover:bg-red-50" 
            onClick={handleDelete}
            data-testid="button-delete-startup"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Header Card */}
      <Card className="bg-white border-t-4 border-[#0176D3] shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-[#0176D3] to-purple-600 flex items-center justify-center">
                <Rocket className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#080707]" data-testid="text-startup-name">{startup.name}</h1>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={cn("border-0", getCategoryColor(startup.category))}>
                    {getCategoryLabel(startup.category)}
                  </Badge>
                  <Badge variant="outline" className="border-gray-200">{startup.stage}</Badge>
                  <Badge className={cn("border-0", getVelocityColor(startup.velocity))}>
                    <Zap className="h-3 w-3 mr-1" />
                    {startup.velocity} Velocity
                  </Badge>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground mb-1">Hot Score</div>
              <div className="text-4xl font-light text-[#0176D3]">{startup.score}</div>
              <div className="h-2 w-24 bg-gray-200 rounded-full overflow-hidden mt-2">
                <div 
                  className="h-full bg-gradient-to-r from-[#0176D3] to-purple-600" 
                  style={{ width: `${startup.score}%` }} 
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Section */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-white border border-gray-200 p-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-[#0176D3] data-[state=active]:text-white gap-2">
            <Rocket className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="notes" className="data-[state=active]:bg-[#0176D3] data-[state=active]:text-white gap-2">
            <FileText className="h-4 w-4" />
            Notes & Context ({notes.length})
          </TabsTrigger>
          <TabsTrigger value="research" className="data-[state=active]:bg-[#0176D3] data-[state=active]:text-white gap-2">
            <Sparkles className="h-4 w-4" />
            Deep Research ({researchSessions.length})
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Main Info */}
            <div className="md:col-span-2 space-y-6">
              {/* Description */}
              <Card className="bg-white shadow-sm">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="text-base font-semibold text-[#080707]">About</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-muted-foreground" data-testid="text-startup-description">
                    {startup.description || "No description available."}
                  </p>
                </CardContent>
              </Card>

              {/* Key Metrics */}
              <Card className="bg-white shadow-sm">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="text-base font-semibold text-[#080707]">Key Metrics</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Target className="h-6 w-6 mx-auto mb-2 text-[#0176D3]" />
                      <div className="text-sm text-muted-foreground">Focus</div>
                      <div className="font-medium text-[#080707]">{startup.focus}</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Building className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                      <div className="text-sm text-muted-foreground">Stage</div>
                      <div className="font-medium text-[#080707]">{startup.stage}</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                      <div className="text-sm text-muted-foreground">Velocity</div>
                      <div className="font-medium text-[#080707]">{startup.velocity}</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Star className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
                      <div className="text-sm text-muted-foreground">Score</div>
                      <div className="font-medium text-[#080707]">{startup.score}/100</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Company Details */}
              <Card className="bg-white shadow-sm">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="text-base font-semibold text-[#080707]">Company Details</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  {startup.location && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-xs text-muted-foreground">Location</div>
                        <div className="text-sm font-medium">{startup.location}</div>
                      </div>
                    </div>
                  )}
                  {startup.fundingAmount && (
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-xs text-muted-foreground">Funding</div>
                        <div className="text-sm font-medium">{startup.fundingAmount}</div>
                      </div>
                    </div>
                  )}
                  {startup.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-xs text-muted-foreground">Website</div>
                        <a 
                          href={startup.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-[#0176D3] hover:underline flex items-center gap-1"
                        >
                          {startup.website.replace(/^https?:\/\//, '')}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  )}
                  <Separator />
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">Added</div>
                      <div className="text-sm font-medium">
                        {new Date(startup.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Add Note / Slack Context */}
            <Card className="bg-white shadow-sm">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-base font-semibold text-[#080707]">Add Context</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {/* Slack Context */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-purple-600" />
                    Slackbot Context
                  </Label>
                  <Textarea
                    placeholder="Paste Slack conversation or context here..."
                    value={slackContext}
                    onChange={(e) => setSlackContext(e.target.value)}
                    className="min-h-[100px]"
                    data-testid="input-slack-context"
                  />
                  <Button
                    size="sm"
                    onClick={() => addNoteMutation.mutate({ content: slackContext, noteType: "slackbot" })}
                    disabled={!slackContext.trim() || addNoteMutation.isPending}
                    className="bg-purple-600 hover:bg-purple-700"
                    data-testid="button-add-slack"
                  >
                    Add Slack Context
                  </Button>
                </div>

                <Separator />

                {/* General Note */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#0176D3]" />
                    Add Note
                  </Label>
                  <Textarea
                    placeholder="Add notes about this startup..."
                    value={newNote.content}
                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                    className="min-h-[100px]"
                    data-testid="input-note"
                  />
                  <Button
                    size="sm"
                    onClick={() => addNoteMutation.mutate({ content: newNote.content, noteType: "general" })}
                    disabled={!newNote.content.trim() || addNoteMutation.isPending}
                    className="bg-[#0176D3] hover:bg-[#014486]"
                    data-testid="button-add-note"
                  >
                    Add Note
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Notes List */}
            <Card className="bg-white shadow-sm">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-base font-semibold text-[#080707]">Saved Context</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {notes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No notes or context saved yet</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {notes.map((note) => (
                      <div key={note.id} className="p-3 bg-gray-50 rounded-lg" data-testid={`note-${note.id}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className={cn(
                            "text-[10px]",
                            note.noteType === "slackbot" ? "border-purple-300 text-purple-700" :
                            note.noteType === "transcript" ? "border-orange-300 text-orange-700" :
                            "border-blue-300 text-blue-700"
                          )}>
                            {getNoteTypeLabel(note.noteType)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(note.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-4">{note.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Research Tab */}
        <TabsContent value="research">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Start Research */}
            <Card className="bg-white shadow-sm border-t-4 border-[#0176D3]">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-[#080707]">
                  <Sparkles className="h-5 w-5 text-[#0176D3]" />
                  Deep Research
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Start a deep research session to gather comprehensive intelligence about this startup.
                  Research will include competitor analysis, funding history, product positioning, and market trends.
                </p>
                <div className="space-y-2">
                  <Label>Research Context (optional)</Label>
                  <Textarea
                    placeholder="Add specific questions or context to focus the research..."
                    value={researchContext}
                    onChange={(e) => setResearchContext(e.target.value)}
                    className="min-h-[100px]"
                    data-testid="input-research-context"
                  />
                </div>
                <Button
                  onClick={() => startResearchMutation.mutate(researchContext)}
                  disabled={startResearchMutation.isPending}
                  className="w-full bg-[#0176D3] hover:bg-[#014486]"
                  data-testid="button-start-research"
                >
                  {startResearchMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Run Deep Research
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Research Sessions */}
            <Card className="bg-white shadow-sm">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="text-base font-semibold text-[#080707]">Research History</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {researchSessions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Sparkles className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No research sessions yet</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {researchSessions.map((session) => (
                      <div key={session.id} className="p-3 bg-gray-50 rounded-lg" data-testid={`research-${session.id}`}>
                        <div className="flex items-center justify-between mb-2">
                          <Badge className={cn(
                            "border-0",
                            session.status === "completed" ? "bg-green-100 text-green-700" :
                            session.status === "running" ? "bg-blue-100 text-blue-700" :
                            session.status === "failed" ? "bg-red-100 text-red-700" :
                            "bg-gray-100 text-gray-700"
                          )}>
                            {session.status === "running" && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                            {session.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(session.createdAt).toLocaleString()}
                          </span>
                        </div>
                        {session.context && (
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                            Context: {session.context}
                          </p>
                        )}
                        {session.results && (
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{session.results}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[525px] bg-white">
          <DialogHeader>
            <DialogTitle>Edit Startup</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={editData.name || ""}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Focus Area</Label>
                <Input
                  value={editData.focus || ""}
                  onChange={(e) => setEditData({ ...editData, focus: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Stage</Label>
                <Select 
                  value={editData.stage} 
                  onValueChange={(value) => setEditData({ ...editData, stage: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pre-Seed">Pre-Seed</SelectItem>
                    <SelectItem value="Seed">Seed</SelectItem>
                    <SelectItem value="Series A">Series A</SelectItem>
                    <SelectItem value="Series B">Series B</SelectItem>
                    <SelectItem value="Series C+">Series C+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Velocity</Label>
                <Select 
                  value={editData.velocity} 
                  onValueChange={(value) => setEditData({ ...editData, velocity: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Extreme">Extreme</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select 
                  value={editData.category} 
                  onValueChange={(value) => setEditData({ ...editData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="watchlist">Watch List</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="automated">Automated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Hot Score (0-100)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={editData.score || 0}
                  onChange={(e) => setEditData({ ...editData, score: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Funding Amount</Label>
                <Input
                  value={editData.fundingAmount || ""}
                  onChange={(e) => setEditData({ ...editData, fundingAmount: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={editData.location || ""}
                  onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input
                value={editData.website || ""}
                onChange={(e) => setEditData({ ...editData, website: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={editData.description || ""}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
              <Button 
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="bg-[#0176D3] hover:bg-[#014486]"
              >
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
