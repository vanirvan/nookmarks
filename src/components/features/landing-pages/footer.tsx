export function Footer() {
  return (
    <section id="footer" className="relative w-full">
      <div className="relative w-full max-w-5xl mx-auto px-4 xl:px-0 py-6 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Nookmarks
          </span>
          <span className="text-sm text-muted-foreground">
            Built by{" "}
            <a href="https://vanirvan.site" className="underline">
              Vanirvan
            </a>
          </span>
        </div>
      </div>
    </section>
  );
}
