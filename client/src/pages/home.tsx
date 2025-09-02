import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Dashboard from "@/components/Dashboard";
import Planner from "@/components/Planner";
import Journal from "@/components/Journal";
import People from "@/components/People";
import More from "@/components/More";
import BottomNavigation from "@/components/BottomNavigation";
import FloatingActionButton from "@/components/FloatingActionButton";
import CommandConsole from "@/components/CommandConsole";

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showCommandConsole, setShowCommandConsole] = useState(false);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mx-auto mb-2">
            <i className="fas fa-mountain text-primary-foreground"></i>
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const renderActiveScreen = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "planner":
        return <Planner />;
      case "journal":
        return <Journal />;
      case "people":
        return <People />;
      case "more":
        return <More />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <i className="fas fa-mountain text-primary-foreground text-sm"></i>
            </div>
            <h1 className="text-lg font-semibold text-foreground">Miles Alone</h1>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Online</span>
            </div>
            <button 
              className="p-2 hover:bg-secondary rounded-lg" 
              onClick={() => setShowCommandConsole(!showCommandConsole)}
              data-testid="button-command-console"
            >
              <i className="fas fa-terminal text-muted-foreground"></i>
            </button>
          </div>
        </div>
      </header>

      {/* Command Console */}
      {showCommandConsole && (
        <CommandConsole onClose={() => setShowCommandConsole(false)} />
      )}

      {/* Main Content */}
      <main className="max-w-md mx-auto pb-20">
        {renderActiveScreen()}
      </main>

      {/* Floating Action Button */}
      <FloatingActionButton onShowCommandConsole={() => setShowCommandConsole(true)} />

      {/* Bottom Navigation */}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
