import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface AddJournalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddJournalDialog({ open, onOpenChange }: AddJournalDialogProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: api.createJournalEntry,
    onSuccess: () => {
      toast({
        title: "Journal entry added",
        description: "Your travel memory has been saved",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/journal"] });
      onOpenChange(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add journal entry",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setTitle("");
    setBody("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!body) return;

    mutation.mutate({
      title: title || "Travel Entry",
      body,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Journal Entry</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What happened today?"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="body">Your story *</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write about your travel experience..."
              rows={6}
              required
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending || !body}>
              {mutation.isPending ? "Saving..." : "Save Entry"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}