import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { 
  Brain, 
  Layers, 
  GitBranch, 
  Target, 
  Search, 
  BarChart2, 
  PieChart, 
  TrendingUp, 
  ShieldCheck, 
  Zap,
  Users,
  Database,
  Link2,
  Bot
} from "lucide-react";
import { cn } from "@/lib/utils";

// Diagram Data Structures
const agents = [
  { name: "Prospecting Agent", icon: Target },
  { name: "Qualification Agent", icon: Search },
  { name: "Deal Desk Agent", icon: ShieldCheck },
  { name: "Forecasting Agent", icon: BarChart2 },
  { name: "Upsell Agent", icon: TrendingUp },
  { name: "Compensation Agent", icon: PieChart },
  { name: "Enablement Agent", icon: Zap },
];

const capabilities = {
  sales: [
    {
      title: "Seller Enablement & Coaching",
      items: [
        { name: "Salesforce Enablement", status: "best", competitor: "Highspot" },
        { name: "Conversation Intelligence", status: "best", competitor: "Gong" },
        { name: "Slack", status: "best", isDark: true },
        { name: "Bluebirds", status: "strong", competitor: "Bluebirds" },
        { name: "AI Notes", status: "weak", competitor: "Otter.ai" },
        { name: "Momentum", status: "strong", competitor: "Momentum" }
      ]
    },
    {
      title: "Sales Engagement",
      items: [
        { name: "Sales Engagement", status: "strong", competitor: "Outreach" },
        { name: "Salesforce Scheduler", status: "strong", competitor: "Calendly" },
        { name: "Slack", status: "best", isDark: true },
        { name: "Bluebirds", status: "strong" },
        { name: "Real-time Notes/Coach", status: "weak", competitor: "Recall" },
        { name: "Intelligent Lead Routing", status: "weak", competitor: "Chili Piper" }
      ]
    },
    {
      title: "Deal Content & Execution",
      items: [
        { name: "Revenue Cloud & Billing", status: "strong", competitor: "Zuora" },
        { name: "Partner Cloud", status: "strong", competitor: "Crossbeam" },
        { name: "Rep-First CLM & e-Sig", status: "weak", competitor: "DocuSign" },
        { name: "Digital Deal Rooms", status: "weak", competitor: "Box" },
        { name: "Demo Automation", status: "weak", competitor: "Navattic" }
      ]
    },
    {
      title: "Revenue Operations & Intelligence",
      items: [
        { name: "Revenue Intelligence", status: "strong", competitor: "Clari" },
        { name: "Collaborative Forecasting", status: "strong" },
        { name: "Commissions", status: "strong", competitor: "Spiff" },
        { name: "Sales/Success Handoff", status: "weak" },
        { name: "AI Forecasting", status: "weak" },
        { name: "Tableau", status: "best", isDark: true }
      ]
    },
    {
      title: "Prospecting & Data Ecosystem",
      items: [
        { name: "AI Data Orchestration", status: "weak", competitor: "Clay" },
        { name: "B2B Data Provider", status: "strong", competitor: "Apollo.io" },
        { name: "Data Cloud", status: "best", isDark: true }
      ]
    }
  ]
};

const gaps = {
  sales: [
    { title: "Rep-First UI/UX Lag", priority: "Critical", competitor: "Momentum" },
    { title: "Data Enrichment Quality", priority: "High", competitor: "Clay" },
    { title: "Meeting Intelligence Latency", priority: "Medium", competitor: "Recall" }
  ],
  service: [],
  marketing: []
};

export default function CloudIntelligence() {
  const [cloud, setCloud] = useState("sales");

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-border shadow-sm">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#080707]">Vision for {cloud.charAt(0).toUpperCase() + cloud.slice(1)}</h1>
          <p className="text-muted-foreground text-sm">Agentforce {cloud.charAt(0).toUpperCase() + cloud.slice(1)} in an Agentic Enterprise</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Legend */}
          <div className="flex items-center gap-3 text-xs mr-4">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-[#0b1e46]"></div>
              <span>Best in Class</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-[#0176D3]"></div>
              <span>Strong Position</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full border border-gray-300 bg-white"></div>
              <span>No or Weak Position</span>
            </div>
          </div>

          <Select value={cloud} onValueChange={setCloud}>
            <SelectTrigger className="w-[150px] bg-white border-gray-200">
              <SelectValue placeholder="Select Cloud" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="sales">Sales Cloud</SelectItem>
              <SelectItem value="service" disabled>Service Cloud</SelectItem>
              <SelectItem value="marketing" disabled>Marketing Cloud</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Architecture Diagram */}
        <Card className="lg:col-span-9 border-t-4 border-primary shadow-sm bg-[#F0F8FF]/50 min-h-[600px]">
          <CardContent className="p-6 space-y-8">
            
            {/* Top Layer: Agentforce */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm relative">
              <h3 className="text-center font-bold text-lg mb-6 text-[#080707]">Agentforce Sales</h3>
              <div className="absolute top-4 right-4 flex items-center gap-1 text-xs font-mono text-gray-400">
                <Bot className="h-4 w-4" /> MeshMesh
              </div>
              
              <div className="flex justify-between items-start px-4">
                {agents.map((agent, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 group cursor-pointer">
                    <div className="w-12 h-12 rounded-full bg-white border-2 border-[#0176D3] flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all z-10 relative">
                      <div className="w-10 h-10 rounded-full bg-[#EBF8FF] flex items-center justify-center">
                        <agent.icon className="h-5 w-5 text-[#0176D3]" />
                      </div>
                    </div>
                    <span className="text-[10px] font-medium text-center w-20 leading-tight">{agent.name}</span>
                    {/* Connection Line */}
                    <div className="h-8 w-0.5 bg-blue-300 -mt-2 -z-0"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Connectivity Layer */}
            <div className="h-8 bg-white border border-gray-200 rounded-md flex items-center justify-center text-xs text-gray-500 shadow-sm uppercase tracking-widest relative">
              Connectivity Layer
              {/* Vertical Connection Lines to Columns below */}
              <div className="absolute -bottom-6 left-[10%] w-0.5 h-6 bg-blue-300"></div>
              <div className="absolute -bottom-6 left-[30%] w-0.5 h-6 bg-blue-300"></div>
              <div className="absolute -bottom-6 left-[50%] w-0.5 h-6 bg-blue-300"></div>
              <div className="absolute -bottom-6 left-[70%] w-0.5 h-6 bg-blue-300"></div>
              <div className="absolute -bottom-6 left-[90%] w-0.5 h-6 bg-blue-300"></div>
            </div>

            {/* Middle Layer: Functional Capabilities */}
            <div className="grid grid-cols-5 gap-4 items-start">
              {capabilities.sales.map((col, i) => (
                <div key={i} className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm min-h-[240px]">
                  <h4 className="text-xs font-bold text-gray-700 mb-3 text-center h-8 flex items-center justify-center border-b border-gray-100 pb-2">
                    {col.title}
                  </h4>
                  <div className="space-y-2">
                    {col.items.map((item, j) => (
                      <div 
                        key={j} 
                        className={cn(
                          "p-2 rounded text-[10px] font-medium text-center border relative shadow-sm transition-all hover:scale-105 cursor-default",
                          item.status === 'best' ? "bg-[#0b1e46] text-white border-[#0b1e46]" :
                          item.status === 'strong' ? "bg-[#3ba1ff] text-white border-[#3ba1ff]" :
                          "bg-white text-gray-700 border-gray-300"
                        )}
                      >
                        {item.name}
                        {item.competitor && (
                          <div className="absolute -bottom-2 -right-1 bg-white border border-gray-200 shadow-sm rounded px-1 py-[1px] text-[8px] text-gray-500 flex items-center gap-1 font-mono z-10 whitespace-nowrap">
                            {item.competitor}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Layer: Data Layer */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex items-center justify-between relative mt-4">
              {/* Connection Lines from Columns */}
              <div className="absolute -top-6 left-[20%] w-0.5 h-6 bg-blue-300"></div>
              <div className="absolute -top-6 left-[50%] w-0.5 h-6 bg-blue-300"></div>
              <div className="absolute -top-6 left-[80%] w-0.5 h-6 bg-blue-300"></div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                  <Database className="h-4 w-4 text-indigo-600" />
                </div>
                <span className="font-bold text-sm">Data Cloud</span>
              </div>
              
              <span className="font-bold text-lg text-[#080707]">Unified Data Layer</span>
              
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-orange-50 flex items-center justify-center">
                   <div className="w-4 h-4 bg-orange-500 rotate-45"></div>
                </div>
                <span className="font-bold text-sm text-gray-600">Informatica</span>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Side Panel: Analysis & Competitors */}
        <div className="lg:col-span-3 space-y-6">
          {/* Strategic Gaps / Disruptors */}
          <Card className="border-t-4 border-red-500 shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#080707] text-base">
                <GitBranch className="h-4 w-4 text-red-500" />
                Strategic Gaps
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-3">
                {gaps.sales.map((gap, i) => (
                  <div key={i} className="p-3 bg-red-50 border border-red-100 rounded-md">
                    <div className="flex justify-between items-start">
                      <p className="font-medium text-xs text-red-800">{gap.title}</p>
                      <Badge variant="outline" className="text-[9px] border-red-200 text-red-600 bg-white px-1 py-0">
                        {gap.priority}
                      </Badge>
                    </div>
                    {gap.competitor && (
                      <div className="mt-2 flex items-center gap-1 text-[10px] text-gray-500">
                        <span className="text-red-400 font-semibold">Risk:</span> {gap.competitor}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Competitor Engines */}
          <Card className="border-t-4 border-[#0176D3] shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#080707] text-base">
                <Zap className="h-4 w-4 text-[#0176D3]" />
                Disruptor Stack
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4">
              
              <div>
                <h5 className="font-bold text-sm mb-2 flex items-center gap-2">
                  Buy PMF Engine <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-0 text-[9px]">High Risk</Badge>
                </h5>
                <div className="bg-gray-50 p-3 rounded border border-gray-200 space-y-2">
                   <div className="flex items-center justify-between text-xs">
                     <span className="font-semibold text-gray-700">Momentum</span>
                     <span className="text-[10px] text-gray-500">Rep-first UI</span>
                   </div>
                   <div className="flex items-center justify-between text-xs">
                     <span className="font-semibold text-gray-700">Recall</span>
                     <span className="text-[10px] text-gray-500">Data Capture</span>
                   </div>
                </div>
              </div>

              <div>
                <h5 className="font-bold text-sm mb-2 flex items-center gap-2">
                  Build Competition Engine
                </h5>
                <div className="bg-gray-50 p-3 rounded border border-gray-200 space-y-2">
                   <div className="flex items-center justify-between text-xs">
                     <span className="font-semibold text-gray-700">Clay</span>
                     <span className="text-[10px] text-gray-500">Orchestration</span>
                   </div>
                   <div className="flex items-center justify-between text-xs">
                     <span className="font-semibold text-gray-700">Qualified</span>
                     <span className="text-[10px] text-gray-500">Conversational</span>
                   </div>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
