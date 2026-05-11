"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { authClient } from "@/lib/auth/auth.client";
import {
  type SignInValues,
  signInSchema,
} from "@/services/features/auth-pages/schema/auth-schema";
import { useAuthUIStore } from "@/services/features/auth-pages/store/auth-ui.store";

export function SignInForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const { isAuthenticating, setIsAuthenticating } = useAuthUIStore();

  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignInValues) => {
    setIsAuthenticating(true);
    setError(null);
    try {
      const { error: signInError } = await authClient.signIn.email({
        email: data.email,
        password: data.password,
      });

      if (signInError) {
        setError(signInError.message || "Failed to sign in");
      } else {
        router.push("/");
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
    >
      {error && (
        <div className="text-destructive text-sm font-medium">{error}</div>
      )}

      <div className="space-y-2">
        <label
          htmlFor="email"
          className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Email
        </label>
        <InputGroup className="h-10">
          <InputGroupAddon>
            <Mail className="size-4" />
          </InputGroupAddon>
          <InputGroupInput
            id="email"
            type="email"
            placeholder="name@example.com"
            {...form.register("email")}
            required
          />
        </InputGroup>
        {form.formState.errors.email && (
          <span className="text-destructive text-sm">
            {form.formState.errors.email.message}
          </span>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="password"
            className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Password
          </label>
          <Link
            href="/sign-in"
            className="text-primary text-sm font-medium underline-offset-4 hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <InputGroup className="h-10">
          <InputGroupAddon>
            <Lock className="size-4" />
          </InputGroupAddon>
          <InputGroupInput
            id="password"
            type="password"
            placeholder="••••••••"
            {...form.register("password")}
            required
          />
        </InputGroup>
        {form.formState.errors.password && (
          <span className="text-destructive text-sm">
            {form.formState.errors.password.message}
          </span>
        )}
      </div>

      <Button type="submit" className="h-10 w-full" disabled={isAuthenticating}>
        {form.formState.isSubmitting ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
}
