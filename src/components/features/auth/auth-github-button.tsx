"use client";

import { Button } from "@/components/ui/button";
import { Github } from "@/components/ui/icons";
import { authClient } from "@/lib/auth/auth.client";
import { useAuthUIStore } from "@/services/features/auth-pages/store/auth-ui.store";

export function AuthGithubButton() {
  const { isAuthenticating, setIsAuthenticating } = useAuthUIStore();

  const handleSignIn = async () => {
    setIsAuthenticating(true);
    try {
      await authClient.signIn.social({
        provider: "github",
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
      <Github className="size-4" />
      GitHub
    </Button>
  );
}
