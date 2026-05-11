"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Mail, User } from "lucide-react";
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
  type SignUpValues,
  signUpSchema,
} from "@/services/features/auth-pages/schema/auth-schema";
import { useAuthUIStore } from "@/services/features/auth-pages/store/auth-ui.store";

export function SignUpForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const { isAuthenticating, setIsAuthenticating } = useAuthUIStore();

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignUpValues) => {
    setIsAuthenticating(true);
    setError(null);
    try {
      const { error: signUpError } = await authClient.signUp.email({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      if (signUpError) {
        setError(signUpError.message || "Failed to create account");
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

      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="text-sm leading-none font-medium">
          Full Name
        </label>
        <InputGroup className="h-10">
          <InputGroupAddon>
            <User className="size-4" />
          </InputGroupAddon>
          <InputGroupInput
            id="name"
            type="text"
            placeholder="John Doe"
            {...form.register("name")}
            required
          />
        </InputGroup>
        {form.formState.errors.name && (
          <span className="text-destructive text-sm">
            {form.formState.errors.name.message}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm leading-none font-medium">
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

      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-sm leading-none font-medium">
          Password
        </label>
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
        {form.formState.isSubmitting ? "Creating account..." : "Sign Up"}
      </Button>
    </form>
  );
}
