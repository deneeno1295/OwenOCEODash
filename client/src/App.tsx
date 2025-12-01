import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Layout from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import Sentiment from "@/pages/Sentiment";
import CloudIntelligence from "@/pages/CloudIntelligence";
import Startups from "@/pages/Startups";
import StartupDetail from "@/pages/StartupDetail";
import Priorities from "@/pages/Priorities";
import PriorityDetail from "@/pages/PriorityDetail";
import DataCloud from "@/pages/DataCloud";
import People from "@/pages/People";
import Settings from "@/pages/Settings";
import Profile from "@/pages/Profile";
import CompetitorDetail from "@/pages/CompetitorDetail";
import Login from "@/pages/Login";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, isConfigured } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0176D3] via-[#014486] to-[#032D60] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-white border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-white/80">Loading...</p>
        </div>
      </div>
    );
  }

  if (isConfigured && !isAuthenticated) {
    return <Login />;
  }

  return <>{children}</>;
}

function Router() {
  return (
    <AuthGate>
      <Layout>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/sentiment" component={Sentiment} />
          <Route path="/cloud-intelligence" component={CloudIntelligence} />
          <Route path="/startups" component={Startups} />
          <Route path="/startups/:id">
            {(params) => <StartupDetail id={params.id} />}
          </Route>
          <Route path="/priorities" component={Priorities} />
          <Route path="/priorities/:id">
            {(params) => <PriorityDetail id={params.id} />}
          </Route>
          <Route path="/data-cloud" component={DataCloud} />
          <Route path="/people" component={People} />
          <Route path="/settings" component={Settings} />
          <Route path="/profile" component={Profile} />
          <Route path="/competitors/:id">
            {(params) => <CompetitorDetail id={params.id} />}
          </Route>
          <Route component={NotFound} />
        </Switch>
      </Layout>
    </AuthGate>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
