const features = [
  {
    title: "Effortless Organization",
    description:
      "Categorize your bookmarks through tags, filters, and collections for instant access whenever you need them.",
    illustration: (
      <div className="absolute bottom-0 left-0 w-full flex justify-center translate-y-4">
        <div className="w-48 h-48 bg-muted rounded-t-xl overflow-hidden shadow-inner border border-b-0" />
      </div>
    ),
  },
  {
    title: "Visual Snapshots",
    description:
      "Save images instead of URLs. Perfect for capturing specific information without the clutter of a full webpage.",
    illustration: (
      <div className="absolute -right-8 top-1/2 -translate-y-1/2 w-32 h-32 bg-muted rounded-full opacity-50" />
    ),
  },
  {
    title: "Deep Focus Projects",
    description:
      "Create isolated projects. Bookmarks stay strictly tied to their project, keeping your workspace clean and organized.",
    illustration: (
      <div className="absolute bottom-4 right-4 w-24 h-24 bg-primary/20 rounded-lg rotate-12" />
    ),
  },
  {
    title: "AI Smart Tags",
    description:
      "Drop a link and let AI decide the tags. It intelligently analyzes content and categorizes it automatically.",
    illustration: (
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/20 rounded-full blur-2xl" />
    ),
  },
];

export function Feature() {
  return (
    <section
      id="feature"
      className="relative w-full overflow-hidden bg-background"
    >
      <div className="px-4 xl:px-0 w-full max-w-5xl py-24 mx-auto flex flex-col gap-16">
        <div className="flex flex-col text-center sm:text-left gap-6">
          <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
            Organize with <span className="text-primary italic">purpose.</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
            Stop searching and start finding. Nookmarks gives you the tools to
            curate your digital library with precision and ease.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {features.map((feature) => {
            return (
              <div
                key={feature.title}
                className="relative w-full h-full bg-card aspect-square shadow rounded-xl p-6 overflow-hidden"
              >
                <div className="relative z-10 flex flex-col gap-4 items-center *:text-center">
                  <h1 className="font-semibold text-3xl">{feature.title}</h1>
                  <h2 className="text-muted-foreground text-sm">
                    {feature.description}
                  </h2>
                </div>

                {feature.illustration}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
