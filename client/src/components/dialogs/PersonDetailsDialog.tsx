import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface PersonDetailsDialogProps {
  person: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PersonDetailsDialog({ person, open, onOpenChange }: PersonDetailsDialogProps) {
  if (!person) return null;

  const handleCall = () => {
    if (person.phone) {
      window.open(`tel:${person.phone}`, '_self');
    }
  };

  const handleWhatsApp = () => {
    if (person.whatsapp) {
      window.open(`https://wa.me/${person.whatsapp.replace(/[^0-9]/g, '')}`, '_blank');
    }
  };

  const handleEmail = () => {
    if (person.email) {
      window.open(`mailto:${person.email}`, '_self');
    }
  };

  const getPersonBadge = (person: any) => {
    if (person.whereMet?.toLowerCase().includes("guide")) return { text: "Guide", class: "bg-blue-100 text-blue-700" };
    if (person.notes?.toLowerCase().includes("traveler")) return { text: "Traveler", class: "bg-green-100 text-green-700" };
    return { text: "Local", class: "bg-purple-100 text-purple-700" };
  };

  const badge = getPersonBadge(person);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Contact Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Profile Section */}
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              {person.photoUrl ? (
                <img
                  src={person.photoUrl}
                  alt={person.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <i className="fas fa-user text-muted-foreground text-xl"></i>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{person.name}</h3>
              <p className="text-sm text-muted-foreground">{person.whereMet}</p>
              <Badge className={`text-xs px-2 py-1 rounded-full ${badge.class} mt-1`}>
                {badge.text}
              </Badge>
            </div>
          </div>

          {/* Contact Information */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <h4 className="font-medium text-sm">Contact Information</h4>
              
              {person.phone && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-phone text-primary"></i>
                    <span className="text-sm">{person.phone}</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleCall}>
                    Call
                  </Button>
                </div>
              )}
              
              {person.whatsapp && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <i className="fab fa-whatsapp text-green-500"></i>
                    <span className="text-sm">{person.whatsapp}</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleWhatsApp}>
                    Message
                  </Button>
                </div>
              )}
              
              {person.email && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-envelope text-primary"></i>
                    <span className="text-sm">{person.email}</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleEmail}>
                    Email
                  </Button>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <i className="fas fa-calendar text-primary"></i>
                <span className="text-sm">Met on {new Date(person.metOn).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {person.notes && (
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium text-sm mb-2">Notes</h4>
                <p className="text-sm text-muted-foreground">{person.notes}</p>
              </CardContent>
            </Card>
          )}
          
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