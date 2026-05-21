"use client";

import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileCheck,
  FileCode,
  FolderOpen,
  ListFilter,
  Loader2,
  UploadCloud,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  exportBookmarks,
  importBookmarks,
} from "@/services/features/settings/actions/import-export.actions";
import {
  type ParsedBookmark,
  parseNetscapeBookmarks,
} from "@/services/features/settings/utils/parser";

export function ImportTab() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedBookmark[]>([]);
  const [fileName, setFileName] = useState("");
  const { mutate } = useSWRConfig();

  const triggerMutate = () => {
    mutate((key) => Array.isArray(key) && key[0] === "bookmarks");
    mutate("all-bookmarks-count");
    mutate("unsorted-bookmarks-count");
    mutate("untagged-bookmarks-count");
    mutate("tag-item-counts");
    mutate("tags");
    mutate("collections");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const processFile = async (file: File) => {
    setIsParsing(true);
    setFileName(file.name);
    try {
      const text = await file.text();
      const bookmarks = parseNetscapeBookmarks(text);
      setParsedData(bookmarks);
      if (bookmarks.length === 0) {
        toast.error("No valid bookmarks found in this HTML file.");
      } else {
        toast.success(`Successfully parsed ${bookmarks.length} bookmarks!`);
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while parsing the file.");
      setFileName("");
      setParsedData([]);
    } finally {
      setIsParsing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file.name.endsWith(".html")) {
      await processFile(file);
    } else {
      toast.error("Please drop a valid .html bookmark file.");
    }
  };

  const handleImport = async () => {
    if (parsedData.length === 0) return;
    setIsImporting(true);
    try {
      // 1. Prepare data for import action
      const importPayload = parsedData.map((b) => ({
        url: b.url,
        title: b.title,
        collectionName: b.collectionName,
      }));

      // 2. Call server action
      const result = await importBookmarks(importPayload);
      if (result.success) {
        toast.success(
          `Successfully imported ${result.data.imported} bookmarks!`,
        );
        triggerMutate();
        // Clear selection
        setFileName("");
        setParsedData([]);
      } else {
        toast.error(result.error || "Failed to import bookmarks.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred during import.");
    } finally {
      setIsImporting(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const result = await exportBookmarks(null);
      if (result.success) {
        // Trigger client-side file download
        const blob = new Blob([result.data], { type: "text/html" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `nookmarks_export_${new Date().toISOString().split("T")[0]}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success("Bookmarks exported successfully!");
      } else {
        toast.error(result.error || "Failed to export bookmarks.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred during export.");
    } finally {
      setIsExporting(false);
    }
  };

  // Get unique collections parsed
  const uniqueCollections = Array.from(
    new Set(parsedData.map((b) => b.collectionName).filter(Boolean)),
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Import & Export</h3>
        <p className="text-sm text-muted-foreground">
          Import bookmarks from HTML exports or back up your current vault.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Import Card */}
        <Card className="border border-border bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <UploadCloud className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Import HTML Bookmarks</CardTitle>
            </div>
            <CardDescription>
              Upload a standard Netscape HTML bookmark file from Chrome,
              Firefox, Raindrop.io, etc.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              type="file"
              accept=".html"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />

            {!fileName ? (
              <button
                type="button"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-border hover:border-primary/50 rounded-lg cursor-pointer hover:bg-muted/10 transition-all group"
              >
                <div className="p-3 bg-primary/5 rounded-full group-hover:bg-primary/10 transition-colors">
                  <UploadCloud className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <span className="text-sm font-semibold text-foreground mt-3">
                  Click to upload or drag & drop
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  HTML bookmark file format only
                </span>
              </button>
            ) : (
              <div className="p-4 border border-border bg-muted/20 rounded-lg space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      <FileCode className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate max-w-[200px] md:max-w-[280px]">
                        {fileName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isParsing
                          ? "Parsing file..."
                          : `${parsedData.length} bookmarks parsed`}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7 text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setFileName("");
                      setParsedData([]);
                    }}
                    disabled={isImporting}
                  >
                    Clear
                  </Button>
                </div>

                {parsedData.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-card border border-border/50 rounded-lg flex items-center gap-2">
                      <FileCheck className="h-4 w-4 text-emerald-500" />
                      <div>
                        <p className="font-semibold text-foreground">
                          {parsedData.length}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Bookmarks
                        </p>
                      </div>
                    </div>
                    <div className="p-2 bg-card border border-border/50 rounded-lg flex items-center gap-2">
                      <FolderOpen className="h-4 w-4 text-amber-500" />
                      <div>
                        <p className="font-semibold text-foreground">
                          {uniqueCollections.length}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Collections
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {parsedData.length > 0 && (
                  <Button
                    onClick={handleImport}
                    disabled={isImporting}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    {isImporting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                        <span>Importing...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        <span>Confirm Import ({parsedData.length})</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Export Card */}
        <Card className="border border-border bg-card/50 backdrop-blur-sm flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Export Bookmarks</CardTitle>
            </div>
            <CardDescription>
              Back up your Nookmarks collection. This downloads a standard
              Netscape HTML file compatible with browser imports.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
            <div className="p-4 bg-muted/20 border border-border/50 rounded-lg flex gap-3 items-start text-xs text-muted-foreground">
              <AlertCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">
                  Backup Guarantee
                </p>
                <p className="mt-1">
                  Exported files contain all your bookmarks grouped under their
                  respective collection folders. You can import this file back
                  anytime.
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleExport}
              disabled={isExporting}
              className="w-full mt-4 flex items-center justify-center gap-2 bg-background border-border/80 hover:bg-muted/10"
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                  <span>Generating Backup...</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 shrink-0" />
                  <span>Download Backup HTML</span>
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Parsed Preview Section */}
      {parsedData.length > 0 && (
        <Card className="border border-border bg-card/50 backdrop-blur-sm overflow-hidden">
          <CardHeader className="pb-3 border-b border-border/50">
            <div className="flex items-center gap-2">
              <ListFilter className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-semibold">
                Parsed Bookmarks Preview (First 15)
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[300px] overflow-y-auto divide-y divide-border/30 text-xs">
              {parsedData.slice(0, 15).map((bookmark) => (
                <div
                  key={bookmark.url}
                  className="p-3 hover:bg-muted/5 flex flex-col gap-1 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-foreground truncate max-w-[280px] md:max-w-[400px]">
                      {bookmark.title}
                    </span>
                    {bookmark.collectionName && (
                      <span className="shrink-0 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium text-[10px]">
                        {bookmark.collectionName}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground truncate select-all">
                    {bookmark.url}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
