import Link from "next/link";
import { AuthGithubButton } from "@/components/features/auth/auth-github-button";
import { AuthGoogleButton } from "@/components/features/auth/auth-google-button";
import { SignUpForm } from "@/components/features/auth/sign-up-form";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen w-full flex-col lg:flex-row">
      {/* Left Side: Form */}
      <div className="relative flex w-full flex-col items-center justify-center p-8 lg:w-1/2 xl:p-12">
        <div className="absolute top-4 right-4">
          <AnimatedThemeToggler />
        </div>

        <div className="w-full max-w-md flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <Link
              href="/"
              className="inline-block text-2xl font-bold tracking-tight transition-opacity hover:opacity-80"
            >
              Nookmarks
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">
              Create an account
            </h1>
            <p className="text-muted-foreground">
              Enter your details to get started with Nookmarks
            </p>
          </div>

          <SignUpForm />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background text-muted-foreground px-2">
                Or join with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <AuthGoogleButton />
            <AuthGithubButton />
          </div>

          <p className="text-muted-foreground text-center text-sm">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="text-primary font-medium underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side: Illustration Placeholder */}
      <div className="relative hidden w-1/2 flex-col items-center justify-center overflow-hidden bg-muted/50 lg:flex">
        <div className="relative z-10 flex flex-col items-center px-12 text-center">
          <div className="mb-6 rounded-2xl border border-border bg-background/50 p-4 backdrop-blur-sm">
            <div className="flex size-16 items-center justify-center rounded-xl bg-linear-to-br from-chart-1 to-chart-2 shadow-2xl">
              <span className="text-3xl font-black text-primary-foreground">
                N
              </span>
            </div>
          </div>
          <h2 className="mb-4 text-4xl font-bold tracking-tight text-foreground">
            Join the collective
          </h2>
          <p className="max-w-md text-lg text-muted-foreground">
            Start organizing your digital life today. It's free to get started
            and built for privacy.
          </p>
        </div>

        {/* Glow effect at corners */}
        <div className="absolute -right-24 -bottom-24 size-96 rounded-full bg-chart-1/20 blur-[120px]" />
        <div className="absolute -top-24 -left-24 size-96 rounded-full bg-chart-2/20 blur-[120px]" />
      </div>
    </main>
  );
}
