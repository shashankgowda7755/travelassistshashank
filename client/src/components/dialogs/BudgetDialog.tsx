import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface BudgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function BudgetDialog({ open, onOpenChange }: BudgetDialogProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("today");

  const { data: expenses = [] } = useQuery({
    queryKey: ["/api/expenses", selectedPeriod === "today" ? new Date().toISOString().split('T')[0] : undefined],
    queryFn: async () => {
      const url = selectedPeriod === "today" 
        ? `/api/expenses?date=${new Date().toISOString().split('T')[0]}`
        : "/api/expenses";
      const response = await fetch(url, { credentials: "include" });
      return response.json();
    },
    enabled: open,
  });

  const getCategoryIcon = (category: string) => {
    const icons = {
      food: "fas fa-utensils",
      transport: "fas fa-bus",
      stay: "fas fa-bed",
      gear: "fas fa-shopping-bag",
      misc: "fas fa-ellipsis-h",
    };
    return icons[category as keyof typeof icons] || icons.misc;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      food: "bg-orange-100 text-orange-700",
      transport: "bg-blue-100 text-blue-700",
      stay: "bg-green-100 text-green-700",
      gear: "bg-purple-100 text-purple-700",
      misc: "bg-gray-100 text-gray-700",
    };
    return colors[category as keyof typeof colors] || colors.misc;
  };

  const totalAmount = expenses.reduce((sum: number, expense: any) => sum + Number(expense.amount), 0);
  
  const categoryTotals = expenses.reduce((acc: any, expense: any) => {
    acc[expense.category] = (acc[expense.category] || 0) + Number(expense.amount);
    return acc;
  }, {});

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Budget & Expenses</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Period Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Time Period</label>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Total Amount */}
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-primary mb-1">
                ₹{totalAmount.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">
                Total {selectedPeriod === "today" ? "today" : selectedPeriod}
              </p>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          {Object.keys(categoryTotals).length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium text-sm mb-3">By Category</h4>
                <div className="space-y-2">
                  {Object.entries(categoryTotals).map(([category, amount]: [string, any]) => (
                    <div key={category} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <i className={`${getCategoryIcon(category)} text-primary`}></i>
                        <span className="text-sm capitalize">{category}</span>
                      </div>
                      <Badge className={`${getCategoryColor(category)}`}>
                        ₹{amount.toLocaleString()}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Expenses */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium text-sm mb-3">Recent Expenses</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {expenses.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No expenses for this period
                  </p>
                ) : (
                  expenses.slice(0, 10).map((expense: any) => (
                    <div key={expense.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div className="flex items-center space-x-2">
                        <i className={`${getCategoryIcon(expense.category)} text-primary text-sm`}></i>
                        <div>
                          <p className="text-sm">{expense.note || "Expense"}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(expense.spentAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-medium">₹{expense.amount}</span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end">
            <Button onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}