import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Upload, 
  Plus, 
  Trash2, 
  Edit2,
  Target,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";

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

export default function Priorities() {
  const [bulkText, setBulkText] = useState("");
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingPriority, setEditingPriority] = useState<Priority | null>(null);
  const [newPriority, setNewPriority] = useState({ title: "", status: "New", owner: "CEO Office", description: "" });
  
  const queryClient = useQueryClient();

  const { data: priorities = [], isLoading } = useQuery<Priority[]>({
    queryKey: ["priorities"],
    queryFn: async () => {
      const res = await fetch("/api/priorities");
      if (!res.ok) throw new Error("Failed to fetch priorities");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (priority: Omit<Priority, "id" | "createdAt" | "updatedAt" | "previousRank">) => {
      return apiRequest("POST", "/api/priorities", priority);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["priorities"] });
      setShowAddDialog(false);
      setNewPriority({ title: "", status: "New", owner: "CEO Office", description: "" });
    },
  });

  const bulkCreateMutation = useMutation({
    mutationFn: async (text: string) => {
      return apiRequest("POST", "/api/priorities/bulk", { text, owner: "CEO Office" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["priorities"] });
      setShowBulkDialog(false);
      setBulkText("");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<Priority>) => {
      return apiRequest("PATCH", `/api/priorities/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["priorities"] });
      setEditingPriority(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/priorities/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["priorities"] });
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

  const getTrendBadge = (trend: string) => {
    switch (trend) {
      case "up":
        return (
          <Badge className="bg-green-50 text-green-700 border-green-200 gap-1">
            <ArrowUpRight className="h-3 w-3" />
            Rising
          </Badge>
        );
      case "down":
        return (
          <Badge className="bg-red-50 text-red-700 border-red-200 gap-1">
            <ArrowDownRight className="h-3 w-3" />
            Falling
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-50 text-gray-600 border-gray-200 gap-1">
            <Minus className="h-3 w-3" />
            Steady
          </Badge>
        );
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

  const handleBulkUpload = () => {
    if (bulkText.trim()) {
      bulkCreateMutation.mutate(bulkText);
    }
  };

  const handleAddPriority = () => {
    const maxRank = priorities.length > 0 ? Math.max(...priorities.map(p => p.rank)) : 0;
    createMutation.mutate({
      ...newPriority,
      rank: maxRank + 1,
      trend: "even",
    });
  };

  const handleUpdatePriority = () => {
    if (editingPriority) {
      updateMutation.mutate({
        id: editingPriority.id,
        title: editingPriority.title,
        status: editingPriority.status,
        owner: editingPriority.owner,
        description: editingPriority.description,
      });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-border shadow-sm">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#080707]">Strategic Priorities</h1>
          <p className="text-sm text-muted-foreground">Track and manage organizational priorities</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-[#0176D3] text-[#0176D3] hover:bg-blue-50">
                <Upload className="h-4 w-4 mr-2" />
                Bulk Upload
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px] bg-white">
              <DialogHeader>
                <DialogTitle>Bulk Upload Priorities</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Paste priorities (one per line)</Label>
                  <Textarea
                    data-testid="input-bulk-priorities"
                    placeholder="Priority 1
Priority 2
Priority 3
..."
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                    className="min-h-[200px] font-mono text-sm"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowBulkDialog(false)}>Cancel</Button>
                  <Button 
                    data-testid="button-submit-bulk"
                    onClick={handleBulkUpload}
                    disabled={!bulkText.trim() || bulkCreateMutation.isPending}
                    className="bg-[#0176D3] hover:bg-[#014486]"
                  >
                    {bulkCreateMutation.isPending ? "Uploading..." : "Upload Priorities"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-[#0176D3] hover:bg-[#014486]">
                <Plus className="h-4 w-4 mr-2" />
                Add Priority
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white">
              <DialogHeader>
                <DialogTitle>Add New Priority</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    data-testid="input-priority-title"
                    placeholder="Enter priority title"
                    value={newPriority.title}
                    onChange={(e) => setNewPriority({ ...newPriority, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select 
                    value={newPriority.status} 
                    onValueChange={(value) => setNewPriority({ ...newPriority, status: value })}
                  >
                    <SelectTrigger data-testid="select-priority-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="New">New</SelectItem>
                      <SelectItem value="Planning">Planning</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Blocked">Blocked</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Owner</Label>
                  <Input
                    data-testid="input-priority-owner"
                    placeholder="Enter owner"
                    value={newPriority.owner}
                    onChange={(e) => setNewPriority({ ...newPriority, owner: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    data-testid="input-priority-description"
                    placeholder="Enter description (optional)"
                    value={newPriority.description}
                    onChange={(e) => setNewPriority({ ...newPriority, description: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
                  <Button 
                    data-testid="button-submit-priority"
                    onClick={handleAddPriority}
                    disabled={!newPriority.title.trim() || createMutation.isPending}
                    className="bg-[#0176D3] hover:bg-[#014486]"
                  >
                    {createMutation.isPending ? "Adding..." : "Add Priority"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Priority List */}
      <Card className="shadow-sm bg-white">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-base font-semibold text-[#080707]">Priority Rankings</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading priorities...</div>
          ) : priorities.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No priorities yet. Add your first priority or use bulk upload.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {priorities.map((priority, index) => (
                <div 
                  key={priority.id} 
                  data-testid={`priority-item-${priority.id}`}
                  className="p-4 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-start gap-4">
                    {/* Rank */}
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#0176D3] text-white flex items-center justify-center font-bold text-sm">
                        {priority.rank}
                      </div>
                      {getTrendIcon(priority.trend)}
                    </div>

                    {/* Content */}
                    <Link href={`/priorities/${priority.id}`} className="flex-1 min-w-0 cursor-pointer">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-[#080707] truncate hover:text-[#0176D3] transition-colors">{priority.title}</h3>
                        {getTrendBadge(priority.trend)}
                      </div>
                      {priority.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1">{priority.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        <Badge variant="secondary" className={cn("text-xs", getStatusColor(priority.status))}>
                          {priority.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">Owner: {priority.owner}</span>
                      </div>
                    </Link>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-[#0176D3]"
                        onClick={() => setEditingPriority(priority)}
                        data-testid={`button-edit-priority-${priority.id}`}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-red-600"
                        onClick={() => deleteMutation.mutate(priority.id)}
                        data-testid={`button-delete-priority-${priority.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingPriority} onOpenChange={(open) => !open && setEditingPriority(null)}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle>Edit Priority</DialogTitle>
          </DialogHeader>
          {editingPriority && (
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={editingPriority.title}
                  onChange={(e) => setEditingPriority({ ...editingPriority, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select 
                  value={editingPriority.status} 
                  onValueChange={(value) => setEditingPriority({ ...editingPriority, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Planning">Planning</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Blocked">Blocked</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Trend</Label>
                <Select 
                  value={editingPriority.trend} 
                  onValueChange={(value) => setEditingPriority({ ...editingPriority, trend: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="up">Rising</SelectItem>
                    <SelectItem value="even">Steady</SelectItem>
                    <SelectItem value="down">Falling</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Owner</Label>
                <Input
                  value={editingPriority.owner}
                  onChange={(e) => setEditingPriority({ ...editingPriority, owner: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editingPriority.description || ""}
                  onChange={(e) => setEditingPriority({ ...editingPriority, description: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingPriority(null)}>Cancel</Button>
                <Button 
                  onClick={handleUpdatePriority}
                  disabled={updateMutation.isPending}
                  className="bg-[#0176D3] hover:bg-[#014486]"
                >
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
