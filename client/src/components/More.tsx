import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PackingDialog from "./dialogs/PackingDialog";
import BudgetDialog from "./dialogs/BudgetDialog";
import { useToast } from "@/hooks/use-toast";

export default function More() {
  const [showPackingDialog, setShowPackingDialog] = useState(false);
  const [showBudgetDialog, setShowBudgetDialog] = useState(false);
  const { toast } = useToast();

  const features = [
    { icon: "fas fa-suitcase", title: "Packing", subtitle: "Checklist", action: "packing", onClick: () => setShowPackingDialog(true) },
    { icon: "fas fa-chart-pie", title: "Budget", subtitle: "Expenses", action: "budget", onClick: () => setShowBudgetDialog(true) },
    { icon: "fas fa-map", title: "Offline Maps", subtitle: "Screenshots", action: "maps", onClick: () => toast({ title: "Coming Soon", description: "Offline maps feature will be available soon" }) },
    { icon: "fas fa-graduation-cap", title: "Learning", subtitle: "Progress", action: "learning", onClick: () => toast({ title: "Coming Soon", description: "Learning tracker will be available soon" }) },
    { icon: "fas fa-bus", title: "Transport", subtitle: "Log", action: "transport", onClick: () => toast({ title: "Coming Soon", description: "Transport log will be available soon" }) },
    { icon: "fas fa-bed", title: "Stays", subtitle: "History", action: "stays", onClick: () => toast({ title: "Coming Soon", description: "Stay history will be available soon" }) },
    { icon: "fas fa-first-aid", title: "Emergency", subtitle: "Contacts", action: "emergency", color: "text-destructive", onClick: () => toast({ title: "Coming Soon", description: "Emergency contacts will be available soon" }) },
    { icon: "fas fa-heart", title: "Wishlist", subtitle: "Bucket List", action: "wishlist", onClick: () => toast({ title: "Coming Soon", description: "Wishlist feature will be available soon" }) },
  ];

  const handleLogout = () => {
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
    // In a real app, this would clear session and redirect
    window.location.reload();
  };

  const handleExportData = () => {
    toast({
      title: "Export started",
      description: "Your data export will be ready shortly",
    });
    // In a real app, this would trigger data export
  };

  const handleAppSettings = () => {
    toast({
      title: "Settings",
      description: "App settings will be available soon",
    });
  };
  return (
    <>
      <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">More Features</h2>
      
      {/* Feature Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {features.map((feature) => (
          <Button
            key={feature.action}
            variant="outline"
            className="flex flex-col items-center p-4 h-auto hover:bg-accent transition-colors"
            onClick={feature.onClick}
            data-testid={`button-open-${feature.action}`}
          >
            <i className={`${feature.icon} ${feature.color || "text-primary"} text-xl mb-2`}></i>
            <span className="text-sm font-medium">{feature.title}</span>
            <span className="text-xs text-muted-foreground">{feature.subtitle}</span>
          </Button>
        ))}
      </div>

      {/* Quick Stats */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <h3 className="font-medium mb-3">Your Journey So Far</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary" data-testid="text-places-visited">0</div>
              <div className="text-xs text-muted-foreground">Places Visited</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary" data-testid="text-people-met">0</div>
              <div className="text-xs text-muted-foreground">People Met</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary" data-testid="text-journal-entries">0</div>
              <div className="text-xs text-muted-foreground">Journal Entries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary" data-testid="text-total-spent">₹0</div>
              <div className="text-xs text-muted-foreground">Total Spent</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <div className="space-y-3">
        <h3 className="font-medium text-sm text-muted-foreground">Settings</h3>
        
        <Button variant="outline" className="w-full justify-between" onClick={handleAppSettings} data-testid="button-app-settings">
          <div className="flex items-center space-x-3">
            <i className="fas fa-cog text-muted-foreground"></i>
            <span className="text-sm">App Settings</span>
          </div>
          <i className="fas fa-chevron-right text-muted-foreground text-xs"></i>
        </Button>
        
        <Button variant="outline" className="w-full justify-between" onClick={handleExportData} data-testid="button-export-data">
          <div className="flex items-center space-x-3">
            <i className="fas fa-download text-muted-foreground"></i>
            <span className="text-sm">Export Data</span>
          </div>
          <i className="fas fa-chevron-right text-muted-foreground text-xs"></i>
        </Button>
        
        <Button variant="outline" className="w-full justify-between" onClick={handleLogout} data-testid="button-logout">
          <div className="flex items-center space-x-3">
            <i className="fas fa-sign-out-alt text-muted-foreground"></i>
            <span className="text-sm">Logout</span>
          </div>
          <i className="fas fa-chevron-right text-muted-foreground text-xs"></i>
        </Button>
      </div>
      </div>

      {/* Dialogs */}
      <PackingDialog open={showPackingDialog} onOpenChange={setShowPackingDialog} />
      <BudgetDialog open={showBudgetDialog} onOpenChange={setShowBudgetDialog} />
    </>
  );
}
