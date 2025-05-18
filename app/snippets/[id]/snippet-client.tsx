"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Copy, Check, Share2 } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { nightOwl, gruvboxLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function SnippetClient({ snippet }: { snippet: any }) {
  console.log("teja", snippet);
  const { resolvedTheme } = useTheme();
  const [copied, setCopied] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  // This effect runs once on component mount to sync with client-side theme
  useEffect(() => {
    setMounted(true);
  }, []);

  const copyCode = () => {
    if (!snippet?.code) return;
    navigator.clipboard.writeText(snippet.code);
    setCopied(true);
    toast.success("Code copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareSnippet = () => setIsShareDialogOpen(true);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setLinkCopied(false), 2000);
  };

  // Detect theme on client-side to ensure correct syntax highlighting
  const syntaxTheme = 
    (!mounted || typeof window === 'undefined') ? gruvboxLight :
    (resolvedTheme === 'dark' || 
    (resolvedTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) 
      ? nightOwl 
      : gruvboxLight;

  if (!snippet) return null;

  // Get the author's slug for navigation
  const authorSlug = snippet.author?.slug;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
      <div className="space-y-6">
        <Card className="overflow-hidden">
          <CardHeader className="border-b p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold">{snippet.title}</h2>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    {/* Make both avatar and name clickable to navigate to author's profile */}
                    <Link href={`/${authorSlug}`} className="flex items-center space-x-2 hover:text-foreground transition-colors">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={snippet.author?.image || "/placeholder.svg"} />
                        <AvatarFallback>
                          {snippet.author?.name?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hover:underline">{snippet.author?.name}</span>
                    </Link>
                  </div>
                  <span>•</span>
                  <span>
                    {(() => {
                      try {
                        const date = new Date(snippet.createdAt);
                        // Check if date is valid
                        if (!isNaN(date.getTime())) {
                          return formatDistanceToNow(date, {
                            addSuffix: true,
                          });
                        }
                        return 'Unknown date';
                      } catch (e) {
                        console.error("Date formatting error:", e);
                        return 'Unknown date';
                      }
                    })()}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={shareSnippet}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
                <Button variant="outline" size="sm" onClick={copyCode}>
                  {copied ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy code
                    </>
                  )}
                </Button>
              </div>
            </div>
            <p className="mt-4 text-muted-foreground line-clamp-2">
              {snippet.description}
            </p>
            <div className="mt-4 flex flex-col gap-1 text-sm text-muted-foreground">
              <div>
                <span className="font-medium text-foreground">Language:</span>{" "}
                {snippet.language || (
                  <span className="italic text-gray-400">N/A</span>
                )}
              </div>
              {snippet.framework && (
                <div>
                  <span className="font-medium text-foreground">Framework:</span>{" "}
                  {snippet.framework}
                </div>
              )}
              <div>
                <span className="font-medium text-foreground">Category:</span>{" "}
                {snippet.category || (
                  <span className="italic text-gray-400">N/A</span>
                )}
              </div>
              {snippet.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {snippet.tags.map((tag: string) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="overflow-x-auto p-6 bg-background">
            <SyntaxHighlighter
              language={snippet.language?.toLowerCase() || "plaintext"}
              style={syntaxTheme}
              showLineNumbers
              wrapLines
              className="bg-background"
              customStyle={{
                margin: 0,
                borderRadius: "0.5rem",
                background: "transparent",
                visibility: mounted ? "visible" : "hidden", // Hide until mounted rather than showing skeleton
              }}
            >
              {snippet.code}
            </SyntaxHighlighter>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share snippet</DialogTitle>
            <DialogDescription>
              Share this snippet with others by copying the link below
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <Input
                readOnly
                value={
                  typeof window !== "undefined" ? window.location.href : ""
                }
                className="w-full"
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              className="px-3"
              onClick={copyLink}
            >
              {linkCopied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              <span className="sr-only">Copy link</span>
            </Button>
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => setIsShareDialogOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}