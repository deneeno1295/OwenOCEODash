import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { UploadCloud, Link, FileText, RefreshCw, File, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function DataCloud() {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // In a real app, handle the files
      setIsUploading(true);
      setTimeout(() => setIsUploading(false), 1500);
    }
  };

  const handleUploadClick = () => {
    // Simulate upload click
    setIsUploading(true);
    setTimeout(() => setIsUploading(false), 1500);
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-border shadow-sm">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#080707]">Data Cloud Ingestion</h1>
          <p className="text-muted-foreground text-sm">Upload and process content for Salesforce Data Cloud ingestion.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Upload Area */}
        <Card className="lg:col-span-2 shadow-sm bg-white min-h-[500px] flex flex-col">
          <CardContent className="p-6 flex-1 flex flex-col">
            <Tabs defaultValue="file" className="w-full flex-1 flex flex-col">
              <TabsList className="grid w-full max-w-md grid-cols-3 mb-6 bg-gray-100 p-1">
                <TabsTrigger value="file" className="data-[state=active]:bg-white data-[state=active]:text-[#0176D3] data-[state=active]:shadow-sm">
                  <UploadCloud className="h-4 w-4 mr-2" /> File Upload
                </TabsTrigger>
                <TabsTrigger value="url" className="data-[state=active]:bg-white data-[state=active]:text-[#0176D3] data-[state=active]:shadow-sm">
                  <Link className="h-4 w-4 mr-2" /> URL
                </TabsTrigger>
                <TabsTrigger value="text" className="data-[state=active]:bg-white data-[state=active]:text-[#0176D3] data-[state=active]:shadow-sm">
                  <FileText className="h-4 w-4 mr-2" /> Plain Text
                </TabsTrigger>
              </TabsList>

              <TabsContent value="file" className="flex-1 flex flex-col mt-0">
                <div 
                  className={cn(
                    "flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-10 transition-colors cursor-pointer bg-gray-50/50",
                    dragActive ? "border-[#0176D3] bg-blue-50/50" : "border-gray-300 hover:border-[#0176D3] hover:bg-gray-50"
                  )}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={handleUploadClick}
                >
                  <div className={cn(
                    "w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4 transition-transform duration-300",
                    isUploading && "scale-110"
                  )}>
                    {isUploading ? (
                      <RefreshCw className="h-8 w-8 text-[#0176D3] animate-spin" />
                    ) : (
                      <UploadCloud className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-[#080707] mb-2">
                    {isUploading ? "Uploading..." : "Drop files here or click to upload"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Supports PDF, PNG, JPG, TXT
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="url" className="flex-1 flex flex-col items-center justify-center mt-0 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/30 p-10">
                 <div className="w-full max-w-md space-y-4">
                   <div className="space-y-2">
                     <label className="text-sm font-medium">Source URL</label>
                     <input 
                       type="text" 
                       placeholder="https://example.com/data" 
                       className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0176D3] focus:border-transparent"
                     />
                   </div>
                   <Button className="w-full bg-[#0176D3] hover:bg-[#014486]">Ingest URL</Button>
                 </div>
              </TabsContent>
              
              <TabsContent value="text" className="flex-1 flex flex-col mt-0">
                <textarea 
                  className="flex-1 w-full p-4 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#0176D3] focus:border-transparent font-mono text-sm"
                  placeholder="Paste raw text content here for immediate ingestion..."
                />
                <div className="mt-4 flex justify-end">
                   <Button className="bg-[#0176D3] hover:bg-[#014486]">Process Text</Button>
                </div>
              </TabsContent>

            </Tabs>
          </CardContent>
        </Card>

        {/* Recent Activity Sidebar */}
        <Card className="shadow-sm bg-white h-full flex flex-col">
          <CardHeader className="border-b border-gray-100 flex flex-row items-center justify-between py-4">
            <CardTitle className="text-base font-bold text-[#080707]">Recent Activity</CardTitle>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-[#0176D3]">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-0 flex-1 flex items-center justify-center min-h-[300px]">
            <div className="text-center space-y-3 p-6">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
                <File className="h-6 w-6 text-gray-300" />
              </div>
              <p className="text-muted-foreground text-sm">No recent uploads</p>
              <Button variant="link" className="text-[#0176D3]">View History</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
