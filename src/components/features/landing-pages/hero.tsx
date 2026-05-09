import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section id="hero" className="relative w-full overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage: `
            linear-gradient(oklch(from var(--primary) l c h / 0.15) 1px, transparent 1px), 
            linear-gradient(to right, oklch(from var(--primary) l c h / 0.15) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          maskImage: "linear-gradient(to bottom left, black, transparent 75%)",
          WebkitMaskImage:
            "linear-gradient(to bottom left, black, transparent 75%)",
        }}
      />
      <div className="mx-auto w-full max-w-5xl px-4 py-32 sm:py-48 lg:py-64 xl:px-0">
        <div className="flex gap-6">
          <div className="flex flex-col gap-6">
            <h1 className="flex flex-col font-semibold text-3xl sm:text-5xl lg:text-5xl max-w-xl">
              <span>
                Unified Your <span className="text-primary">Bookmarks</span>
              </span>
              <span>
                Across <span className="text-primary">All Browsers</span>
              </span>
            </h1>

            <h2 className="max-w-xl font-medium text-foreground/50">
              Easily manage all of your bookmarks across all browser, perfect
              for you who's working on different browsers and devices, everyday.
            </h2>
            <div className="flex items-center gap-2">
              <Link href="/sign-in">
                <Button>Get Started for free</Button>
              </Link>
              <Button variant={"secondary"} className={"font-normal"}>
                Install Extensions <span className="font-semibold">(Soon)</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
