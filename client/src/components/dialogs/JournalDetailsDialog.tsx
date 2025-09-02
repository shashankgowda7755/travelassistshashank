import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface JournalDetailsDialogProps {
  entry: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function JournalDetailsDialog({ entry, open, onOpenChange }: JournalDetailsDialogProps) {
  if (!entry) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{entry.title || "Travel Entry"}</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {new Date(entry.taggedAt).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Photos */}
          {entry.photoUrls && entry.photoUrls.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Photos</h4>
              <div className="grid grid-cols-2 gap-2">
                {entry.photoUrls.map((url: string, index: number) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Journal photo ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Content */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium text-sm mb-2">Story</h4>
              <div className="prose prose-sm max-w-none">
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {entry.body}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Audio */}
          {entry.audioUrl && (
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium text-sm mb-2">Audio Note</h4>
                <audio controls className="w-full">
                  <source src={entry.audioUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </CardContent>
            </Card>
          )}
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button>
              <i className="fas fa-edit mr-2"></i>
              Edit Entry
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}