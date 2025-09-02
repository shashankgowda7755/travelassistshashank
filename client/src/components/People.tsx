import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function People() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: people = [] } = useQuery({
    queryKey: ["/api/people", { search: searchQuery }],
    queryFn: async () => {
      const url = searchQuery ? `/api/people?search=${encodeURIComponent(searchQuery)}` : "/api/people";
      const response = await fetch(url, { credentials: "include" });
      return response.json();
    },
  });

  const getPersonBadge = (person: any) => {
    if (person.whereMet?.toLowerCase().includes("guide")) return { text: "Guide", class: "bg-blue-100 text-blue-700" };
    if (person.notes?.toLowerCase().includes("traveler")) return { text: "Traveler", class: "bg-green-100 text-green-700" };
    return { text: "Local", class: "bg-purple-100 text-purple-700" };
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">People I've Met</h2>
        <Button size="sm" data-testid="button-add-person">
          <i className="fas fa-user-plus mr-1"></i>Add Person
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <Input
          type="text"
          placeholder="Search people..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
          data-testid="input-search-people"
        />
        <i className="fas fa-search absolute left-3 top-3 text-muted-foreground"></i>
      </div>

      {/* People List */}
      <div className="space-y-3">
        {people.length === 0 ? (
          <Card>
            <CardContent className="p-4 text-center">
              <i className="fas fa-users text-muted-foreground text-2xl mb-2"></i>
              <p className="text-sm text-muted-foreground">No contacts yet</p>
              <p className="text-xs text-muted-foreground">Start adding people you meet</p>
            </CardContent>
          </Card>
        ) : (
          people.map((person: any) => {
            const badge = getPersonBadge(person);
            return (
              <Card key={person.id}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      {person.photoUrl ? (
                        <img
                          src={person.photoUrl}
                          alt={person.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <i className="fas fa-user text-muted-foreground"></i>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium" data-testid={`text-person-name-${person.id}`}>
                        {person.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {person.whereMet}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {person.whereMet} • {new Date(person.metOn).toLocaleDateString()}
                      </p>
                    </div>
                    {person.phone && (
                      <Button variant="ghost" size="sm" data-testid={`button-call-${person.id}`}>
                        <i className="fas fa-phone text-primary"></i>
                      </Button>
                    )}
                  </div>
                  
                  {person.notes && (
                    <p className="text-sm text-muted-foreground mb-2">{person.notes}</p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <Badge className={`text-xs px-2 py-1 rounded-full ${badge.class}`}>
                      {badge.text}
                    </Badge>
                    <Button variant="ghost" size="sm" className="text-xs text-primary" data-testid={`button-view-contact-${person.id}`}>
                      View details →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
