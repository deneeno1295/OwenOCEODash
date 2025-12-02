import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  Settings as SettingsIcon, 
  Clock, 
  MessageSquare, 
  Building2, 
  Layers,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Cloud,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ExternalLink,
  User,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface AgentCadence {
  id: number;
  name: string;
  description: string | null;
  schedule: string;
  cronExpression: string | null;
  isActive: number;
  createdAt: string;
  updatedAt: string;
}

interface AgentPrompt {
  id: number;
  name: string;
  description: string | null;
  promptType: string;
  content: string;
  isActive: number;
  createdAt: string;
  updatedAt: string;
}

interface TrackedCompany {
  id: number;
  name: string;
  ticker: string | null;
  industry: string | null;
  companyType: string | null;
  priority: number;
  notes: string | null;
  isActive: number;
  createdAt: string;
  updatedAt: string;
}

interface AgentSpace {
  id: number;
  name: string;
  description: string | null;
  keywords: string | null;
  sources: string | null;
  priority: number;
  isActive: number;
  createdAt: string;
  updatedAt: string;
}

interface SalesforceStatus {
  configured: boolean;
  connected: boolean;
  instanceUrl: string | null;
  organizationId: string | null;
  loginUrl: string;
  authenticatedAt: string | null;
  currentUser: {
    name: string;
    email: string;
    profileName: string | null;
    isAdmin: boolean;
  } | null;
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState("salesforce");
  const queryClient = useQueryClient();

  const { data: salesforceStatus, isLoading: salesforceLoading } = useQuery<SalesforceStatus>({
    queryKey: ["settings", "salesforce-status"],
    queryFn: async () => {
      const res = await fetch("/api/settings/salesforce-status");
      if (!res.ok) throw new Error("Failed to fetch Salesforce status");
      return res.json();
    },
  });

  const { data: cadences = [], isLoading: cadencesLoading } = useQuery<AgentCadence[]>({
    queryKey: ["settings", "cadences"],
    queryFn: async () => {
      const res = await fetch("/api/settings/cadences");
      if (!res.ok) throw new Error("Failed to fetch cadences");
      return res.json();
    },
  });

  const { data: prompts = [], isLoading: promptsLoading } = useQuery<AgentPrompt[]>({
    queryKey: ["settings", "prompts"],
    queryFn: async () => {
      const res = await fetch("/api/settings/prompts");
      if (!res.ok) throw new Error("Failed to fetch prompts");
      return res.json();
    },
  });

  const { data: companies = [], isLoading: companiesLoading } = useQuery<TrackedCompany[]>({
    queryKey: ["settings", "companies"],
    queryFn: async () => {
      const res = await fetch("/api/settings/companies");
      if (!res.ok) throw new Error("Failed to fetch companies");
      return res.json();
    },
  });

  const { data: spaces = [], isLoading: spacesLoading } = useQuery<AgentSpace[]>({
    queryKey: ["settings", "spaces"],
    queryFn: async () => {
      const res = await fetch("/api/settings/spaces");
      if (!res.ok) throw new Error("Failed to fetch spaces");
      return res.json();
    },
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-border shadow-sm">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#080707]">Agent Settings</h1>
          <p className="text-sm text-muted-foreground">Configure agent inputs, schedules, and focus areas</p>
        </div>
        <SettingsIcon className="h-8 w-8 text-[#0176D3]" />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-white border border-gray-200 p-1">
          <TabsTrigger 
            value="salesforce" 
            className="data-[state=active]:bg-[#0176D3] data-[state=active]:text-white"
            data-testid="tab-salesforce"
          >
            <Cloud className="h-4 w-4 mr-2" />
            Salesforce
          </TabsTrigger>
          <TabsTrigger 
            value="cadences" 
            className="data-[state=active]:bg-[#0176D3] data-[state=active]:text-white"
            data-testid="tab-cadences"
          >
            <Clock className="h-4 w-4 mr-2" />
            Cadences
          </TabsTrigger>
          <TabsTrigger 
            value="prompts" 
            className="data-[state=active]:bg-[#0176D3] data-[state=active]:text-white"
            data-testid="tab-prompts"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Prompts
          </TabsTrigger>
          <TabsTrigger 
            value="companies" 
            className="data-[state=active]:bg-[#0176D3] data-[state=active]:text-white"
            data-testid="tab-companies"
          >
            <Building2 className="h-4 w-4 mr-2" />
            Companies
          </TabsTrigger>
          <TabsTrigger 
            value="spaces" 
            className="data-[state=active]:bg-[#0176D3] data-[state=active]:text-white"
            data-testid="tab-spaces"
          >
            <Layers className="h-4 w-4 mr-2" />
            Spaces
          </TabsTrigger>
        </TabsList>

        <TabsContent value="salesforce">
          <SalesforceTab status={salesforceStatus} isLoading={salesforceLoading} />
        </TabsContent>

        <TabsContent value="cadences">
          <CadencesTab cadences={cadences} isLoading={cadencesLoading} />
        </TabsContent>

        <TabsContent value="prompts">
          <PromptsTab prompts={prompts} isLoading={promptsLoading} />
        </TabsContent>

        <TabsContent value="companies">
          <CompaniesTab companies={companies} isLoading={companiesLoading} />
        </TabsContent>

        <TabsContent value="spaces">
          <SpacesTab spaces={spaces} isLoading={spacesLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CadencesTab({ cadences, isLoading }: { cadences: AgentCadence[]; isLoading: boolean }) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<AgentCadence | null>(null);
  const [newItem, setNewItem] = useState({ name: "", description: "", schedule: "daily", cronExpression: "" });
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/settings/cadences", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "cadences"] });
      setShowAddDialog(false);
      setNewItem({ name: "", description: "", schedule: "daily", cronExpression: "" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => apiRequest("PATCH", `/api/settings/cadences/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "cadences"] });
      setEditingItem(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => apiRequest("DELETE", `/api/settings/cadences/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["settings", "cadences"] }),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: number }) => 
      apiRequest("PATCH", `/api/settings/cadences/${id}`, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["settings", "cadences"] }),
  });

  return (
    <Card className="shadow-sm bg-white">
      <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100">
        <div>
          <CardTitle className="text-base font-semibold text-[#080707]">Agent Cadences</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Configure how often agents run their tasks</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-[#0176D3] hover:bg-[#014486]" data-testid="button-add-cadence">
              <Plus className="h-4 w-4 mr-2" />
              Add Cadence
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>Add New Cadence</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  data-testid="input-cadence-name"
                  placeholder="e.g., Daily News Scan"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  data-testid="input-cadence-description"
                  placeholder="What does this cadence do?"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Schedule</Label>
                <Select value={newItem.schedule} onValueChange={(v) => setNewItem({ ...newItem, schedule: v })}>
                  <SelectTrigger data-testid="select-cadence-schedule">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="custom">Custom (Cron)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {newItem.schedule === "custom" && (
                <div className="space-y-2">
                  <Label>Cron Expression</Label>
                  <Input
                    data-testid="input-cadence-cron"
                    placeholder="0 9 * * *"
                    value={newItem.cronExpression}
                    onChange={(e) => setNewItem({ ...newItem, cronExpression: e.target.value })}
                  />
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
                <Button 
                  data-testid="button-submit-cadence"
                  onClick={() => createMutation.mutate(newItem)}
                  disabled={!newItem.name.trim() || createMutation.isPending}
                  className="bg-[#0176D3] hover:bg-[#014486]"
                >
                  {createMutation.isPending ? "Adding..." : "Add Cadence"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading cadences...</div>
        ) : cadences.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No cadences configured yet. Add your first cadence to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {cadences.map((cadence) => (
              <div key={cadence.id} className="p-4 hover:bg-gray-50 transition-colors group" data-testid={`cadence-item-${cadence.id}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-[#080707]">{cadence.name}</h3>
                      <Badge variant="outline" className={cn(
                        "text-xs",
                        cadence.isActive ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-500 border-gray-200"
                      )}>
                        {cadence.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    {cadence.description && (
                      <p className="text-sm text-muted-foreground mt-1">{cadence.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <Badge variant="secondary" className="text-xs capitalize">{cadence.schedule}</Badge>
                      {cadence.cronExpression && (
                        <span className="text-xs text-muted-foreground font-mono">{cadence.cronExpression}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={cadence.isActive === 1}
                      onCheckedChange={(checked) => toggleMutation.mutate({ id: cadence.id, isActive: checked ? 1 : 0 })}
                      data-testid={`switch-cadence-${cadence.id}`}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-[#0176D3]"
                      onClick={() => setEditingItem(cadence)}
                      data-testid={`button-edit-cadence-${cadence.id}`}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-red-600"
                      onClick={() => deleteMutation.mutate(cadence.id)}
                      data-testid={`button-delete-cadence-${cadence.id}`}
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
  );
}

function PromptsTab({ prompts, isLoading }: { prompts: AgentPrompt[]; isLoading: boolean }) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<AgentPrompt | null>(null);
  const [newItem, setNewItem] = useState({ name: "", description: "", promptType: "research", content: "" });
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/settings/prompts", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "prompts"] });
      setShowAddDialog(false);
      setNewItem({ name: "", description: "", promptType: "research", content: "" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => apiRequest("PATCH", `/api/settings/prompts/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "prompts"] });
      setEditingItem(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => apiRequest("DELETE", `/api/settings/prompts/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["settings", "prompts"] }),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: number }) => 
      apiRequest("PATCH", `/api/settings/prompts/${id}`, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["settings", "prompts"] }),
  });

  const promptTypeColors: Record<string, string> = {
    research: "bg-blue-50 text-blue-700 border-blue-200",
    analysis: "bg-purple-50 text-purple-700 border-purple-200",
    summary: "bg-green-50 text-green-700 border-green-200",
    discovery: "bg-amber-50 text-amber-700 border-amber-200",
  };

  return (
    <Card className="shadow-sm bg-white">
      <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100">
        <div>
          <CardTitle className="text-base font-semibold text-[#080707]">Agent Prompts</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Define prompt templates for different agent tasks</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-[#0176D3] hover:bg-[#014486]" data-testid="button-add-prompt">
              <Plus className="h-4 w-4 mr-2" />
              Add Prompt
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Prompt</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    data-testid="input-prompt-name"
                    placeholder="e.g., Competitor Analysis"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={newItem.promptType} onValueChange={(v) => setNewItem({ ...newItem, promptType: v })}>
                    <SelectTrigger data-testid="select-prompt-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="research">Research</SelectItem>
                      <SelectItem value="analysis">Analysis</SelectItem>
                      <SelectItem value="summary">Summary</SelectItem>
                      <SelectItem value="discovery">Discovery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  data-testid="input-prompt-description"
                  placeholder="Brief description of what this prompt does"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Prompt Content</Label>
                <Textarea
                  data-testid="input-prompt-content"
                  placeholder="Enter your prompt template here. Use {{variable}} for dynamic values."
                  className="min-h-[200px] font-mono text-sm"
                  value={newItem.content}
                  onChange={(e) => setNewItem({ ...newItem, content: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
                <Button 
                  data-testid="button-submit-prompt"
                  onClick={() => createMutation.mutate(newItem)}
                  disabled={!newItem.name.trim() || !newItem.content.trim() || createMutation.isPending}
                  className="bg-[#0176D3] hover:bg-[#014486]"
                >
                  {createMutation.isPending ? "Adding..." : "Add Prompt"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading prompts...</div>
        ) : prompts.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No prompts configured yet. Add your first prompt template.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {prompts.map((prompt) => (
              <div key={prompt.id} className="p-4 hover:bg-gray-50 transition-colors group" data-testid={`prompt-item-${prompt.id}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-[#080707]">{prompt.name}</h3>
                      <Badge variant="outline" className={cn("text-xs capitalize", promptTypeColors[prompt.promptType] || "")}>
                        {prompt.promptType}
                      </Badge>
                      <Badge variant="outline" className={cn(
                        "text-xs",
                        prompt.isActive ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-500 border-gray-200"
                      )}>
                        {prompt.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    {prompt.description && (
                      <p className="text-sm text-muted-foreground mt-1">{prompt.description}</p>
                    )}
                    <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-100">
                      <p className="text-xs font-mono text-gray-600 line-clamp-2">{prompt.content}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Switch
                      checked={prompt.isActive === 1}
                      onCheckedChange={(checked) => toggleMutation.mutate({ id: prompt.id, isActive: checked ? 1 : 0 })}
                      data-testid={`switch-prompt-${prompt.id}`}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-[#0176D3]"
                      onClick={() => setEditingItem(prompt)}
                      data-testid={`button-edit-prompt-${prompt.id}`}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-red-600"
                      onClick={() => deleteMutation.mutate(prompt.id)}
                      data-testid={`button-delete-prompt-${prompt.id}`}
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
  );
}

function CompaniesTab({ companies, isLoading }: { companies: TrackedCompany[]; isLoading: boolean }) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<TrackedCompany | null>(null);
  const [newItem, setNewItem] = useState({ name: "", ticker: "", industry: "", companyType: "competitor", priority: 50, notes: "" });
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/settings/companies", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "companies"] });
      setShowAddDialog(false);
      setNewItem({ name: "", ticker: "", industry: "", companyType: "competitor", priority: 50, notes: "" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => apiRequest("PATCH", `/api/settings/companies/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "companies"] });
      setEditingItem(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => apiRequest("DELETE", `/api/settings/companies/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["settings", "companies"] }),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: number }) => 
      apiRequest("PATCH", `/api/settings/companies/${id}`, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["settings", "companies"] }),
  });

  const companyTypeColors: Record<string, string> = {
    competitor: "bg-red-50 text-red-700 border-red-200",
    partner: "bg-blue-50 text-blue-700 border-blue-200",
    customer: "bg-green-50 text-green-700 border-green-200",
    prospect: "bg-amber-50 text-amber-700 border-amber-200",
  };

  return (
    <Card className="shadow-sm bg-white">
      <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100">
        <div>
          <CardTitle className="text-base font-semibold text-[#080707]">Tracked Companies</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Companies the agents should monitor and analyze</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-[#0176D3] hover:bg-[#014486]" data-testid="button-add-company">
              <Plus className="h-4 w-4 mr-2" />
              Add Company
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>Add Tracked Company</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input
                    data-testid="input-company-name"
                    placeholder="e.g., Microsoft"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ticker Symbol</Label>
                  <Input
                    data-testid="input-company-ticker"
                    placeholder="e.g., MSFT"
                    value={newItem.ticker}
                    onChange={(e) => setNewItem({ ...newItem, ticker: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Industry</Label>
                  <Input
                    data-testid="input-company-industry"
                    placeholder="e.g., Enterprise Software"
                    value={newItem.industry}
                    onChange={(e) => setNewItem({ ...newItem, industry: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={newItem.companyType} onValueChange={(v) => setNewItem({ ...newItem, companyType: v })}>
                    <SelectTrigger data-testid="select-company-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="competitor">Competitor</SelectItem>
                      <SelectItem value="partner">Partner</SelectItem>
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="prospect">Prospect</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Priority (0-100)</Label>
                <Input
                  data-testid="input-company-priority"
                  type="number"
                  min="0"
                  max="100"
                  value={newItem.priority}
                  onChange={(e) => setNewItem({ ...newItem, priority: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  data-testid="input-company-notes"
                  placeholder="Additional notes about this company..."
                  value={newItem.notes}
                  onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
                <Button 
                  data-testid="button-submit-company"
                  onClick={() => createMutation.mutate(newItem)}
                  disabled={!newItem.name.trim() || createMutation.isPending}
                  className="bg-[#0176D3] hover:bg-[#014486]"
                >
                  {createMutation.isPending ? "Adding..." : "Add Company"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading companies...</div>
        ) : companies.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No companies tracked yet. Add companies for agents to monitor.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {companies.map((company) => (
              <div key={company.id} className="p-4 hover:bg-gray-50 transition-colors group" data-testid={`company-item-${company.id}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-[#080707]">{company.name}</h3>
                      {company.ticker && (
                        <span className="text-xs font-mono text-muted-foreground">({company.ticker})</span>
                      )}
                      {company.companyType && (
                        <Badge variant="outline" className={cn("text-xs capitalize", companyTypeColors[company.companyType] || "")}>
                          {company.companyType}
                        </Badge>
                      )}
                      <Badge variant="outline" className={cn(
                        "text-xs",
                        company.isActive ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-500 border-gray-200"
                      )}>
                        {company.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      {company.industry && (
                        <span className="text-xs text-muted-foreground">{company.industry}</span>
                      )}
                      <span className="text-xs text-muted-foreground">Priority: {company.priority}</span>
                    </div>
                    {company.notes && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{company.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={company.isActive === 1}
                      onCheckedChange={(checked) => toggleMutation.mutate({ id: company.id, isActive: checked ? 1 : 0 })}
                      data-testid={`switch-company-${company.id}`}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-[#0176D3]"
                      onClick={() => setEditingItem(company)}
                      data-testid={`button-edit-company-${company.id}`}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-red-600"
                      onClick={() => deleteMutation.mutate(company.id)}
                      data-testid={`button-delete-company-${company.id}`}
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
  );
}

function SpacesTab({ spaces, isLoading }: { spaces: AgentSpace[]; isLoading: boolean }) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<AgentSpace | null>(null);
  const [newItem, setNewItem] = useState({ name: "", description: "", keywords: "", sources: "", priority: 50 });
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/settings/spaces", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "spaces"] });
      setShowAddDialog(false);
      setNewItem({ name: "", description: "", keywords: "", sources: "", priority: 50 });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => apiRequest("PATCH", `/api/settings/spaces/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "spaces"] });
      setEditingItem(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => apiRequest("DELETE", `/api/settings/spaces/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["settings", "spaces"] }),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: number }) => 
      apiRequest("PATCH", `/api/settings/spaces/${id}`, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["settings", "spaces"] }),
  });

  return (
    <Card className="shadow-sm bg-white">
      <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100">
        <div>
          <CardTitle className="text-base font-semibold text-[#080707]">Focus Spaces</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Define topic areas and keywords for agent research</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-[#0176D3] hover:bg-[#014486]" data-testid="button-add-space">
              <Plus className="h-4 w-4 mr-2" />
              Add Space
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>Add Focus Space</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  data-testid="input-space-name"
                  placeholder="e.g., AI & Machine Learning"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  data-testid="input-space-description"
                  placeholder="What does this space focus on?"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Keywords (comma-separated)</Label>
                <Input
                  data-testid="input-space-keywords"
                  placeholder="AI, machine learning, LLM, generative AI"
                  value={newItem.keywords}
                  onChange={(e) => setNewItem({ ...newItem, keywords: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Sources (comma-separated URLs or names)</Label>
                <Textarea
                  data-testid="input-space-sources"
                  placeholder="techcrunch.com, venturebeat.com, hacker news"
                  value={newItem.sources}
                  onChange={(e) => setNewItem({ ...newItem, sources: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Priority (0-100)</Label>
                <Input
                  data-testid="input-space-priority"
                  type="number"
                  min="0"
                  max="100"
                  value={newItem.priority}
                  onChange={(e) => setNewItem({ ...newItem, priority: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
                <Button 
                  data-testid="button-submit-space"
                  onClick={() => createMutation.mutate(newItem)}
                  disabled={!newItem.name.trim() || createMutation.isPending}
                  className="bg-[#0176D3] hover:bg-[#014486]"
                >
                  {createMutation.isPending ? "Adding..." : "Add Space"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading spaces...</div>
        ) : spaces.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Layers className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No focus spaces defined yet. Add spaces to guide agent research.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {spaces.map((space) => (
              <div key={space.id} className="p-4 hover:bg-gray-50 transition-colors group" data-testid={`space-item-${space.id}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-[#080707]">{space.name}</h3>
                      <Badge variant="outline" className={cn(
                        "text-xs",
                        space.isActive ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-500 border-gray-200"
                      )}>
                        {space.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">Priority: {space.priority}</span>
                    </div>
                    {space.description && (
                      <p className="text-sm text-muted-foreground mt-1">{space.description}</p>
                    )}
                    {space.keywords && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {space.keywords.split(",").map((keyword, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">{keyword.trim()}</Badge>
                        ))}
                      </div>
                    )}
                    {space.sources && (
                      <p className="text-xs text-muted-foreground mt-2">Sources: {space.sources}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Switch
                      checked={space.isActive === 1}
                      onCheckedChange={(checked) => toggleMutation.mutate({ id: space.id, isActive: checked ? 1 : 0 })}
                      data-testid={`switch-space-${space.id}`}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-[#0176D3]"
                      onClick={() => setEditingItem(space)}
                      data-testid={`button-edit-space-${space.id}`}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-red-600"
                      onClick={() => deleteMutation.mutate(space.id)}
                      data-testid={`button-delete-space-${space.id}`}
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
  );
}

function SalesforceTab({ status, isLoading }: { status: SalesforceStatus | undefined; isLoading: boolean }) {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/settings/salesforce-test", { method: "POST" });
      const data = await res.json();
      setTestResult({
        success: data.success,
        message: data.success ? "Connection successful!" : data.error || "Connection failed",
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: "Failed to test connection",
      });
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-sm bg-white">
        <CardContent className="p-8 text-center text-muted-foreground">
          <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin text-[#0176D3]" />
          <p>Loading Salesforce configuration...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status Card */}
      <Card className="shadow-sm bg-white">
        <CardHeader className="border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-[#080707]">Salesforce Connection</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Current authentication and organization status</p>
            </div>
            <div className="flex items-center gap-2">
              {status?.configured ? (
                <Badge className="bg-green-50 text-green-700 border-green-200">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Configured
                </Badge>
              ) : (
                <Badge className="bg-amber-50 text-amber-700 border-amber-200">
                  <XCircle className="h-3 w-3 mr-1" />
                  Not Configured
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {!status?.configured ? (
            <div className="text-center py-8">
              <Cloud className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-[#080707] mb-2">Salesforce Not Configured</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
                To enable Salesforce authentication, set the following environment variables:
              </p>
              <div className="bg-gray-50 rounded-lg p-4 text-left max-w-md mx-auto">
                <code className="text-xs text-gray-600 block mb-1">SALESFORCE_CLIENT_ID</code>
                <code className="text-xs text-gray-600 block mb-1">SALESFORCE_CLIENT_SECRET</code>
                <code className="text-xs text-gray-600 block mb-1">SALESFORCE_REDIRECT_URI (optional)</code>
                <code className="text-xs text-gray-600 block">SALESFORCE_LOGIN_URL (optional)</code>
              </div>
              <a
                href="https://help.salesforce.com/s/articleView?id=sf.remoteaccess_oauth_web_server_flow.htm"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-[#0176D3] hover:underline mt-4"
              >
                <ExternalLink className="h-4 w-4" />
                Salesforce OAuth Documentation
              </a>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Connection Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">Connection Status</Label>
                    <div className="flex items-center gap-2 mt-1">
                      {status.connected ? (
                        <>
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          <span className="font-medium text-green-700">Connected</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5 text-gray-400" />
                          <span className="font-medium text-gray-500">Not Connected</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">Login URL</Label>
                    <p className="text-sm font-mono text-[#080707] mt-1">{status.loginUrl}</p>
                  </div>

                  {status.instanceUrl && (
                    <div>
                      <Label className="text-xs text-muted-foreground uppercase tracking-wide">Instance URL</Label>
                      <p className="text-sm font-mono text-[#080707] mt-1">{status.instanceUrl}</p>
                    </div>
                  )}

                  {status.organizationId && (
                    <div>
                      <Label className="text-xs text-muted-foreground uppercase tracking-wide">Organization ID</Label>
                      <p className="text-sm font-mono text-[#080707] mt-1">{status.organizationId}</p>
                    </div>
                  )}

                  {status.authenticatedAt && (
                    <div>
                      <Label className="text-xs text-muted-foreground uppercase tracking-wide">Authenticated At</Label>
                      <p className="text-sm text-[#080707] mt-1">
                        {new Date(status.authenticatedAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>

                {/* Current User */}
                {status.currentUser && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-full bg-[#0176D3] flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-[#080707]">{status.currentUser.name}</p>
                        <p className="text-sm text-muted-foreground">{status.currentUser.email}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Profile:</span>
                        <span className="text-sm font-medium">{status.currentUser.profileName || "Unknown"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {status.currentUser.isAdmin ? (
                          <Badge className="bg-purple-50 text-purple-700 border-purple-200">
                            <Shield className="h-3 w-3 mr-1" />
                            Admin
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-50 text-gray-600 border-gray-200">
                            Standard User
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Test Connection */}
              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-[#080707]">Test Connection</p>
                    <p className="text-sm text-muted-foreground">Verify the Salesforce API connection is working</p>
                  </div>
                  <Button
                    onClick={handleTestConnection}
                    disabled={isTesting || !status.connected}
                    variant="outline"
                    className="border-[#0176D3] text-[#0176D3] hover:bg-[#0176D3] hover:text-white"
                  >
                    {isTesting ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Test Connection
                      </>
                    )}
                  </Button>
                </div>
                {testResult && (
                  <div className={cn(
                    "mt-3 p-3 rounded-lg flex items-center gap-2",
                    testResult.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                  )}>
                    {testResult.success ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <XCircle className="h-5 w-5" />
                    )}
                    <span className="text-sm">{testResult.message}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admin Profiles Configuration */}
      <Card className="shadow-sm bg-white">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-base font-semibold text-[#080707]">Admin Access Configuration</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Users with these Salesforce Profiles will have admin access to Settings
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Admin Profiles (SALESFORCE_ADMIN_PROFILES)</Label>
            <p className="text-sm font-mono text-[#080707] mt-2">
              System Administrator
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Configure via environment variable. Use comma-separated values for multiple profiles.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
