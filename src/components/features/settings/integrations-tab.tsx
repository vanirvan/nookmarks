"use client";

import { Globe, GripVertical } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function IntegrationsTab() {
  const [bookmarkletUrl, setBookmarkletUrl] = useState("");
  const linkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const origin = window.location.origin;
      const code = `javascript:(function(){var url=encodeURIComponent(window.location.href);var title=encodeURIComponent(document.title);window.open('${origin}/app?add-url='+url+'&add-title='+title,'nookmarks_add','width=600,height=550,personalbar=0,toolbar=0,scrollbars=1,resizable=1');})();`;
      setBookmarkletUrl(code);
    }
  }, []);

  useEffect(() => {
    if (bookmarkletUrl && linkRef.current) {
      linkRef.current.setAttribute("href", bookmarkletUrl);
    }
  }, [bookmarkletUrl]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Integrations & Extension</h3>
        <p className="text-sm text-muted-foreground">
          Integrate Nookmarks with your browser and other services.
        </p>
      </div>

      <Card className="border border-border bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Browser Bookmarklet</CardTitle>
          </div>
          <CardDescription>
            Save any web page to Nookmarks with a single click using our
            draggable bookmarklet button.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-lg bg-muted/20">
            {bookmarkletUrl ? (
              <a
                ref={linkRef}
                href="#"
                onClick={(e) => e.preventDefault()}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg shadow-md hover:bg-primary/95 transition-all cursor-grab active:cursor-grabbing select-none"
              >
                <GripVertical className="h-4 w-4 opacity-75" />
                Drag to Bookmarks Bar
              </a>
            ) : (
              <span className="text-xs text-muted-foreground">
                Generating bookmarklet...
              </span>
            )}
            <span className="text-xs text-muted-foreground mt-3 text-center max-w-sm">
              Drag the button above directly to your browser&apos;s bookmarks
              bar or favorites bar.
            </span>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">How to use:</p>
            <ol className="list-decimal list-inside space-y-1 pl-1">
              <li>
                Make sure your browser&apos;s Bookmarks/Favorites bar is visible
                (Ctrl+Shift+B or Cmd+Shift+B).
              </li>
              <li>
                Drag the premium button above to your browser&apos;s bookmark
                bar.
              </li>
              <li>
                Visit any website you want to save, and click the bookmarklet in
                your bookmark bar.
              </li>
              <li>
                A compact popup will open, automatically pre-filling the URL and
                title!
              </li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
