import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Target, 
  MessageSquare, 
  Users, 
  FileText, 
  Sparkles,
  Plus,
  Trash2,
  Send,
  Bot,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";

interface Priority {
  id: number;
  title: string;
  status: string;
  owner: string;
  rank: number;
  previousRank: number | null;
  trend: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Comment {
  id: number;
  entityType: string;
  entityId: number;
  content: string;
  author: string;
  createdAt: string;
}

interface Stakeholder {
  id: number;
  priorityId: number;
  name: string;
  role: string | null;
  email: string | null;
  createdAt: string;
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

interface PriorityDetailProps {
  id: string;
}

export default function PriorityDetail({ id }: PriorityDetailProps) {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  // Form states
  const [newComment, setNewComment] = useState("");
  const [newStakeholder, setNewStakeholder] = useState({ name: "", role: "", email: "" });
  const [showStakeholderDialog, setShowStakeholderDialog] = useState(false);
  const [newNote, setNewNote] = useState({ content: "", noteType: "general" });
  const [slackContext, setSlackContext] = useState("");
  const [researchContext, setResearchContext] = useState("");

  // Fetch priority
  const { data: priority, isLoading } = useQuery<Priority>({
    queryKey: ["priority", id],
    queryFn: async () => {
      const res = await fetch(`/api/priorities/${id}`);
      if (!res.ok) throw new Error("Failed to fetch priority");
      return res.json();
    },
  });

  // Fetch related data
  const { data: comments = [] } = useQuery<Comment[]>({
    queryKey: ["comments", "priority", id],
    queryFn: async () => {
      const res = await fetch(`/api/comments/priority/${id}`);
      if (!res.ok) throw new Error("Failed to fetch comments");
      return res.json();
    },
  });

  const { data: stakeholders = [] } = useQuery<Stakeholder[]>({
    queryKey: ["stakeholders", id],
    queryFn: async () => {
      const res = await fetch(`/api/priorities/${id}/stakeholders`);
      if (!res.ok) throw new Error("Failed to fetch stakeholders");
      return res.json();
    },
  });

  const { data: notes = [] } = useQuery<Note[]>({
    queryKey: ["notes", "priority", id],
    queryFn: async () => {
      const res = await fetch(`/api/notes/priority/${id}`);
      if (!res.ok) throw new Error("Failed to fetch notes");
      return res.json();
    },
  });

  const { data: researchSessions = [] } = useQuery<ResearchSession[]>({
    queryKey: ["research", "priority", id],
    queryFn: async () => {
      const res = await fetch(`/api/research/priority/${id}`);
      if (!res.ok) throw new Error("Failed to fetch research");
      return res.json();
    },
  });

  // Mutations
  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest("POST", "/api/comments", {
        entityType: "priority",
        entityId: parseInt(id),
        content,
        author: "Marc B.",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", "priority", id] });
      setNewComment("");
    },
  });

  const addStakeholderMutation = useMutation({
    mutationFn: async (data: typeof newStakeholder) => {
      return apiRequest("POST", "/api/stakeholders", {
        priorityId: parseInt(id),
        ...data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stakeholders", id] });
      setNewStakeholder({ name: "", role: "", email: "" });
      setShowStakeholderDialog(false);
    },
  });

  const deleteStakeholderMutation = useMutation({
    mutationFn: async (stakeholderId: number) => {
      return apiRequest("DELETE", `/api/stakeholders/${stakeholderId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stakeholders", id] });
    },
  });

  const addNoteMutation = useMutation({
    mutationFn: async (data: { content: string; noteType: string }) => {
      return apiRequest("POST", "/api/notes", {
        entityType: "priority",
        entityId: parseInt(id),
        ...data,
        author: "Marc B.",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", "priority", id] });
      setNewNote({ content: "", noteType: "general" });
      setSlackContext("");
    },
  });

  const startResearchMutation = useMutation({
    mutationFn: async (context: string) => {
      return apiRequest("POST", "/api/research", {
        entityType: "priority",
        entityId: parseInt(id),
        context,
        status: "running",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["research", "priority", id] });
      setResearchContext("");
    },
  });

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Progress":
        return "bg-blue-100 text-blue-700";
      case "Planning":
        return "bg-purple-100 text-purple-700";
      case "Blocked":
        return "bg-red-100 text-red-700";
      case "New":
        return "bg-green-100 text-green-700";
      case "Completed":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
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
        <div className="text-muted-foreground">Loading priority details...</div>
      </div>
    );
  }

  if (!priority) {
    return (
      <div className="space-y-6">
        <Link href="/priorities">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Priorities
          </Button>
        </Link>
        <Card className="bg-white">
          <CardContent className="p-8 text-center">
            <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-muted-foreground">Priority not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Back Navigation */}
      <Link href="/priorities">
        <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-[#0176D3]" data-testid="button-back-to-priorities">
          <ArrowLeft className="h-4 w-4" />
          Back to Priorities
        </Button>
      </Link>

      {/* Header Card */}
      <Card className="bg-white border-t-4 border-[#0176D3] shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-[#0176D3] text-white flex items-center justify-center text-xl font-bold">
                {priority.rank}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {getTrendIcon(priority.trend)}
                  <Badge className={cn("border-0", getStatusColor(priority.status))}>
                    {priority.status}
                  </Badge>
                </div>
                <h1 className="text-xl font-bold text-[#080707]" data-testid="text-priority-title">{priority.title}</h1>
                {priority.description && (
                  <p className="text-sm text-muted-foreground mt-1">{priority.description}</p>
                )}
                <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                  <span>Owner: <span className="font-medium text-[#080707]">{priority.owner}</span></span>
                  <span>Updated: {new Date(priority.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Section */}
      <Tabs defaultValue="comments" className="space-y-4">
        <TabsList className="bg-white border border-gray-200 p-1">
          <TabsTrigger value="comments" className="data-[state=active]:bg-[#0176D3] data-[state=active]:text-white gap-2">
            <MessageSquare className="h-4 w-4" />
            Comments ({comments.length})
          </TabsTrigger>
          <TabsTrigger value="stakeholders" className="data-[state=active]:bg-[#0176D3] data-[state=active]:text-white gap-2">
            <Users className="h-4 w-4" />
            Stakeholders ({stakeholders.length})
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

        {/* Comments Tab */}
        <TabsContent value="comments">
          <Card className="bg-white shadow-sm">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-base font-semibold text-[#080707]">Discussion</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                {/* Add Comment */}
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[80px]"
                    data-testid="input-comment"
                  />
                  <Button
                    onClick={() => addCommentMutation.mutate(newComment)}
                    disabled={!newComment.trim() || addCommentMutation.isPending}
                    className="bg-[#0176D3] hover:bg-[#014486] self-end"
                    data-testid="button-add-comment"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                
                <Separator />
                
                {/* Comments List */}
                {comments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No comments yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3" data-testid={`comment-${comment.id}`}>
                        <div className="h-8 w-8 rounded-full bg-[#0176D3] text-white flex items-center justify-center text-xs font-bold shrink-0">
                          {comment.author.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{comment.author}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(comment.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stakeholders Tab */}
        <TabsContent value="stakeholders">
          <Card className="bg-white shadow-sm">
            <CardHeader className="border-b border-gray-100 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold text-[#080707]">Stakeholders</CardTitle>
              <Dialog open={showStakeholderDialog} onOpenChange={setShowStakeholderDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-[#0176D3] hover:bg-[#014486]">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Stakeholder
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white">
                  <DialogHeader>
                    <DialogTitle>Add Stakeholder</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Name *</Label>
                      <Input
                        value={newStakeholder.name}
                        onChange={(e) => setNewStakeholder({ ...newStakeholder, name: e.target.value })}
                        placeholder="John Doe"
                        data-testid="input-stakeholder-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <Input
                        value={newStakeholder.role}
                        onChange={(e) => setNewStakeholder({ ...newStakeholder, role: e.target.value })}
                        placeholder="Product Manager"
                        data-testid="input-stakeholder-role"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        value={newStakeholder.email}
                        onChange={(e) => setNewStakeholder({ ...newStakeholder, email: e.target.value })}
                        placeholder="john@company.com"
                        data-testid="input-stakeholder-email"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowStakeholderDialog(false)}>Cancel</Button>
                      <Button
                        onClick={() => addStakeholderMutation.mutate(newStakeholder)}
                        disabled={!newStakeholder.name.trim() || addStakeholderMutation.isPending}
                        className="bg-[#0176D3] hover:bg-[#014486]"
                        data-testid="button-submit-stakeholder"
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="pt-4">
              {stakeholders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No stakeholders added yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stakeholders.map((s) => (
                    <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg" data-testid={`stakeholder-${s.id}`}>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
                          {s.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{s.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {s.role && <span>{s.role}</span>}
                            {s.role && s.email && <span> • </span>}
                            {s.email && <span>{s.email}</span>}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-red-600"
                        onClick={() => deleteStakeholderMutation.mutate(s.id)}
                        data-testid={`button-delete-stakeholder-${s.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
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
                    Add Note / Transcript
                  </Label>
                  <Textarea
                    placeholder="Add notes or paste transcript..."
                    value={newNote.content}
                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                    className="min-h-[100px]"
                    data-testid="input-note"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addNoteMutation.mutate({ content: newNote.content, noteType: "transcript" })}
                      disabled={!newNote.content.trim() || addNoteMutation.isPending}
                      data-testid="button-add-transcript"
                    >
                      Add as Transcript
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => addNoteMutation.mutate({ content: newNote.content, noteType: "general" })}
                      disabled={!newNote.content.trim() || addNoteMutation.isPending}
                      className="bg-[#0176D3] hover:bg-[#014486]"
                      data-testid="button-add-note"
                    >
                      Add as Note
                    </Button>
                  </div>
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
                  Start a deep research session to gather comprehensive intelligence about this priority.
                  Include any context from notes or Slack to focus the research.
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
    </div>
  );
}
