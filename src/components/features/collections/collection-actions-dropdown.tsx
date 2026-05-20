import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenuAction } from "@/components/ui/sidebar";

interface CollectionActionsDropdownProps {
  onEditClick: () => void;
  onDeleteClick: () => void;
}

export function CollectionActionsDropdown({
  onEditClick,
  onDeleteClick,
}: CollectionActionsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <SidebarMenuAction
            showOnHover
            className="right-8"
            title="More Options"
          >
            <MoreHorizontal />
          </SidebarMenuAction>
        }
      />
      <DropdownMenuContent className="w-48" side="bottom" align="start">
        <DropdownMenuItem onClick={onEditClick}>
          <Pencil className="mr-2 h-4 w-4" />
          <span>Edit</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onDeleteClick}
          className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
