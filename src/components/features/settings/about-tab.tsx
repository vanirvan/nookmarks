"use client";

import { Code, Heart, Info, Landmark } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function AboutTab() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">About Nookmarks</h3>
        <p className="text-sm text-muted-foreground">
          Application information, version specs, and credits.
        </p>
      </div>

      <Card className="border border-border bg-card/50 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -mr-8 -mt-8" />
        <CardContent className="pt-6 space-y-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-xl text-primary shrink-0">
              <Landmark className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-lg">Nookmarks</h4>
                <Badge
                  variant="default"
                  className="text-[10px] uppercase font-bold py-0 h-5"
                >
                  v1.2.0
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Next-generation self-hosted bookmark manager with nested tag
                structures, smart AI metadata parsing, and powerful multi-layout
                filtering.
              </p>
            </div>
          </div>

          <hr className="border-border/50" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-primary shrink-0" />
              <span className="text-muted-foreground">Environment:</span>
              <span className="font-medium font-mono text-xs">Production</span>
            </div>
            <div className="flex items-center gap-2">
              <Code className="h-4 w-4 text-primary shrink-0" />
              <span className="text-muted-foreground">GitHub Repo:</span>
              <a
                href="https://github.com/vanirvan/nookmarks"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-primary hover:underline"
              >
                vanirvan/nookmarks
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <span>Made with</span>
        <Heart className="h-3 w-3 text-red-500 fill-red-500 animate-pulse" />
        <span>by</span>
        <span className="font-semibold text-foreground">vanirvan</span>
        <span>&copy; {new Date().getFullYear()}</span>
      </div>
    </div>
  );
}
