"use client";

import { Button } from "@/components/ui/button";
import { Google } from "@/components/ui/icons";
import { authClient } from "@/lib/auth/auth.client";
import { useAuthUIStore } from "@/services/features/auth-pages/store/auth-ui.store";

export function AuthGoogleButton() {
  const { isAuthenticating, setIsAuthenticating } = useAuthUIStore();

  const handleSignIn = async () => {
    setIsAuthenticating(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/app",
      });
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <Button
      variant="outline"
      className="flex h-10 w-full items-center gap-2"
      onClick={() => handleSignIn()}
      disabled={isAuthenticating}
    >
      <Google className="size-4" />
      <span>Sign in with Google</span>
    </Button>
  );
}
