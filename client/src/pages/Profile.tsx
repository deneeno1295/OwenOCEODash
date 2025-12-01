import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Building2, Phone, MapPin, Camera } from "lucide-react";

export default function Profile() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-3xl">
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-border shadow-sm">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#080707]">Profile</h1>
          <p className="text-sm text-muted-foreground">Manage your account information</p>
        </div>
        <User className="h-8 w-8 text-[#0176D3]" />
      </div>

      <Card className="shadow-sm bg-white">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-base font-semibold text-[#080707]">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex items-start gap-8">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src="" />
                <AvatarFallback className="bg-[#0176D3] text-white text-2xl">MB</AvatarFallback>
              </Avatar>
              <Button 
                size="icon" 
                variant="outline" 
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-white shadow-md"
                data-testid="button-change-avatar"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input 
                    id="firstName" 
                    defaultValue="Marc" 
                    data-testid="input-first-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input 
                    id="lastName" 
                    defaultValue="B." 
                    data-testid="input-last-name"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email" 
                    defaultValue="marc.b@oceo.ai" 
                    className="pl-9"
                    data-testid="input-email"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="phone" 
                    type="tel" 
                    placeholder="+1 (555) 000-0000" 
                    className="pl-9"
                    data-testid="input-phone"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm bg-white">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-base font-semibold text-[#080707]">Organization</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title</Label>
              <Input 
                id="title" 
                defaultValue="CEO Office" 
                data-testid="input-title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="department" 
                  defaultValue="Executive" 
                  className="pl-9"
                  data-testid="input-department"
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                id="location" 
                defaultValue="San Francisco, CA" 
                className="pl-9"
                data-testid="input-location"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" data-testid="button-cancel">
          Cancel
        </Button>
        <Button className="bg-[#0176D3] hover:bg-[#014486]" data-testid="button-save-profile">
          Save Changes
        </Button>
      </div>
    </div>
  );
}
