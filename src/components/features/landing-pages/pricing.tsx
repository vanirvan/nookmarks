import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function Pricing() {
  return (
    <section id="pricing" className="relative w-full overflow-hidden">
      <div className="px-4 xl:px-0 w-full max-w-5xl py-24 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="flex flex-col gap-6 text-center md:text-left">
            <h2 className="text-3xl font-bold tracking-tight sm:text-5xl flex items-center justify-center md:justify-start gap-1">
              <span>
                Nookmarks is <span className="text-primary italic">Free</span>
              </span>
              <Tooltip>
                <TooltipTrigger className="cursor-help text-primary text-2xl leading-none font-black -translate-y-2">
                  *
                </TooltipTrigger>
                <TooltipContent
                  align="end"
                  className="max-w-xs font-normal text-sm tracking-normal text-left sm:text-center text-balance leading-relaxed"
                >
                  While Nookmarks is free, there are a few limitations. You'll
                  be limited in uploading images and using AI features unless
                  you use your own API key.
                </TooltipContent>
              </Tooltip>
            </h2>
            <h3 className="font-bold tracking-tight text-5xl sm:text-7xl text-primary italic">
              FOREVER
            </h3>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-md mx-auto md:mx-0">
              We believe that everyone should have access to tools that help
              them curate their digital libraries. That's why we're committed to
              keeping Nookmarks free for all users.
            </p>
          </div>

          <div className="relative w-full bg-card shadow rounded-2xl p-8 sm:p-10 border overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Heart className="w-32 h-32" />
            </div>

            <div className="relative z-10 flex flex-col gap-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium w-fit">
                <Heart className="w-4 h-4" />
                <span>Support the project</span>
              </div>

              <h3 className="text-2xl font-bold">Keep Nookmarks alive</h3>

              <p className="text-muted-foreground leading-relaxed">
                While Nookmarks will always be free, server costs and continuous
                development require resources. If you find value in our tool,
                consider chipping in!
              </p>

              <p className="text-muted-foreground leading-relaxed">
                Your support helps us keep the servers running and actively
                build new features.
              </p>

              <div className="pt-4">
                <Button
                  size="lg"
                  className="w-full sm:w-auto font-semibold gap-2"
                >
                  <Heart className="w-4 h-4" fill="currentColor" />
                  Donate & Support Us
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
