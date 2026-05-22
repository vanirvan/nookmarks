"use client";

import {
  CheckCircle2,
  Eye,
  EyeOff,
  Globe,
  GripVertical,
  Key,
  Loader2,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  deleteUserApiKey,
  getUserApiKeyStatus,
  saveUserApiKey,
  testUserApiKey,
} from "@/services/features/settings/actions/settings.actions";

export function IntegrationsTab() {
  const [bookmarkletUrl, setBookmarkletUrl] = useState("");
  const linkRef = useRef<HTMLAnchorElement>(null);

  // Gemini API Key (BYOK) State
  const [keyStatus, setKeyStatus] = useState<{
    hasKey: boolean;
    isValid: boolean;
    lastTestedAt: string | null;
  } | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [isDeletingKey, setIsDeletingKey] = useState(false);
  const [showKey, setShowKey] = useState(false);

  // States for 2-button Test & Save workflow
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [isTestedSuccess, setIsTestedSuccess] = useState(false);
  const [testedKey, setTestedKey] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const origin = window.location.origin;
      const code = `javascript:(function(){var url=encodeURIComponent(window.location.href);var title=encodeURIComponent(document.title);window.open('${origin}/app?add-url='+url+'&add-title='+title,'nookmarks_add','width=600,height=550,personalbar=0,toolbar=0,scrollbars=1,resizable=1');})();`;
      setBookmarkletUrl(code);
    }
    fetchKeyStatus();
  }, []);

  const fetchKeyStatus = async () => {
    setIsLoadingStatus(true);
    try {
      const result = await getUserApiKeyStatus({});
      if (result.success) {
        setKeyStatus(result.data);
      }
    } catch {
      toast.error("Failed to load Gemini API key status.");
    } finally {
      setIsLoadingStatus(false);
    }
  };

  const handleTestKey = async () => {
    const trimmedKey = apiKeyInput.trim();
    if (!trimmedKey) {
      toast.error("Please enter a Gemini API Key to test.");
      return;
    }

    setIsTestingKey(true);
    setIsTestedSuccess(false);
    setTestedKey("");

    try {
      const result = await testUserApiKey({ geminiApiKey: trimmedKey });
      if (result.success) {
        toast.success("Gemini API Key tested successfully and is valid!");
        setIsTestedSuccess(true);
        setTestedKey(trimmedKey);
      } else {
        toast.error(result.error || "Gemini API Key validation failed.");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Test Error: ${msg}`);
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedKey = apiKeyInput.trim();
    if (!trimmedKey) {
      toast.error("Please enter a valid Gemini API Key.");
      return;
    }

    if (!isTestedSuccess || trimmedKey !== testedKey) {
      toast.error("Please test the exact API key successfully before saving.");
      return;
    }

    setIsSavingKey(true);
    try {
      const result = await saveUserApiKey({ geminiApiKey: trimmedKey });
      if (result.success) {
        toast.success("Gemini API Key saved successfully!");
        setApiKeyInput("");
        setIsTestedSuccess(false);
        setTestedKey("");
        await fetchKeyStatus();
      } else {
        toast.error(result.error || "Failed to save API Key.");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Save Error: ${msg}`);
    } finally {
      setIsSavingKey(false);
    }
  };

  const handleDeleteKey = async () => {
    setIsDeletingKey(true);
    try {
      const result = await deleteUserApiKey({});
      if (result.success) {
        toast.success("Gemini API Key removed successfully.");
        await fetchKeyStatus();
      } else {
        toast.error(result.error || "Failed to remove API Key.");
      }
    } catch {
      toast.error("An error occurred while removing the API Key.");
    } finally {
      setIsDeletingKey(false);
    }
  };

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
          Integrate Nookmarks with your browser and unlock advanced AI features.
        </p>
      </div>

      {/* Browser Bookmarklet Card */}
      <Card className="border border-border bg-card/50 backdrop-blur-sm shadow-xs">
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

      {/* Bring Your Own Key (BYOK) - Gemini API Key */}
      <Card className="border border-border bg-card/50 backdrop-blur-sm shadow-xs">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Gemini API Key (BYOK)</CardTitle>
          </div>
          <CardDescription>
            Unlock unlimited AI metadata extraction, descriptions, and automatic
            tagging by adding your own Google Gemini key.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoadingStatus ? (
            <div className="flex items-center justify-center py-6 text-sm text-muted-foreground gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span>Fetching API key configuration...</span>
            </div>
          ) : keyStatus?.hasKey ? (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-xs">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="space-y-1 text-sm">
                    <p className="font-bold text-foreground flex items-center gap-1.5">
                      API Key Configured
                      <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        Active
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Nookmarks is configured to use your personal Google Gemini
                      API key. Free quotas are ignored.
                    </p>
                    {keyStatus.lastTestedAt && (
                      <p className="text-[10px] font-mono text-muted-foreground">
                        Verified at:{" "}
                        {new Date(keyStatus.lastTestedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteKey}
                  disabled={isDeletingKey}
                  className="shrink-0 gap-1.5 font-semibold"
                >
                  {isDeletingKey ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                  Remove Key
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveKey} className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="geminiKey"
                  className="flex items-center gap-1.5"
                >
                  <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
                  Enter Gemini API Key
                </Label>
                <div className="relative">
                  <Input
                    id="geminiKey"
                    type={showKey ? "text" : "password"}
                    value={apiKeyInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      setApiKeyInput(val);
                      if (val.trim() !== testedKey) {
                        setIsTestedSuccess(false);
                      }
                    }}
                    placeholder="AIzaSy..."
                    className="pr-10 bg-background/60"
                    disabled={isSavingKey || isTestingKey}
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-hidden"
                    tabIndex={-1}
                  >
                    {showKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {isTestedSuccess && apiKeyInput.trim() === testedKey && (
                  <p className="text-xs text-emerald-500 font-semibold flex items-center gap-1.5 mt-1 bg-emerald-500/10 px-2 py-1 rounded-md max-w-fit">
                    <CheckCircle2 className="h-3.5 w-3.5 animate-bounce text-emerald-500" />
                    Key tested successfully and is valid! Ready to save.
                  </p>
                )}
                <p className="text-xs text-muted-foreground leading-normal">
                  Don&apos;t have a Gemini API key? You can get a free one in
                  seconds from{" "}
                  <a
                    href="https://aistudio.google.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary font-semibold hover:underline"
                  >
                    Google AI Studio
                  </a>
                  . You must test the key successfully before saving.
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTestKey}
                  disabled={isTestingKey || isSavingKey || !apiKeyInput.trim()}
                  className="font-semibold"
                >
                  {isTestingKey ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin shrink-0 mr-1.5" />
                      Testing Key...
                    </>
                  ) : isTestedSuccess && apiKeyInput.trim() === testedKey ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mr-1.5" />
                      Tested Valid
                    </>
                  ) : (
                    "Test Key"
                  )}
                </Button>

                <Button
                  type="submit"
                  disabled={
                    isSavingKey ||
                    isTestingKey ||
                    !isTestedSuccess ||
                    apiKeyInput.trim() !== testedKey
                  }
                  className="font-semibold"
                >
                  {isSavingKey ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin shrink-0 mr-1.5" />
                      Saving Key...
                    </>
                  ) : (
                    "Save Key"
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
