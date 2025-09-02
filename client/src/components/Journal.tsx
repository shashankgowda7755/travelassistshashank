import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Journal() {
  const { data: entries = [] } = useQuery({
    queryKey: ["/api/journal"],
  });

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Travel Journal</h2>
        <Button size="sm" data-testid="button-add-entry">
          <i className="fas fa-plus mr-1"></i>New Entry
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <Input
          type="text"
          placeholder="Search journal entries..."
          className="pl-10"
          data-testid="input-search-journal"
        />
        <i className="fas fa-search absolute left-3 top-3 text-muted-foreground"></i>
      </div>

      {/* Journal Entries */}
      <div className="space-y-4">
        {entries.length === 0 ? (
          <Card>
            <CardContent className="p-4 text-center">
              <i className="fas fa-book text-muted-foreground text-2xl mb-2"></i>
              <p className="text-sm text-muted-foreground">No journal entries yet</p>
              <p className="text-xs text-muted-foreground">Start documenting your journey</p>
            </CardContent>
          </Card>
        ) : (
          entries.map((entry: any) => (
            <Card key={entry.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-map-marker-alt text-primary text-sm"></i>
                    <span className="text-sm font-medium" data-testid={`text-entry-location-${entry.id}`}>
                      {entry.title || "Travel Entry"}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(entry.taggedAt).toLocaleDateString()}
                  </span>
                </div>
                
                {entry.photoUrls && entry.photoUrls.length > 0 && (
                  <img
                    src={entry.photoUrls[0]}
                    alt="Journal entry"
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                )}
                
                <p className="text-sm text-foreground mb-3" data-testid={`text-entry-content-${entry.id}`}>
                  {entry.body}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex space-x-4 text-xs text-muted-foreground">
                    {entry.photoUrls && (
                      <span><i className="fas fa-camera mr-1"></i>{entry.photoUrls.length} photos</span>
                    )}
                    <span><i className="fas fa-clock mr-1"></i>5 min read</span>
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs text-primary" data-testid={`button-read-more-${entry.id}`}>
                    Read more →
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
