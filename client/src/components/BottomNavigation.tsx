interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const tabs = [
    { id: "dashboard", icon: "fas fa-home", label: "Home" },
    { id: "planner", icon: "fas fa-map", label: "Planner" },
    { id: "journal", icon: "fas fa-book", label: "Journal" },
    { id: "people", icon: "fas fa-users", label: "People" },
    { id: "more", icon: "fas fa-ellipsis-h", label: "More" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40">
      <div className="max-w-md mx-auto px-4">
        <div className="flex items-center justify-around py-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center py-2 px-3 relative transition-colors ${
                activeTab === tab.id ? "" : "text-muted-foreground"
              }`}
              data-testid={`tab-${tab.id}`}
            >
              <i className={`${tab.icon} text-lg mb-1`}></i>
              <span className="text-xs">{tab.label}</span>
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
