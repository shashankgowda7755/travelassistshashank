import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import AddExpenseDialog from "./dialogs/AddExpenseDialog";
import AddPersonDialog from "./dialogs/AddPersonDialog";
import AddJournalDialog from "./dialogs/AddJournalDialog";
import AddPinDialog from "./dialogs/AddPinDialog";

export default function Dashboard() {
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [showPersonDialog, setShowPersonDialog] = useState(false);
  const [showJournalDialog, setShowJournalDialog] = useState(false);
  const [showPinDialog, setShowPinDialog] = useState(false);

  const { data: stats } = useQuery({
    queryKey: ["/api/stats/today"],
  });

  const quickActions = [
    { icon: "fas fa-pen", label: "Journal", action: "journal", onClick: () => setShowJournalDialog(true) },
    { icon: "fas fa-user-plus", label: "Person", action: "person", onClick: () => setShowPersonDialog(true) },
    { icon: "fas fa-dollar-sign", label: "Expense", action: "expense", onClick: () => setShowExpenseDialog(true) },
    { icon: "fas fa-map-pin", label: "Pin", action: "pin", onClick: () => setShowPinDialog(true) },
  ];

  return (
    <>
      <div className="p-4 space-y-6">
      {/* Quick Actions */}
      <section>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">Quick Add</h2>
        <div className="grid grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Button
              key={action.action}
              variant="outline"
              className="flex flex-col items-center p-3 h-auto"
              onClick={action.onClick}
              data-testid={`button-quick-${action.action}`}
            >
              <i className={`${action.icon} text-primary mb-1`}></i>
              <span className="text-xs font-medium">{action.label}</span>
            </Button>
          ))}
        </div>
      </section>

      {/* Today's Progress */}
      <section>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">Today's Progress</h2>
        
        {/* Routine Progress Card */}
        <Card className="mb-3">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Daily Routine</h3>
              <span className="text-sm text-muted-foreground" data-testid="text-routine-completion">
                {stats?.routineCompletion || "0/0"}
              </span>
            </div>
            <div className="space-y-2">
              {["Morning walk", "Journal writing", "Learning session", "Stretching", "Photo editing"].map((task, index) => {
                const isCompleted = index < 3; // Mock completion for first 3 tasks
                return (
                <div key={task} className="flex items-center space-x-2">
                  <div className={`w-4 h-4 rounded-sm flex items-center justify-center ${
                    isCompleted ? "bg-green-500" : "border-2 border-muted"
                  }`}>
                    {isCompleted && <i className="fas fa-check text-white text-xs"></i>}
                  </div>
                  <span className={`text-sm ${index < 3 ? "" : "text-muted-foreground"}`}>
                    {task}
                  </span>
                </div>
              )})}
            </div>
          </CardContent>
        </Card>

        {/* Water & Food Tracker */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-sm">Water</h3>
                <i className="fas fa-tint text-blue-500"></i>
              </div>
              <div className="flex items-center space-x-1 mb-2">
                {Array.from({ length: 6 }, (_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full ${
                      i < (stats?.waterGlasses || 0) ? "bg-blue-500" : "bg-blue-200"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground" data-testid="text-water-intake">
                {stats?.waterGlasses || 0}/6 glasses
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-sm">Meals</h3>
                <i className="fas fa-utensils text-orange-500"></i>
              </div>
              <div className="space-y-1">
                {["breakfast", "lunch", "dinner"].map((meal) => (
                  <div key={meal} className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      stats?.mealsCompleted?.includes(meal) ? "bg-green-500" : "bg-muted"
                    }`} />
                    <span className={`text-xs ${
                      stats?.mealsCompleted?.includes(meal) ? "" : "text-muted-foreground"
                    }`}>
                      {meal.charAt(0).toUpperCase() + meal.slice(1)} {stats?.mealsCompleted?.includes(meal) ? "✓" : ""}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Next Destination */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Next Stop</h3>
              <i className="fas fa-map-marker-alt text-primary"></i>
            </div>
            <p className="text-lg font-semibold" data-testid="text-next-destination">
              Rishikesh, Uttarakhand
            </p>
            <p className="text-sm text-muted-foreground">Expected arrival: Tomorrow</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                Planned
              </span>
              <Button variant="ghost" size="sm" className="text-xs text-primary" data-testid="button-view-on-map">
                View on map →
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
      </div>

      {/* Dialogs */}
      <AddExpenseDialog open={showExpenseDialog} onOpenChange={setShowExpenseDialog} />
      <AddPersonDialog open={showPersonDialog} onOpenChange={setShowPersonDialog} />
      <AddJournalDialog open={showJournalDialog} onOpenChange={setShowJournalDialog} />
      <AddPinDialog open={showPinDialog} onOpenChange={setShowPinDialog} />
    </>
  );
}
