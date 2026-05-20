"use client";

import {
  Check,
  LayoutGrid,
  List,
  ListFilter,
  Plus,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { getCollectionIcon } from "@/lib/collection-icons";
import { cn } from "@/lib/utils";
import { useViewStore } from "@/services/features/bookmarks/store/view-store";

interface PageHeaderProps {
  title: string;
  description: string;
  iconName?: string | null;
  fallbackIconName?: string;
  onAddClick?: () => void;
}

export function PageHeader({
  title,
  description,
  iconName,
  fallbackIconName,
  onAddClick,
}: PageHeaderProps) {
  const Icon = getCollectionIcon(iconName || fallbackIconName || null);
  const { view, setView, search, setSearch, sortBy, setSortBy } =
    useViewStore();

  return (
    <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between mb-8">
      <div className="flex items-center gap-4">
        {Icon && (
          <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-xl shadow-sm shrink-0">
            <Icon size={24} />
          </div>
        )}
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <InputGroup className="flex-1 md:w-auto md:flex-none md:w-[200px] lg:w-[300px]">
          <InputGroupAddon>
            <Search className="h-4 w-4" />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search bookmarks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </InputGroup>

        <Button
          variant="default"
          className="gap-2 shadow-sm transition-all hover:shadow-md"
          onClick={onAddClick}
        >
          <Plus className="h-4 w-4" />
          Add new
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" size="sm" className="h-9 gap-2">
                <ListFilter className="h-4 w-4" />
                <span className="hidden sm:inline">Sort</span>
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Sort by</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {[
              { id: "newest", label: "Newest" },
              { id: "oldest", label: "Oldest" },
              { id: "a-z", label: "A-Z" },
              { id: "z-a", label: "Z-A" },
            ].map((option) => (
              <DropdownMenuItem
                key={option.id}
                onClick={() => setSortBy(option.id as any)}
                className="flex items-center justify-between"
              >
                {option.label}
                {sortBy === option.id && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center border rounded-md h-9 p-1 bg-muted/50">
          <Button
            variant="ghost"
            size="icon-sm"
            className={cn(
              "h-7 w-7",
              view === "grid" && "bg-background shadow-xs",
            )}
            onClick={() => setView("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className={cn(
              "h-7 w-7",
              view === "list" && "bg-background shadow-xs",
            )}
            onClick={() => setView("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
