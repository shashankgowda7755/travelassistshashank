import { Button } from "@/components/ui/button";

interface FloatingActionButtonProps {
  onShowCommandConsole: () => void;
}

export default function FloatingActionButton({ onShowCommandConsole }: FloatingActionButtonProps) {
  return (
    <div className="fixed bottom-20 right-4 z-40">
      <Button
        onClick={onShowCommandConsole}
        className="w-14 h-14 rounded-full shadow-lg"
        data-testid="button-floating-action"
      >
        <i className="fas fa-plus text-xl"></i>
      </Button>
    </div>
  );
}
