import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AddPinDialog from "./dialogs/AddPinDialog";
import PinDetailsDialog from "./dialogs/PinDetailsDialog";

export default function Planner() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedPin, setSelectedPin] = useState<any>(null);

  const { data: pins = [] } = useQuery({
    queryKey: ["/api/pins"],
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      visited: "bg-green-100 text-green-700",
      planned: "bg-orange-100 text-orange-700",
      wishlist: "bg-blue-100 text-blue-700",
    };
    return variants[status as keyof typeof variants] || variants.planned;
  };

  return (
    <>
      <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Travel Planner</h2>
        <Button size="sm" onClick={() => setShowAddDialog(true)} data-testid="button-add-pin">
          <i className="fas fa-plus mr-1"></i>Add Pin
        </Button>
      </div>

      {/* Map Placeholder */}
      <Card className="mb-4 h-48">
        <CardContent className="h-full flex items-center justify-center">
          <div className="text-center">
            <i className="fas fa-map text-4xl text-muted-foreground mb-2"></i>
            <p className="text-sm text-muted-foreground">Interactive Map</p>
            <p className="text-xs text-muted-foreground">Pins and routes will display here</p>
            <Button variant="outline" size="sm" className="mt-2">
              <i className="fas fa-external-link-alt mr-1"></i>
              Open in Maps
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Destinations List */}
      <div className="space-y-3">
        <h3 className="font-medium text-sm text-muted-foreground">Your Destinations</h3>
        
        {pins.length === 0 ? (
          <Card>
            <CardContent className="p-4 text-center">
              <i className="fas fa-map-pin text-muted-foreground text-2xl mb-2"></i>
              <p className="text-sm text-muted-foreground">No destinations yet</p>
              <p className="text-xs text-muted-foreground">Add your first pin to get started</p>
            </CardContent>
          </Card>
        ) : (
          pins.map((pin: any) => (
            <Card key={pin.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium" data-testid={`text-destination-${pin.id}`}>
                    {pin.title}
                  </h4>
                  <Badge className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(pin.status)}`}>
                    {pin.status}
                  </Badge>
                </div>
                {pin.address && (
                  <p className="text-sm text-muted-foreground mb-2">
                    <i className="fas fa-map-marker-alt mr-1"></i>
                    {pin.address}
                  </p>
                )}
                {pin.notes && (
                  <p className="text-sm text-muted-foreground mb-2">{pin.notes}</p>
                )}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {pin.visitedOn || pin.scheduledOn || "No date set"}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs text-primary" 
                    onClick={() => setSelectedPin(pin)}
                    data-testid={`button-view-details-${pin.id}`}
                  >
                    View details →
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      </div>

      {/* Dialogs */}
      <AddPinDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
      <PinDetailsDialog 
        pin={selectedPin} 
        open={!!selectedPin} 
        onOpenChange={(open) => !open && setSelectedPin(null)} 
      />
    </>
  );
}
