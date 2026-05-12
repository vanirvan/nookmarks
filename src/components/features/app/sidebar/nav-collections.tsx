import { Plus } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar";

export function NavCollections() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Collections</SidebarGroupLabel>
      <SidebarGroupAction>
        <Plus className="size-4" /> <span className="sr-only">Add</span>
      </SidebarGroupAction>
      <SidebarGroupContent>
        <SidebarMenu>
          {/* Collections group */}
          {/* Collection 1 */}
          {/* Collection 2 */}
          {/* Collection 3 */}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
