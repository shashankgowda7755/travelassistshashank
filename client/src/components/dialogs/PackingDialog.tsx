import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface PackingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PackingDialog({ open, onOpenChange }: PackingDialogProps) {
  const [newItemName, setNewItemName] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("All");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: packingItems = [] } = useQuery({
    queryKey: ["/api/packing", selectedRegion],
    queryFn: async () => {
      const url = selectedRegion !== "All" ? `/api/packing?region=${selectedRegion}` : "/api/packing";
      const response = await fetch(url, { credentials: "include" });
      return response.json();
    },
    enabled: open,
  });

  const addItemMutation = useMutation({
    mutationFn: async (item: any) => {
      const response = await apiRequest("POST", "/api/packing", item);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Item added",
        description: "Packing item added to your list",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/packing"] });
      setNewItemName("");
    },
  });

  const toggleItemMutation = useMutation({
    mutationFn: async ({ id, packed }: { id: string; packed: boolean }) => {
      const response = await apiRequest("PATCH", `/api/packing/${id}`, { packed });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/packing"] });
    },
  });

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    addItemMutation.mutate({
      name: newItemName,
      region: selectedRegion === "All" ? null : selectedRegion,
      packed: false,
    });
  };

  const handleToggleItem = (item: any) => {
    toggleItemMutation.mutate({
      id: item.id,
      packed: !item.packed,
    });
  };

  const packedCount = packingItems.filter((item: any) => item.packed).length;
  const totalCount = packingItems.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Packing Checklist</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {packedCount}/{totalCount} items packed
          </p>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Region Filter */}
          <div className="space-y-2">
            <Label>Region</Label>
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Regions</SelectItem>
                <SelectItem value="North">North India</SelectItem>
                <SelectItem value="South">South India</SelectItem>
                <SelectItem value="East">East India</SelectItem>
                <SelectItem value="West">West India</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Add New Item */}
          <form onSubmit={handleAddItem} className="flex space-x-2">
            <Input
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Add new item..."
              className="flex-1"
            />
            <Button type="submit" disabled={!newItemName.trim() || addItemMutation.isPending}>
              <i className="fas fa-plus"></i>
            </Button>
          </form>

          {/* Packing List */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {packingItems.length === 0 ? (
              <Card>
                <CardContent className="p-4 text-center">
                  <i className="fas fa-suitcase text-muted-foreground text-2xl mb-2"></i>
                  <p className="text-sm text-muted-foreground">No packing items yet</p>
                  <p className="text-xs text-muted-foreground">Add items to your packing list</p>
                </CardContent>
              </Card>
            ) : (
              packingItems.map((item: any) => (
                <div key={item.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted">
                  <Checkbox
                    checked={item.packed}
                    onCheckedChange={() => handleToggleItem(item)}
                  />
                  <span className={`flex-1 text-sm ${item.packed ? 'line-through text-muted-foreground' : ''}`}>
                    {item.name}
                  </span>
                  {item.region && (
                    <span className="text-xs bg-muted px-2 py-1 rounded">
                      {item.region}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
          
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