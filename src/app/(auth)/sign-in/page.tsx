import Link from "next/link";
import { AuthGithubButton } from "@/components/features/auth/auth-github-button";
import { AuthGoogleButton } from "@/components/features/auth/auth-google-button";
import { SignInForm } from "@/components/features/auth/sign-in-form";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";

export default function SignInPage() {
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
              className="inline-block text-3xl font-bold tracking-tight transition-opacity hover:opacity-80"
            >
              Nookmarks
            </Link>
            <p className="text-muted-foreground">
              Enter your credentials to access your account
            </p>
          </div>

          <SignInForm />

          <div className="grid grid-cols-2 gap-4">
            <AuthGoogleButton />
            <AuthGithubButton />
          </div>

          <p className="text-muted-foreground text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link
              href="/sign-up"
              className="text-primary font-medium underline-offset-4 hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
      {/* Right Side: Illustration Placeholder */}
      <div className="relative hidden w-1/2 flex-col items-center justify-center overflow-hidden bg-muted/50 lg:flex">
        <div className="relative z-10 flex flex-col items-center px-12 text-center">
          <div className="mb-6 rounded-2xl border border-border bg-background/50 p-4 backdrop-blur-sm">
            <div className="flex size-16 items-center justify-center rounded-xl bg-linear-to-br from-primary to-chart-2 shadow-2xl">
              <span className="text-3xl font-black text-primary-foreground">
                N
              </span>
            </div>
          </div>
          <h2 className="mb-4 text-4xl font-bold tracking-tight text-foreground">
            Curate your digital workspace
          </h2>
          <p className="max-w-md text-lg text-muted-foreground">
            Seamlessly organize, tag, and search through your bookmarks with
            power and elegance.
          </p>
        </div>

        {/* Glow effect at corners */}
        <div className="absolute -bottom-24 -left-24 size-96 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute -top-24 -right-24 size-96 rounded-full bg-chart-2/20 blur-[120px]" />
      </div>
    </main>
  );
}

// import { Button } from "#/components/ui/button";
// import {
//   InputGroup,
//   InputGroupAddon,
//   InputGroupInput,
// } from "#/components/ui/input-group";
// import { authClient } from "#/lib/auth-client";
// import { Github, Lock, Mail } from "lucide-react";
// import { useState } from "react";

// import { useForm } from "@tanstack/react-form-start";
// import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";

// export const Route = createFileRoute("/auth/login")({
//   component: LoginPage,
// });

// function LoginPage() {
//   const [pending, setPending] = useState(false);
//   const navigate = useNavigate();

//   const form = useForm({
//     defaultValues: {
//       email: "",
//       password: "",
//     },
//     onSubmit: async ({ value }) => {
//       setPending(true);
//       const { error } = await authClient.signIn.email({
//         email: value.email,
//         password: value.password,
//         callbackURL: "/app",
//       });
//       setPending(false);
//       if (error) {
//         console.log(error);

//         form.setFieldMeta("email", (prev) => ({
//           ...prev,
//           errorMap: { ...prev.errorMap, onSubmit: error.message },
//         }));
//         form.setFieldMeta("password", (prev) => ({
//           ...prev,
//           errorMap: { ...prev.errorMap, onSubmit: error.message },
//         }));
//       } else {
//         navigate({ to: "/app" });
//       }
//     },
//   });

//   const handleSocialSignIn = async (provider: "github" | "google") => {
//     await authClient.signIn.social({
//       provider,
//       callbackURL: "/app",
//     });
//   };

//   return (
//     <div className="flex min-h-screen w-full flex-col lg:flex-row">
//       {/* Left Side: Form */}
//       <div className="flex w-full flex-col items-center justify-center p-8 lg:w-1/2 xl:p-12">
//         <div className="w-full max-w-md space-y-8">
//           <div className="space-y-2">
//             <Link
//               to="/"
//               className="inline-block text-3xl font-bold tracking-tight transition-opacity hover:opacity-80"
//             >
//               Nookmarks
//             </Link>
//             <p className="text-muted-foreground">
//               Enter your credentials to access your account
//             </p>
//           </div>

//           <form
//             onSubmit={(e) => {
//               e.preventDefault();
//               e.stopPropagation();
//               form.handleSubmit();
//             }}
//             className="space-y-4"
//           >
//             <div className="space-y-2">
//               <label className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
//                 Email
//               </label>
//               <form.Field
//                 name="email"
//                 children={(field) => (
//                   <>
//                     <InputGroup className="h-10">
//                       <InputGroupAddon>
//                         <Mail className="size-4" />
//                       </InputGroupAddon>
//                       <InputGroupInput
//                         type="email"
//                         name={field.name}
//                         value={field.state.value}
//                         onBlur={field.handleBlur}
//                         onChange={(e) => field.handleChange(e.target.value)}
//                         placeholder="name@example.com"
//                         required
//                       />
//                     </InputGroup>
//                     {field.state.meta.errors.length > 0 && (
//                       <span className="text-destructive text-sm">
//                         {field.state.meta.errors.join(", ")}
//                       </span>
//                     )}
//                   </>
//                 )}
//               />
//             </div>

//             <div className="space-y-2">
//               <div className="flex items-center justify-between">
//                 <label className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
//                   Password
//                 </label>
//                 <Link
//                   to="/auth/login"
//                   className="text-primary text-sm font-medium underline-offset-4 hover:underline"
//                 >
//                   Forgot password?
//                 </Link>
//               </div>
//               <form.Field
//                 name="password"
//                 children={(field) => (
//                   <>
//                     <InputGroup className="h-10">
//                       <InputGroupAddon>
//                         <Lock className="size-4" />
//                       </InputGroupAddon>
//                       <InputGroupInput
//                         type="password"
//                         name={field.name}
//                         value={field.state.value}
//                         onBlur={field.handleBlur}
//                         onChange={(e) => field.handleChange(e.target.value)}
//                         placeholder="••••••••"
//                         required
//                       />
//                     </InputGroup>
//                     {field.state.meta.errors.length > 0 && (
//                       <span className="text-destructive text-sm">
//                         {field.state.meta.errors.join(", ")}
//                       </span>
//                     )}
//                   </>
//                 )}
//               />
//             </div>

//             <form.Subscribe
//               selector={(state) => [state.canSubmit, state.isSubmitting]}
//               children={([canSubmit, isSubmitting]) => (
//                 <Button
//                   type="submit"
//                   className="h-10 w-full"
//                   disabled={pending || isSubmitting || !canSubmit}
//                 >
//                   {pending || isSubmitting ? "Signing in..." : "Sign In"}
//                 </Button>
//               )}
//             />
//           </form>

//           <div className="relative">
//             <div className="absolute inset-0 flex items-center">
//               <span className="w-full border-t" />
//             </div>
//             <div className="relative flex justify-center text-xs uppercase">
//               <span className="bg-background text-muted-foreground px-2">
//                 Or continue with
//               </span>
//             </div>
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <Button
//               variant="outline"
//               className="h-10"
//               onClick={() => handleSocialSignIn("google")}
//               disabled={pending}
//             >
//               <svg className="mr-2 size-4" viewBox="0 0 24 24">
//                 <path
//                   d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
//                   fill="#4285F4"
//                 />
//                 <path
//                   d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
//                   fill="#34A853"
//                 />
//                 <path
//                   d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.27.81-.57z"
//                   fill="#FBBC05"
//                 />
//                 <path
//                   d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
//                   fill="#EA4335"
//                 />
//               </svg>
//               Google
//             </Button>
//             <Button
//               variant="outline"
//               className="h-10"
//               onClick={() => handleSocialSignIn("github")}
//               disabled={pending}
//             >
//               <Github className="mr-2 size-4" />
//               GitHub
//             </Button>
//           </div>

//           <p className="text-muted-foreground text-center text-sm">
//             Don&apos;t have an account?{" "}
//             <Link
//               to="/auth/register"
//               className="text-primary font-medium underline-offset-4 hover:underline"
//             >
//               Sign up
//             </Link>
//           </p>
//         </div>
//       </div>

//       {/* Right Side: Illustration Placeholder */}
//       <div className="relative hidden w-1/2 flex-col items-center justify-center overflow-hidden bg-neutral-950 lg:flex">
//         <div className="relative z-10 flex flex-col items-center px-12 text-center">
//           <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
//             <div className="flex size-16 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 shadow-2xl">
//               <span className="text-3xl font-black text-white">N</span>
//             </div>
//           </div>
//           <h2 className="mb-4 text-4xl font-bold tracking-tight text-white">
//             Curate your digital workspace
//           </h2>
//           <p className="max-w-md text-lg text-neutral-400">
//             Seamlessly organize, tag, and search through your bookmarks with
//             power and elegance.
//           </p>
//         </div>

//         {/* Glow effect at corners */}
//         <div className="absolute -bottom-24 -left-24 size-96 rounded-full bg-indigo-500/20 blur-[120px]" />
//         <div className="absolute -top-24 -right-24 size-96 rounded-full bg-purple-500/20 blur-[120px]" />
//       </div>
//     </div>
//   );
// }
