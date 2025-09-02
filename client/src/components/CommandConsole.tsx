import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CommandConsoleProps {
  onClose: () => void;
}

export default function CommandConsole({ onClose }: CommandConsoleProps) {
  const [command, setCommand] = useState("");
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [queryResults, setQueryResults] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Command execution mutation
  const commandMutation = useMutation({
    mutationFn: async (data: { cmd: string; file?: File }) => {
      if (data.file) {
        // Upload file first, then execute command with photo URL
        const formData = new FormData();
        formData.append('file', data.file);
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });
        
        if (!uploadResponse.ok) {
          throw new Error('Failed to upload image');
        }
        
        const uploadResult = await uploadResponse.json();
        const enhancedCommand = data.cmd + ` with photo ${uploadResult.url}`;
        
        const response = await apiRequest("POST", "/api/command", { command: enhancedCommand });
        return await response.json();
      } else {
        const response = await apiRequest("POST", "/api/command", { command: data.cmd });
        return await response.json();
      }
    },
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: "Command executed",
          description: result.message,
        });
        setHistory(prev => [...prev, `✓ ${command}`, `→ ${result.message}`]);
        queryClient.invalidateQueries();
      } else {
        toast({
          title: "Command failed",
          description: result.message,
          variant: "destructive",
        });
        setHistory(prev => [...prev, `✗ ${command}`, `→ ${result.message}`]);
      }
      setCommand("");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setHistory(prev => [...prev, `✗ ${command}`, `→ Error: ${error.message}`]);
      setCommand("");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
  });

  // Query execution mutation
  const queryMutation = useMutation({
    mutationFn: async (q: string) => {
      const response = await apiRequest("POST", "/api/query", { query: q });
      return await response.json();
    },
    onSuccess: (result) => {
      if (result.success) {
        setQueryResults(result);
        toast({
          title: "Query executed",
          description: `Found ${result.data?.length || 0} results`,
        });
      } else {
        toast({
          title: "Query failed",
          description: result.message,
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;
    commandMutation.mutate({ cmd: command, file: selectedFile || undefined });
  };

  const handleQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    queryMutation.mutate(query);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <Card className="w-full max-w-md mx-auto mb-20 mx-4 max-h-[80vh] overflow-y-auto">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">AI Assistant</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              data-testid="button-close-console"
            >
              <i className="fas fa-times"></i>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Add data or ask questions using natural language
          </p>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="commands" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="commands" data-testid="tab-commands">
                <i className="fas fa-plus mr-2"></i>Commands
              </TabsTrigger>
              <TabsTrigger value="queries" data-testid="tab-queries">
                <i className="fas fa-search mr-2"></i>Search
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="commands" className="space-y-4">
              {/* Command History */}
              {history.length > 0 && (
                <div className="bg-muted rounded-lg p-3 max-h-32 overflow-y-auto">
                  {history.slice(-6).map((line, index) => (
                    <div 
                      key={index} 
                      className={`text-xs ${line.startsWith('✓') ? 'text-green-600' : line.startsWith('✗') ? 'text-red-600' : 'text-muted-foreground'}`}
                    >
                      {line}
                    </div>
                  ))}
                </div>
              )}
              
              {/* File Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Attach Photo (optional)</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
                  data-testid="input-file-upload"
                />
                {selectedFile && (
                  <p className="text-xs text-green-600">
                    <i className="fas fa-check mr-1"></i>
                    {selectedFile.name}
                  </p>
                )}
              </div>
              
              {/* Command Input */}
              <form onSubmit={handleCommandSubmit} className="space-y-2">
                <Input
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  placeholder="e.g., add contact John with phone 1234567890 met in Pune"
                  disabled={commandMutation.isPending}
                  className="w-full"
                  data-testid="input-command"
                />
                <Button 
                  type="submit" 
                  disabled={commandMutation.isPending || !command.trim()}
                  className="w-full"
                  data-testid="button-execute-command"
                >
                  {commandMutation.isPending ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Executing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane mr-2"></i>
                      Execute Command
                    </>
                  )}
                </Button>
              </form>
              
              {/* Example Commands */}
              <div className="text-xs text-muted-foreground">
                <p className="font-medium mb-1">Examples:</p>
                <div className="space-y-1">
                  <p>• "add person Rajesh, phone 9876543210, met in Delhi"</p>
                  <p>• "expense 250 for lunch at street food"</p>
                  <p>• "water 500ml"</p>
                  <p>• "journal: amazing day exploring Red Fort"</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="queries" className="space-y-4">
              {/* Query Input */}
              <form onSubmit={handleQuerySubmit} className="space-y-2">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g., show me people I met in Pune"
                  disabled={queryMutation.isPending}
                  className="w-full"
                  data-testid="input-query"
                />
                <Button 
                  type="submit" 
                  disabled={queryMutation.isPending || !query.trim()}
                  className="w-full"
                  data-testid="button-execute-query"
                >
                  {queryMutation.isPending ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Searching...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-search mr-2"></i>
                      Search Data
                    </>
                  )}
                </Button>
              </form>
              
              {/* Query Results */}
              {queryResults && (
                <div className="bg-muted rounded-lg p-3 max-h-40 overflow-y-auto">
                  <p className="text-sm font-medium mb-2">AI Response:</p>
                  <p className="text-sm text-muted-foreground mb-2">
                    {queryResults.response}
                  </p>
                  {queryResults.data && queryResults.data.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      <p className="font-medium">Found {queryResults.data.length} results</p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Example Queries */}
              <div className="text-xs text-muted-foreground">
                <p className="font-medium mb-1">Examples:</p>
                <div className="space-y-1">
                  <p>• "show me people I met in Pune"</p>
                  <p>• "list today's expenses"</p>
                  <p>• "find guides in my contacts"</p>
                  <p>• "journal entries about food"</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
