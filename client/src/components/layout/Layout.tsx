import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  BarChart3, 
  Cloud, 
  Rocket, 
  Search, 
  Bell, 
  Settings, 
  Menu,
  ChevronLeft,
  Grid3X3,
  Database,
  User,
  LogOut,
  HelpCircle,
  Moon,
  Sun,
  Target,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import oceoLogo from "@assets/Gemini_Generated_Image_tg7gnitg7gnitg7g_1764010640466.png";
import { useAuth } from "@/contexts/AuthContext";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout, isConfigured } = useAuth();

  const displayName = user?.name || "Marc B.";
  const displayEmail = user?.email || "marc.b@oceo.ai";
  const initials = displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const handleLogout = async () => {
    await logout();
  };

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: Target, label: "Priorities", href: "/priorities" },
    { icon: Rocket, label: "Startups", href: "/startups" },
    { icon: BarChart3, label: "Sentiment", href: "/sentiment" },
    { icon: Cloud, label: "Cloud Intel", href: "/cloud-intelligence" },
    { icon: Database, label: "Data Cloud", href: "/data-cloud" },
    { icon: Users, label: "People", href: "/people" },
  ];

  return (
    <div className="flex h-screen bg-[#F3F4F6] text-foreground overflow-hidden font-sans">
      {/* Header - Salesforce Style (White with specific branding) */}
      <header className="h-14 bg-white border-b border-border flex items-center justify-between px-4 shadow-sm z-50 fixed w-full top-0 left-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Grid3X3 className="h-6 w-6" />
            </Button>
            <div className="flex items-center">
               <img src={oceoLogo} alt="OCEO Logo" className="h-8 w-auto" />
            </div>
          </div>
          
          <nav className="hidden md:flex items-center ml-6 space-x-1">
             {navItems.map((item) => {
               const isActive = location === item.href;
               return (
                 <Link key={item.href} href={item.href}>
                   <div className={cn(
                     "px-3 py-1.5 text-sm font-medium rounded-sm cursor-pointer transition-colors relative flex items-center gap-2",
                     isActive 
                       ? "text-[#0176D3] bg-transparent" 
                       : "text-foreground hover:text-[#0176D3] hover:bg-gray-50"
                   )}>
                     {isActive ? <item.icon className="h-4 w-4" /> : null}
                     {item.label}
                     {isActive && (
                       <div className="absolute bottom-[-18px] left-0 w-full h-[3px] bg-[#0176D3] rounded-t-sm" />
                     )}
                   </div>
                 </Link>
               );
             })}
          </nav>
        </div>

        <div className="flex items-center flex-1 justify-center max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search anything (Cmd+K)..." 
              className="pl-9 bg-gray-100 border-transparent focus:bg-white focus:border-[#0176D3] focus:ring-0 h-9 rounded-md transition-all w-full"
            />
            <div className="absolute right-2.5 top-2 text-[10px] bg-white border border-gray-200 rounded px-1.5 text-gray-400 font-medium">⌘K</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center mr-2 px-3 py-1 bg-red-50 border border-red-100 rounded-full">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2 animate-pulse"></div>
            <span className="text-xs font-medium text-red-600">System Offline</span>
          </div>

          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-[#0176D3]">
            <Bell className="h-5 w-5" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2 ml-2 cursor-pointer hover:bg-gray-50 rounded-md p-1 transition-colors">
                <div className="text-right hidden md:block">
                  <div className="text-xs font-bold text-gray-900">{displayName}</div>
                  <div className="text-[10px] text-gray-500">CEO Office</div>
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-[#0176D3] text-white text-xs">{initials}</AvatarFallback>
                </Avatar>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-white" align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{displayName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {displayEmail}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link href="/profile">
                <DropdownMenuItem className="cursor-pointer" data-testid="dropdown-profile">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
              </Link>
              <Link href="/settings">
                <DropdownMenuItem className="cursor-pointer" data-testid="dropdown-settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem className="cursor-pointer" data-testid="dropdown-help">
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Help & Support</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer text-red-600 focus:text-red-600" 
                data-testid="dropdown-logout"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 flex flex-col mt-14 min-w-0 overflow-hidden bg-[url('https://www.salesforce.com/content/dam/sfdc-docs/www/logos/logo-salesforce.svg')] bg-no-repeat bg-fixed bg-center bg-[length:50%]">
        <div className="flex-1 overflow-auto bg-[#F3F4F6] p-4 md:p-6">
           <div className="max-w-[1600px] mx-auto space-y-6">
            {children}
           </div>
        </div>
      </main>
    </div>
  );
}
