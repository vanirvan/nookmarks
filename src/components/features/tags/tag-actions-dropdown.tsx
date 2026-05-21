"use client";

import {
  MoreVertical,
  Palette,
  Pencil,
  Pin,
  PinOff,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const TAG_COLORS = [
  { value: "gray" as const, label: "Gray", class: "bg-muted-foreground" },
  { value: "green" as const, label: "Green", class: "bg-green-500" },
  { value: "red" as const, label: "Red", class: "bg-destructive" },
  { value: "yellow" as const, label: "Yellow", class: "bg-yellow-500" },
  { value: "aqua" as const, label: "Aqua", class: "bg-cyan-500" },
  {
    value: "white" as const,
    label: "White",
    class: "bg-background border border-border",
  },
  { value: "black" as const, label: "Black", class: "bg-foreground" },
];

interface TagActionsDropdownProps {
  isPinned: boolean;
  currentColor: string;
  onEditClick: () => void;
  onDeleteClick: () => void;
  onPinToggle: () => void;
  onColorChange: (
    color: "gray" | "green" | "red" | "yellow" | "aqua" | "white" | "black",
  ) => void;
}

export function TagActionsDropdown({
  isPinned,
  currentColor,
  onEditClick,
  onDeleteClick,
  onPinToggle,
  onColorChange,
}: TagActionsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="h-6 w-6 hover:bg-black/10 dark:hover:bg-white/15 hover:text-foreground active:bg-black/15 dark:active:bg-white/20 aria-expanded:bg-black/10 dark:aria-expanded:bg-white/15"
            onClick={(e) => e.stopPropagation()}
          />
        }
      >
        <MoreVertical className="h-3 w-3" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onClick={onEditClick}>
          <Pencil className="h-4 w-4" />
          Edit Tag
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Palette className="h-4 w-4" />
            Change Color
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {TAG_COLORS.map((color) => (
              <DropdownMenuItem
                key={color.value}
                onClick={() => onColorChange(color.value)}
              >
                <div className={`h-4 w-4 rounded ${color.class}`} />
                {color.label}
                {currentColor === color.value && " ✓"}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuItem onClick={onPinToggle}>
          {isPinned ? (
            <>
              <PinOff className="h-4 w-4" />
              Unpin
            </>
          ) : (
            <>
              <Pin className="h-4 w-4" />
              Pin
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={onDeleteClick}>
          <Trash2 className="h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
