import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface PinDetailsDialogProps {
  pin: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PinDetailsDialog({ pin, open, onOpenChange }: PinDetailsDialogProps) {
  const [status, setStatus] = useState(pin?.status || "planned");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (updates: any) => {
      const response = await apiRequest("PATCH", `/api/pins/${pin.id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Destination updated",
        description: "Changes saved successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/pins"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update destination",
        variant: "destructive",
      });
    },
  });

  if (!pin) return null;

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    const updates: any = { status: newStatus };
    
    if (newStatus === "visited" && !pin.visitedOn) {
      updates.visitedOn = new Date().toISOString().split('T')[0];
    }
    
    updateMutation.mutate(updates);
  };

  const handleOpenInMaps = () => {
    if (pin.address) {
      const query = encodeURIComponent(pin.address);
      window.open(`https://www.google.com/maps/search/${query}`, '_blank');
    } else {
      const query = encodeURIComponent(pin.title);
      window.open(`https://www.google.com/maps/search/${query}`, '_blank');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      visited: "bg-green-100 text-green-700",
      planned: "bg-orange-100 text-orange-700",
      wishlist: "bg-blue-100 text-blue-700",
    };
    return variants[status as keyof typeof variants] || variants.planned;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{pin.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Status and Basic Info */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                <Badge className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(status)}`}>
                  {status}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Update Status</label>
                <Select value={status} onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="visited">Visited</SelectItem>
                    <SelectItem value="wishlist">Wishlist</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {pin.address && (
                <div className="flex items-center space-x-2">
                  <i className="fas fa-map-marker-alt text-primary"></i>
                  <span className="text-sm">{pin.address}</span>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <i className="fas fa-calendar text-primary"></i>
                <span className="text-sm">
                  {pin.visitedOn ? `Visited on ${new Date(pin.visitedOn).toLocaleDateString()}` :
                   pin.scheduledOn ? `Scheduled for ${new Date(pin.scheduledOn).toLocaleDateString()}` :
                   "No date set"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {pin.notes && (
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium text-sm mb-2">Notes</h4>
                <p className="text-sm text-muted-foreground">{pin.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Photo */}
          {pin.photoUrl && (
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium text-sm mb-2">Photo</h4>
                <img
                  src={pin.photoUrl}
                  alt={pin.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </CardContent>
            </Card>
          )}
          
          <div className="flex justify-between">
            <Button variant="outline" onClick={handleOpenInMaps}>
              <i className="fas fa-external-link-alt mr-2"></i>
              Open in Maps
            </Button>
            <Button onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}