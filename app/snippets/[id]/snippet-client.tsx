"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Copy, Check, Share2, Heart } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  nightOwl,
  gruvboxLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { toggleLikeSnippet } from "@/actions/snippet";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { PopularSnippetCard } from "@/components/snippets/popular-snippet-card";

interface SnippetClientProps {
  snippet: any;
  userHasLiked?: boolean;
  popularSnippets?: any[];
}

export default function SnippetClient({
  snippet,
  userHasLiked = false,
  popularSnippets = [],
}: SnippetClientProps) {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [copied, setCopied] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Track like state locally for immediate UI feedback
  const [isLiked, setIsLiked] = useState(userHasLiked);
  const [likeCount, setLikeCount] = useState(snippet._count?.likes || 0);
  const [isLikeProcessing, setIsLikeProcessing] = useState(false);
  const [animateLike, setAnimateLike] = useState(false);

  // This effect runs once on component mount to sync with client-side theme
  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize like state from props
  useEffect(() => {
    setIsLiked(userHasLiked);
  }, [userHasLiked]);

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

  const handleLikeToggle = async () => {
    // Prevent multiple rapid clicks
    if (isLikeProcessing) return;

    try {
      setIsLikeProcessing(true);

      // Optimistic UI update - happens immediately
      const newLikeState = !isLiked;
      setIsLiked(newLikeState);

      // Add animation effect when liking
      if (newLikeState) {
        setAnimateLike(true);
        setTimeout(() => setAnimateLike(false), 1000);
      }

      // Update count immediately for responsive feel
      setLikeCount((prevCount: number) =>
        newLikeState ? prevCount + 1 : Math.max(0, prevCount - 1)
      );

      // Subtle toast for immediate feedback
      // toast.success(newLikeState ? "Liked!" : "Removed like", {
      //   duration: 1500,
      //   position: 'bottom-right'
      // });

      // Make API call in the background
      const result = await toggleLikeSnippet(snippet.id);

      // Handle API failure by reverting the UI
      if (!result.success) {
        // Revert optimistic update if API call fails
        setIsLiked(!newLikeState);
        setLikeCount((prevCount: number) =>
          !newLikeState ? prevCount + 1 : Math.max(0, prevCount - 1)
        );
        toast.error(result.error || "Failed to update like");
        return;
      }

      // No need for additional UI updates on success since we already did them optimistically

      // Refresh the page data in the background for consistency
      // Adding a small delay to ensure UI animations complete first
      setTimeout(() => router.refresh(), 300);
    } catch (error) {
      console.error("Error toggling like:", error);

      // Revert optimistic update on error
      setIsLiked(!isLiked);
      setLikeCount((prevCount: number) =>
        isLiked ? prevCount + 1 : Math.max(0, prevCount - 1)
      );
      toast.error("Something went wrong. Please try again.");
    } finally {
      // Short delay before allowing another like action for better UX
      setTimeout(() => setIsLikeProcessing(false), 300);
    }
  };

  // Detect theme on client-side to ensure correct syntax highlighting
  const syntaxTheme =
    !mounted || typeof window === "undefined"
      ? gruvboxLight
      : resolvedTheme === "dark" ||
          (resolvedTheme === "system" &&
            window.matchMedia("(prefers-color-scheme: dark)").matches)
        ? nightOwl
        : gruvboxLight;

  if (!snippet) return null;

  // Get the author's slug for navigation
  const authorSlug = snippet.author?.slug;

  return (
    <div className="h-[calc(100vh-8rem)] grid gap-6 lg:grid-cols-[1fr,320px] overflow-hidden">
      {/* Main Content - Scrollable */}
      <div className="overflow-y-auto pr-2 scrollbar-hide">
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <CardHeader className="border-b p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold">{snippet.title}</h2>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      {/* Make both avatar and name clickable to navigate to author's profile */}
                      <Link
                        href={`/${authorSlug}`}
                        className="flex items-center space-x-2 hover:text-foreground transition-colors"
                      >
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={snippet.author?.image || "/placeholder.svg"}
                          />
                          <AvatarFallback>
                            {snippet.author?.name?.[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="hover:underline">
                          {snippet.author?.name}
                        </span>
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
                          return "Unknown date";
                        } catch (e) {
                          console.error("Date formatting error:", e);
                          return "Unknown date";
                        }
                      })()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {/* Enhanced Like Button with Animation */}
                  <Button
                    variant={isLiked ? "default" : "outline"}
                    size="sm"
                    onClick={handleLikeToggle}
                    className={cn(
                      isLiked ? "bg-rose-600 hover:bg-rose-700" : "",
                      "relative overflow-hidden transition-all",
                      animateLike && "animate-pulse"
                    )}
                    disabled={isLikeProcessing}
                  >
                    <Heart
                      className={cn(
                        "mr-1 h-4 w-4 transition-all duration-300",
                        isLiked ? "fill-white" : "",
                        animateLike && "scale-125"
                      )}
                      strokeWidth={isLiked ? 0 : 2}
                    />
                    <span
                      className={cn(
                        "transition-all duration-300",
                        animateLike && "font-semibold"
                      )}
                    >
                      {likeCount > 0 && likeCount}
                    </span>

                    {/* Visual feedback ripple effect when clicked */}
                    {animateLike && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="animate-ping absolute h-full w-full rounded-full bg-rose-400 opacity-30"></span>
                      </span>
                    )}
                  </Button>

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
                    <span className="font-medium text-foreground">
                      Framework:
                    </span>{" "}
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
      </div>

      {/* Popular Snippets Sidebar - Separate Scrollable Area */}
      <div className="h-full flex flex-col max-h-full">
        {/* Fixed Header */}
        <div className="flex-shrink-0 pb-4">
          <h3 className="text-lg font-semibold">Popular Snippets</h3>
        </div>

        {/* Scrollable Content Area with explicit height */}
        <div
          className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 scrollbar-hide"
          style={{ maxHeight: "calc(100vh - 12rem)" }}
        >
          <div className="space-y-4 pr-2 pb-4">
            {popularSnippets.length > 0 ? (
              popularSnippets
                .filter((popularSnippet) => popularSnippet.id !== snippet.id) // Don't show current snippet
                .map((popularSnippet) => (
                  <PopularSnippetCard
                    key={popularSnippet.id}
                    snippet={popularSnippet}
                  />
                ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm">
                  No popular snippets found
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Fixed Footer */}
        {popularSnippets.length > 0 && (
          <div className="flex-shrink-0 pt-4 border-t bg-background">
            <div className="text-center">
              <Link
                href="/snippets"
                className="text-sm text-primary hover:underline"
              >
                View all snippets →
              </Link>
            </div>
          </div>
        )}
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
