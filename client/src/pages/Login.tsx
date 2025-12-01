import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud, Lock, Shield } from "lucide-react";

export default function Login() {
  const { login, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0176D3] via-[#014486] to-[#032D60] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 backdrop-blur mb-4">
            <Cloud className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">OCEO Dashboard</h1>
          <p className="text-blue-100">Competitive Intelligence & Executive Dashboard</p>
        </div>

        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl text-[#080707]">Sign in with Salesforce</CardTitle>
            <CardDescription>
              Connect your Salesforce org to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button 
              onClick={login}
              disabled={isLoading}
              className="w-full bg-[#0176D3] hover:bg-[#014486] text-white h-12 text-base font-medium"
              data-testid="button-salesforce-login"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Connecting...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Cloud className="h-5 w-5" />
                  Continue with Salesforce
                </span>
              )}
            </Button>

            <div className="space-y-3 pt-4 border-t border-gray-100">
              <div className="flex items-start gap-3 text-sm text-muted-foreground">
                <Shield className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                <span>Your data is securely handled through Salesforce OAuth</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-muted-foreground">
                <Lock className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                <span>We only access the data you authorize</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-blue-100/60 text-sm mt-6">
          Powered by Salesforce Data Cloud
        </p>
      </div>
    </div>
  );
}
