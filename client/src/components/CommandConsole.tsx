import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CommandConsoleProps {
  onClose: () => void;
}

export default function CommandConsole({ onClose }: CommandConsoleProps) {
  const [command, setCommand] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const commandMutation = useMutation({
    mutationFn: async (cmd: string) => {
      const response = await apiRequest("POST", "/api/command", { command: cmd });
      return await response.json();
    },
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: "Command executed",
          description: result.message,
        });
        setHistory(prev => [...prev, `✓ ${command}`, `→ ${result.message}`]);
        
        // Invalidate relevant queries to refresh data
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
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setHistory(prev => [...prev, `✗ ${command}`, `→ Error: ${error.message}`]);
      setCommand("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;
    commandMutation.mutate(command);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <Card className="w-full max-w-md mx-auto mb-20 mx-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Command Console</CardTitle>
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
            Type natural language commands like "add person John, phone 123456789, met in Delhi"
          </p>
        </CardHeader>
        
        <CardContent>
          {/* Command History */}
          {history.length > 0 && (
            <div className="bg-muted rounded-lg p-3 mb-4 max-h-32 overflow-y-auto">
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
          
          {/* Command Input */}
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <Input
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="Enter your command..."
              disabled={commandMutation.isPending}
              className="flex-1"
              data-testid="input-command"
            />
            <Button 
              type="submit" 
              disabled={commandMutation.isPending || !command.trim()}
              data-testid="button-execute-command"
            >
              {commandMutation.isPending ? (
                <i className="fas fa-spinner fa-spin"></i>
              ) : (
                <i className="fas fa-paper-plane"></i>
              )}
            </Button>
          </form>
          
          {/* Example Commands */}
          <div className="mt-4 text-xs text-muted-foreground">
            <p className="font-medium mb-1">Examples:</p>
            <div className="space-y-1">
              <p>• "add person Rajesh, phone 9876543210, met in Delhi"</p>
              <p>• "expense 250 for lunch"</p>
              <p>• "water 500ml"</p>
              <p>• "journal: amazing day exploring Red Fort"</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
