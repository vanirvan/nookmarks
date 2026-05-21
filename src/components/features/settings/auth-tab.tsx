"use client";

import { ShieldCheck, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth/auth.client";

export function AuthTab() {
  const { useSession } = authClient;
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Account Profile</h3>
        <p className="text-sm text-muted-foreground">
          Manage your personal details and account settings.
        </p>
      </div>

      <Card className="overflow-hidden border border-border bg-card/50 backdrop-blur-sm">
        <CardHeader className="bg-linear-to-r from-primary/10 via-transparent to-transparent pb-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary/20">
              <AvatarImage src={user?.image || ""} alt={user?.name} />
              <AvatarFallback className="bg-primary/5 text-primary text-xl">
                {user?.name?.charAt(0) || <User className="h-6 w-6" />}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <CardTitle className="text-xl flex items-center gap-2">
                {user?.name}
                <Badge variant="secondary" className="gap-1 text-xs">
                  <ShieldCheck className="h-3 w-3 text-emerald-500" />
                  Active Session
                </Badge>
              </CardTitle>
              <CardDescription>{user?.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6 text-sm">
          <div className="space-y-1.5 p-3 rounded-lg border border-border/50 bg-muted/30">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Email Verified
            </span>
            <p className="font-medium text-emerald-600 dark:text-emerald-400">
              Yes
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
