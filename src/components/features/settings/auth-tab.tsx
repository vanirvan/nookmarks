"use client";

import {
  AlertTriangle,
  KeyRound,
  Loader2,
  ShieldCheck,
  Trash2,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/auth.client";

export function AuthTab() {
  const router = useRouter();
  const { useSession } = authClient;
  const { data: session } = useSession();
  const user = session?.user;

  // Change Password Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Delete Account State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long.");
      return;
    }

    setIsChangingPassword(true);
    try {
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });

      if (error) {
        toast.error(
          error.message ||
            "Failed to change password. Please check your credentials.",
        );
      } else {
        toast.success("Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      toast.error("Please type DELETE to confirm account deletion.");
      return;
    }

    setIsDeletingAccount(true);
    try {
      const { error } = await authClient.deleteUser();

      if (error) {
        toast.error(error.message || "Failed to delete account.");
      } else {
        toast.success("Your account has been deleted permanently.");
        setIsDeleteDialogOpen(false);
        router.push("/sign-in");
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Account Profile</h3>
        <p className="text-sm text-muted-foreground">
          Manage your personal details and account credentials.
        </p>
      </div>

      {/* User Information Card */}
      <Card className="overflow-hidden border border-border bg-card/50 backdrop-blur-sm shadow-xs">
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
                <Badge variant="secondary" className="gap-1 text-xs py-0.5">
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

      {/* Change Password Card */}
      <Card className="border border-border bg-card/50 backdrop-blur-sm shadow-xs">
        <CardHeader>
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Change Password</CardTitle>
          </div>
          <CardDescription>
            Update your account password. We recommend a secure, unique
            password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="bg-background/60"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="bg-background/60"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="bg-background/60"
                />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isChangingPassword}>
                {isChangingPassword ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Danger Zone: Delete Account */}
      <Card className="border-destructive/30 bg-destructive/5 backdrop-blur-sm shadow-xs">
        <CardHeader>
          <div className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            <CardTitle className="text-base font-bold">Danger Zone</CardTitle>
          </div>
          <CardDescription className="text-destructive/80 font-medium">
            Permanently delete your account. This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex gap-3 items-start text-xs text-destructive">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Permanent Deletion Warning</p>
              <p className="mt-1 leading-relaxed">
                Deleting your account will permanently purge all your bookmarks,
                nested tag structures, collections, and custom configurations.
                This action is completely irreversible.
              </p>
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              variant="destructive"
              onClick={() => {
                setDeleteConfirmText("");
                setIsDeleteDialogOpen(true);
              }}
              className="font-semibold shadow-xs hover:bg-destructive/95"
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md bg-background border border-border">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 shrink-0 animate-bounce" />
              Are you absolutely sure?
            </DialogTitle>
            <DialogDescription className="pt-2 leading-relaxed">
              This action is **irreversible**. All your bookmarks, tags, and
              data will be deleted forever.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-3">
            <p className="text-xs font-semibold text-muted-foreground">
              To confirm, please type{" "}
              <span className="font-bold text-destructive font-mono select-all p-1 bg-muted rounded-md">
                DELETE
              </span>{" "}
              below:
            </p>
            <Input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE"
              className="bg-background/60 border-destructive/20 focus-visible:ring-destructive font-semibold uppercase"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeletingAccount}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== "DELETE" || isDeletingAccount}
            >
              {isDeletingAccount ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                  <span>Deleting Account...</span>
                </>
              ) : (
                "Permanently Delete Account"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
