"use client";

import { ChevronRight, Globe, Info, UploadCloud, User } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/services/features/settings/store/settings-store";
import { AboutTab } from "./about-tab";
import { AuthTab } from "./auth-tab";
import { ImportTab } from "./import-tab";
import { IntegrationsTab } from "./integrations-tab";

type SettingsTab = "auth" | "import" | "integrations" | "about";

interface TabItem {
  id: SettingsTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TABS: TabItem[] = [
  { id: "auth", label: "Account Profile", icon: User },
  { id: "import", label: "Import & Export", icon: UploadCloud },
  { id: "integrations", label: "Integrations", icon: Globe },
  { id: "about", label: "About App", icon: Info },
];

export function SettingsDialog() {
  const { isOpen, setIsOpen } = useSettingsStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>("auth");

  useEffect(() => {
    if (isOpen) {
      // Always reset to auth tab when settings is opened
      setActiveTab("auth");
    }
  }, [isOpen]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case "auth":
        return <AuthTab />;
      case "import":
        return <ImportTab />;
      case "integrations":
        return <IntegrationsTab />;
      case "about":
        return <AboutTab />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-none md:w-[850px] p-0 overflow-hidden md:h-[600px] flex flex-col md:flex-row gap-0 bg-background/95 backdrop-blur-md border border-border">
        {/* Left pane: tab list */}
        <div className="w-full md:w-64 bg-muted/30 border-b md:border-b-0 md:border-r border-border p-4 flex flex-col gap-1 shrink-0 select-none">
          <DialogHeader className="px-2 py-3 border-b border-border/50 mb-3 text-left">
            <DialogTitle className="text-base font-bold tracking-tight">
              System Settings
            </DialogTitle>
          </DialogHeader>

          <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible scrollbar-none">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left shrink-0",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1">{tab.label}</span>
                  <ChevronRight
                    className={cn(
                      "h-3.5 w-3.5 shrink-0 hidden md:block opacity-0 transition-all",
                      isActive &&
                        "opacity-60 translate-x-0.5 text-primary-foreground",
                    )}
                  />
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right pane: tab panel */}
        <div className="flex-1 overflow-y-auto md:h-full">
          <div className="p-6 md:p-8 flex flex-col justify-between min-h-full">
            <div className="flex-1 min-h-0">{renderActiveTabContent()}</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
