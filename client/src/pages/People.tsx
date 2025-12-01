import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, 
  Plus, 
  Globe, 
  Building, 
  Calendar, 
  Users,
  Sparkles,
  Crown,
  Briefcase,
  Landmark,
  TrendingUp,
  User,
  Linkedin,
  Twitter,
  Loader2,
  ChevronRight,
  Trash2
} from "lucide-react";
import type { TravelLocation, ImportantPerson, LocationResearch } from "@shared/schema";

const apiRequest = async (url: string, options?: RequestInit) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    credentials: "include",
  });
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return response.json();
};

const personTypeIcons: Record<string, any> = {
  government: Landmark,
  ceo: Crown,
  cio: Briefcase,
  investor: TrendingUp,
  executive: Building,
  other: User,
};

const personTypeColors: Record<string, string> = {
  government: "bg-red-50 text-red-700 border-red-200",
  ceo: "bg-amber-50 text-amber-700 border-amber-200",
  cio: "bg-blue-50 text-blue-700 border-blue-200",
  investor: "bg-green-50 text-green-700 border-green-200",
  executive: "bg-purple-50 text-purple-700 border-purple-200",
  other: "bg-gray-50 text-gray-700 border-gray-200",
};

export default function People() {
  const queryClient = useQueryClient();
  const [selectedLocation, setSelectedLocation] = useState<TravelLocation | null>(null);
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [isResearching, setIsResearching] = useState(false);
  const [newLocation, setNewLocation] = useState({
    name: "",
    locationType: "city",
    country: "",
    region: "",
    travelDate: "",
    notes: "",
  });

  const { data: locations = [] } = useQuery<TravelLocation[]>({
    queryKey: ["/api/locations"],
    queryFn: () => apiRequest("/api/locations"),
  });

  const { data: allPeople = [] } = useQuery<ImportantPerson[]>({
    queryKey: ["/api/people"],
    queryFn: () => apiRequest("/api/people"),
  });

  const { data: locationPeople = [] } = useQuery<ImportantPerson[]>({
    queryKey: ["/api/people", selectedLocation?.id],
    queryFn: () => apiRequest(`/api/people?locationId=${selectedLocation?.id}`),
    enabled: !!selectedLocation,
  });

  const { data: research = [] } = useQuery<LocationResearch[]>({
    queryKey: ["/api/locations", selectedLocation?.id, "research"],
    queryFn: () => apiRequest(`/api/locations/${selectedLocation?.id}/research`),
    enabled: !!selectedLocation,
  });

  const createLocationMutation = useMutation({
    mutationFn: (data: typeof newLocation) => apiRequest("/api/locations", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
      setIsAddingLocation(false);
      setNewLocation({ name: "", locationType: "city", country: "", region: "", travelDate: "", notes: "" });
    },
  });

  const deleteLocationMutation = useMutation({
    mutationFn: (id: number) => fetch(`/api/locations/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
      setSelectedLocation(null);
    },
  });

  const runResearchMutation = useMutation({
    mutationFn: async (locationId: number) => {
      const researchRecord = await apiRequest(`/api/locations/${locationId}/research`, {
        method: "POST",
        body: JSON.stringify({ status: "running" }),
      });

      const location = locations.find(l => l.id === locationId);
      const response = await fetch("/api/ai/research-people", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locationId,
          locationName: location?.name,
          locationType: location?.locationType,
          country: location?.country,
        }),
      });
      
      if (!response.ok) throw new Error("Research failed");
      const result = await response.json();

      await apiRequest(`/api/research/${researchRecord.id}`, {
        method: "PATCH",
        body: JSON.stringify({ 
          status: "completed",
          results: JSON.stringify(result),
          peopleFound: result.people?.length || 0,
          completedAt: new Date().toISOString(),
        }),
      });

      if (result.people && result.people.length > 0) {
        await apiRequest("/api/people/bulk", {
          method: "POST",
          body: JSON.stringify({
            people: result.people.map((p: any) => ({
              ...p,
              locationId,
              source: "ai_research",
            })),
          }),
        });
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/people"] });
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
      setIsResearching(false);
    },
    onError: () => {
      setIsResearching(false);
    },
  });

  const handleRunResearch = () => {
    if (!selectedLocation) return;
    setIsResearching(true);
    runResearchMutation.mutate(selectedLocation.id);
  };

  const peopleToShow = selectedLocation ? locationPeople : allPeople;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-border shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-[#080707] flex items-center gap-2">
            <Users className="h-6 w-6 text-[#0176D3]" />
            Executive Travel Intelligence
          </h1>
          <p className="text-sm text-muted-foreground">
            Discover important people to meet when traveling to new locations
          </p>
        </div>
        
        <Dialog open={isAddingLocation} onOpenChange={setIsAddingLocation}>
          <DialogTrigger asChild>
            <Button 
              className="bg-[#0176D3] hover:bg-[#0176D3]/90"
              data-testid="button-add-location"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Location
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border-border">
            <DialogHeader>
              <DialogTitle className="text-[#080707]">Add Travel Location</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label className="text-[#080707]">Location Name</Label>
                <Input
                  value={newLocation.name}
                  onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                  placeholder="e.g., Dubai, UAE, CES 2025"
                  className="bg-white border-border mt-1"
                  data-testid="input-location-name"
                />
              </div>
              <div>
                <Label className="text-[#080707]">Type</Label>
                <Select 
                  value={newLocation.locationType} 
                  onValueChange={(v) => setNewLocation({ ...newLocation, locationType: v })}
                >
                  <SelectTrigger className="bg-white border-border mt-1" data-testid="select-location-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-border">
                    <SelectItem value="city">City</SelectItem>
                    <SelectItem value="country">Country</SelectItem>
                    <SelectItem value="conference">Conference</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {newLocation.locationType === "city" && (
                <div>
                  <Label className="text-[#080707]">Country</Label>
                  <Input
                    value={newLocation.country}
                    onChange={(e) => setNewLocation({ ...newLocation, country: e.target.value })}
                    placeholder="Country name"
                    className="bg-white border-border mt-1"
                    data-testid="input-location-country"
                  />
                </div>
              )}
              <div>
                <Label className="text-[#080707]">Travel Date (Optional)</Label>
                <Input
                  type="date"
                  value={newLocation.travelDate}
                  onChange={(e) => setNewLocation({ ...newLocation, travelDate: e.target.value })}
                  className="bg-white border-border mt-1"
                  data-testid="input-travel-date"
                />
              </div>
              <div>
                <Label className="text-[#080707]">Notes (Optional)</Label>
                <Textarea
                  value={newLocation.notes}
                  onChange={(e) => setNewLocation({ ...newLocation, notes: e.target.value })}
                  placeholder="Purpose of visit, events, meetings..."
                  className="bg-white border-border mt-1"
                  data-testid="input-location-notes"
                />
              </div>
              <Button
                onClick={() => createLocationMutation.mutate(newLocation)}
                className="w-full bg-[#0176D3] hover:bg-[#0176D3]/90"
                disabled={!newLocation.name || createLocationMutation.isPending}
                data-testid="button-save-location"
              >
                {createLocationMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Add Location
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-4">
          <Card className="bg-white border-border shadow-sm">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-[#080707] text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[#0176D3]" />
                Saved Locations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-280px)]">
                <div className="p-4 space-y-2">
                  <div
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      !selectedLocation 
                        ? "bg-[#0176D3]/10 border border-[#0176D3]" 
                        : "bg-gray-50 border border-transparent hover:border-border"
                    }`}
                    onClick={() => setSelectedLocation(null)}
                    data-testid="button-all-people"
                  >
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-[#0176D3]" />
                      <span className="text-[#080707] font-medium">All People</span>
                    </div>
                    <p className="text-muted-foreground text-sm mt-1">{allPeople.length} contacts</p>
                  </div>
                  
                  <Separator className="my-3" />
                  
                  {locations.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No locations added yet</p>
                      <p className="text-sm">Add a city, country, or conference</p>
                    </div>
                  ) : (
                    locations.map((location) => (
                      <div
                        key={location.id}
                        className={`p-3 rounded-lg cursor-pointer transition-all group ${
                          selectedLocation?.id === location.id 
                            ? "bg-[#0176D3]/10 border border-[#0176D3]" 
                            : "bg-gray-50 border border-transparent hover:border-border"
                        }`}
                        onClick={() => setSelectedLocation(location)}
                        data-testid={`location-card-${location.id}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {location.locationType === "city" && <Building className="h-4 w-4 text-blue-600" />}
                            {location.locationType === "country" && <Globe className="h-4 w-4 text-green-600" />}
                            {location.locationType === "conference" && <Calendar className="h-4 w-4 text-purple-600" />}
                            <span className="text-[#080707] font-medium">{location.name}</span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-[#0176D3] transition-colors" />
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {location.locationType}
                          </Badge>
                          {location.country && (
                            <span className="text-muted-foreground text-sm">{location.country}</span>
                          )}
                        </div>
                        {location.travelDate && (
                          <p className="text-muted-foreground text-xs mt-1">
                            {new Date(location.travelDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-8">
          <Card className="bg-white border-border shadow-sm">
            <CardHeader className="pb-3 border-b border-border">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[#080707] text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#0176D3]" />
                  {selectedLocation ? (
                    <>
                      Important People in {selectedLocation.name}
                      <Badge variant="outline" className="ml-2">
                        {locationPeople.length} contacts
                      </Badge>
                    </>
                  ) : (
                    <>
                      All Important People
                      <Badge variant="outline" className="ml-2">
                        {allPeople.length} contacts
                      </Badge>
                    </>
                  )}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {selectedLocation && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                        onClick={() => deleteLocationMutation.mutate(selectedLocation.id)}
                        data-testid="button-delete-location"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={handleRunResearch}
                        disabled={isResearching}
                        className="bg-[#0176D3] hover:bg-[#0176D3]/90"
                        data-testid="button-run-research"
                      >
                        {isResearching ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Sparkles className="h-4 w-4 mr-2" />
                        )}
                        {isResearching ? "Researching..." : "AI Deep Research"}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-280px)]">
                {peopleToShow.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-lg">No important people found</p>
                    {selectedLocation ? (
                      <p className="text-sm mt-1">
                        Click "AI Deep Research" to discover important people in {selectedLocation.name}
                      </p>
                    ) : (
                      <p className="text-sm mt-1">
                        Add a location and run AI research to discover important people
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 p-4">
                    {peopleToShow.map((person) => {
                      const PersonIcon = personTypeIcons[person.personType || "other"] || User;
                      const colorClass = personTypeColors[person.personType || "other"];
                      
                      return (
                        <div
                          key={person.id}
                          className="bg-white rounded-lg p-4 border border-border hover:border-[#0176D3] hover:shadow-md transition-all"
                          data-testid={`person-card-${person.id}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg border ${colorClass}`}>
                                <PersonIcon className="h-5 w-5" />
                              </div>
                              <div>
                                <h3 className="text-[#080707] font-semibold">{person.name}</h3>
                                {person.title && (
                                  <p className="text-muted-foreground text-sm">{person.title}</p>
                                )}
                                {person.organization && (
                                  <p className="text-muted-foreground text-sm">{person.organization}</p>
                                )}
                              </div>
                            </div>
                            {person.relevanceScore && person.relevanceScore > 0 && (
                              <Badge 
                                variant="outline" 
                                className={`${
                                  person.relevanceScore >= 80 
                                    ? "border-green-300 text-green-700 bg-green-50" 
                                    : person.relevanceScore >= 50 
                                      ? "border-amber-300 text-amber-700 bg-amber-50"
                                      : ""
                                }`}
                              >
                                {person.relevanceScore}%
                              </Badge>
                            )}
                          </div>
                          
                          {person.whyImportant && (
                            <p className="text-muted-foreground text-sm mt-3 line-clamp-2">
                              {person.whyImportant}
                            </p>
                          )}
                          
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-2">
                              {person.personType && (
                                <Badge variant="outline" className={`text-xs ${colorClass}`}>
                                  {person.personType}
                                </Badge>
                              )}
                              {person.country && (
                                <Badge variant="outline" className="text-xs">
                                  {person.country}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              {person.linkedinUrl && (
                                <a
                                  href={person.linkedinUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                                  data-testid={`link-linkedin-${person.id}`}
                                >
                                  <Linkedin className="h-4 w-4 text-[#0A66C2]" />
                                </a>
                              )}
                              {person.twitterUrl && (
                                <a
                                  href={person.twitterUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                                  data-testid={`link-twitter-${person.id}`}
                                >
                                  <Twitter className="h-4 w-4 text-[#1DA1F2]" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
